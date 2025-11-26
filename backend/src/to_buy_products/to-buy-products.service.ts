import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EstoqueDbService } from '../prisma/estoque-db.service';

import { RegisterPurchaseDto, ProductToBuy } from './dto/compras.dto';
import { EstadoEntrada, Prisma } from '@prisma/estoque-client';


type AuthUser = {
  id: number;
  lojaId: number;
};

@Injectable()
export class ComprasService {
  constructor(private estoqueDb: EstoqueDbService) {}
  
  async findAllToBuy(lojaId: number): Promise<Record<string, ProductToBuy[]>> {
    
    // 1. Busca o estoque de TODAS as lojas
    const estoques = await this.estoqueDb.estoqueLoja.findMany({
      where: {
        produto: { ativo: true },
      },
      include: {
        produto: {
          include: { fornecedor: true },
        },
      },
    });

    // 2. Agrupa o estoque por Produto (Soma as quantidades de todas as lojas)
    const mapaProdutos = new Map<number, { produto: any; totalEstoque: number }>();

    for (const est of estoques) {
      const pid = est.produtoId;
      const atual = mapaProdutos.get(pid);
      
      if (atual) {
        atual.totalEstoque += est.quantidadeEst;
      } else {
        mapaProdutos.set(pid, {
          produto: est.produto,
          totalEstoque: est.quantidadeEst
        });
      }
    }

    // 3. Busca o que já está comprado (Pendente)
    const distribuicoesPendentes = await this.estoqueDb.compraDistribuicao.findMany({
        where: {
          confirmadoEntrada: { in: [EstadoEntrada.PENDENTE, EstadoEntrada.FALTANTE] },
        },
        include: {
          historicoCompra: { select: { produtoId: true } },
        },
    });

    const pendenteMap = new Map<number, number>();
    for (const dist of distribuicoesPendentes) {
      const produtoId = dist.historicoCompra.produtoId;
      const totalAtual = pendenteMap.get(produtoId) ?? 0;
      pendenteMap.set(produtoId, totalAtual + dist.quantidade);
    }

    // 4. Filtra o que precisa comprar
    const productsToBuy: ProductToBuy[] = [];
    
    // Itera sobre os produtos únicos agrupados
    for (const item of mapaProdutos.values()) {
      const { produto, totalEstoque } = item;
      const quantidadePendente = pendenteMap.get(produto.id) ?? 0;

      // Verifica se a soma de todas as lojas + pendente é menor que o máximo
      if (totalEstoque + quantidadePendente < produto.quantidadeMax) {
        productsToBuy.push({
          id: produto.id,
          nome: produto.nome,
          unidade: produto.unidade,
          marca: produto.marca,
          codigo: produto.codigo,
          quantidadeMin: produto.quantidadeMin,
          quantidadeMax: produto.quantidadeMax,
          quantidadeEst: totalEstoque, // Manda o total somado
          quantidadePendenteFaltante: quantidadePendente,
          fornecedor: produto.fornecedor,
        });
      }
    }

    return this.groupProductsByFornecedor(productsToBuy);
  }

  
  async registerPurchase(dto: RegisterPurchaseDto, authUser: AuthUser) {
    const { productId, quantidade, precoTotal } = dto;
    const { id: userId, lojaId } = authUser;

    const produto = await this.estoqueDb.produto.findUnique({
      where: { id: productId },
      select: { fornecedorId: true },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado.');
    }

    return this.estoqueDb.$transaction(async (tx) => {
      
      const novaCompra = await tx.historicoCompra.create({
        data: {
          produtoId: productId,
          quantidade: quantidade,
          // MUDANÇA: Garante que se não vier preço, salva 0.0
          precoTotal: precoTotal || 0.0, 
          responsavelId: userId,
          fornecedorId: produto.fornecedorId,
        },
      });

      // Cria a distribuição inicial (Pendente) para a loja de quem pediu
      await tx.compraDistribuicao.create({
        data: {
          historicoCompraId: novaCompra.id,
          lojaId: lojaId, 
          quantidade: quantidade,
          confirmadoEntrada: EstadoEntrada.PENDENTE,
        },
      });

      return novaCompra;
    });
  }

  
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