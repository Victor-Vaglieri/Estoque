import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, EstadoEntrada } from '@prisma/estoque-client';
import { EstoqueDbService } from '../prisma/estoque-db.service';
import { CreateHistoricBuyDto } from './dto/create-historic-buy.dto';

export interface ProductToBuy {
  nome: string;
  id: number;
  unidade: string;
  marca: string | null;
  quantidadeMin: number;
  quantidadeEst: number;
  quantidadeNec: number;
  quantidadePendenteFaltante: number;
}

@Injectable()
export class ToBuyProductsService { // Nome corrigido
  constructor(private estoqueDb: EstoqueDbService) { }
      async getList(userId: number): Promise<ProductToBuy[]> {
        // 1. Busca produtos que precisam ser comprados (estoque < necessário)
        const productsToBuyRaw = await this.estoqueDb.produto.findMany({
            where: {
                quantidadeNec: {
                    gt: 0 
                },
            },
            select: { 
                id: true,
                nome: true,
                unidade: true,
                marca: true,
                quantidadeEst: true,
                quantidadeMin: true,
                quantidadeNec: true,
            }
        });
        const productsToBuyFiltered = productsToBuyRaw.filter(p => p.quantidadeEst < p.quantidadeNec);

        const productsWithPendingCount = await Promise.all(
            productsToBuyFiltered.map(async (product) => {
                const pendingCount = await this.estoqueDb.historicoCompra.count({
                    where: {
                        produtoId: product.id,
                        confirmadoEntrada: { 
                            in: [EstadoEntrada.PENDENTE, EstadoEntrada.FALTANTE] 
                        }
                    }
                });

                // Retorna um novo objeto com a contagem adicionada
                return {
                    ...product,
                    quantidadePendenteFaltante: pendingCount 
                };
            })
        );

        return productsWithPendingCount;
    }

  async addBuy(userId: number, compraData: CreateHistoricBuyDto) {
    const { productId, quantidade, preco } = compraData;
    // 1. Verificar se o produto existe e pertence ao usuário
    const produto = await this.estoqueDb.produto.findUnique({
      where: {
        id: productId,
      },
    });

    if (!produto) {
      throw new NotFoundException(`Produto com ID ${productId} não encontrado ou não pertence a este usuário.`);
    }

    // 2. Usar uma transação para garantir que ambas as operações funcionem
    try {
      const [novaCompra] = await this.estoqueDb.$transaction([

        // 2a. Criar o registo no HistoricoCompra
        this.estoqueDb.historicoCompra.create({
          data: {
            quantidade: quantidade,
            precoTotal: preco,
            data: new Date(),
            produto: { connect: { id: productId } },
            responsavelId: userId,
          }
        }),
      ]);

      // Retorna o novo registo de compra
      return novaCompra;

    } catch (error) {
      console.error("Erro ao registrar compra e atualizar estoque:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Tratar erros específicos do Prisma se necessário
      }
      throw new BadRequestException("Não foi possível registrar a compra.");
    }
  }
}

