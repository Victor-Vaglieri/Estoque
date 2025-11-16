import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EstoqueDbService } from '../prisma/estoque-db.service';
// MUDANÇA: Importar os tipos necessários
import { RegisterPurchaseDto, ProductToBuy } from './dto/compras.dto';
import { EstadoEntrada, Prisma } from '@prisma/estoque-client';

// O tipo esperado do req.user
type AuthUser = {
  id: number;
  lojaId: number;
};

@Injectable()
export class ComprasService {
  constructor(private estoqueDb: EstoqueDbService) {}

  /**
   * MUDANÇA: Lógica reescrita para ser compatível com o schema
   */
  async findAllToBuy(lojaId: number): Promise<Record<string, ProductToBuy[]>> {
    
    // 1. Busca o estoque de todos os produtos da loja, incluindo os dados do produto e fornecedor
    const estoquesDaLoja = await this.estoqueDb.estoqueLoja.findMany({
      where: {
        lojaId: lojaId,
        produto: {
          ativo: true, // Garante que o produto esteja ativo
        },
      },
      include: {
        produto: {
          include: {
            fornecedor: true, // Inclui o fornecedor
          },
        },
      },
    });

    // 2. Busca TODAS as distribuições pendentes/faltantes para esta loja
    const distribuicoesPendentes =
      await this.estoqueDb.compraDistribuicao.findMany({
        where: {
          lojaId: lojaId,
          confirmadoEntrada: {
            in: [EstadoEntrada.PENDENTE, EstadoEntrada.FALTANTE],
          },
        },
        // Inclui o historicoCompra para sabermos a qual produtoId ele pertence
        include: {
          historicoCompra: {
            select: { produtoId: true },
          },
        },
      });

    // 3. Mapeia as pendências para acesso rápido (ex: { 1: 50, 2: 10 })
    const pendenteMap = new Map<number, number>();
    for (const dist of distribuicoesPendentes) {
      const produtoId = dist.historicoCompra.produtoId;
      const totalAtual = pendenteMap.get(produtoId) ?? 0;
      pendenteMap.set(produtoId, totalAtual + dist.quantidade);
    }

    // 4. Filtra a lista de produtos que realmente precisam de compra
    const productsToBuy: ProductToBuy[] = [];
    for (const estoque of estoquesDaLoja) {
      const produto = estoque.produto;
      const quantidadeEst = estoque.quantidadeEst;
      const quantidadePendente = pendenteMap.get(produto.id) ?? 0;

      // A lógica de "precisa comprar"
      if (quantidadeEst + quantidadePendente < produto.quantidadeMax) {
        productsToBuy.push({
          id: produto.id,
          nome: produto.nome,
          unidade: produto.unidade,
          marca: produto.marca,
          codigo: produto.codigo,
          quantidadeMin: produto.quantidadeMin,
          quantidadeMax: produto.quantidadeMax,
          quantidadeEst: quantidadeEst,
          quantidadePendenteFaltante: quantidadePendente,
          fornecedor: produto.fornecedor, // O objeto Fornecedor inteiro
        });
      }
    }

    // 5. Agrupa a lista final por fornecedor (como o frontend espera)
    return this.groupProductsByFornecedor(productsToBuy);
  }

  /**
   * Registra uma nova compra (cria HistoricoCompra e CompraDistribuicao)
   * Esta função assume que a compra é para a loja do próprio usuário.
   */
  async registerPurchase(dto: RegisterPurchaseDto, authUser: AuthUser) {
    const { productId, quantidade, precoTotal } = dto;
    const { id: userId, lojaId } = authUser;

    // 1. Encontra o fornecedor do produto
    const produto = await this.estoqueDb.produto.findUnique({
      where: { id: productId },
      select: { fornecedorId: true },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado.');
    }

    // 2. Cria o Pedido Mestre e a Distribuição (para a loja do usuário) em uma transação
    return this.estoqueDb.$transaction(async (tx) => {
      // Cria o HistoricoCompra (Pedido Mestre)
      const novaCompra = await tx.historicoCompra.create({
        data: {
          produtoId: productId,
          quantidade: quantidade, // Quantidade total comprada
          precoTotal: precoTotal, // Preço total pago
          responsavelId: userId, // Quem fez o pedido
          fornecedorId: produto.fornecedorId,
        },
      });

      // Cria a Distribuição (para onde vai o item)
      await tx.compraDistribuicao.create({
        data: {
          historicoCompraId: novaCompra.id,
          lojaId: lojaId, // Vai para a loja do usuário que registrou
          quantidade: quantidade, // A quantidade total vai para esta loja
          confirmadoEntrada: EstadoEntrada.PENDENTE, // Define como pendente
        },
      });

      return novaCompra;
    });
  }

  /**
   * Função auxiliar para agrupar os produtos por nome de fornecedor
   */
  private groupProductsByFornecedor(
    products: ProductToBuy[],
  ): Record<string, ProductToBuy[]> {
    return products.reduce((acc, product) => {
      const fornecedorNome = product.fornecedor?.nome || 'Fornecedor Desconhecido';
      if (!acc[fornecedorNome]) {
        acc[fornecedorNome] = [];
      }
      acc[fornecedorNome].push(product);
      return acc;
    }, {} as Record<string, ProductToBuy[]>);
  }
}