import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
// Assumindo que você tem um enum EstadoEntrada no seu schema.prisma
import { Prisma, EstadoEntrada } from '@prisma/estoque-client'; 
import { EstoqueDbService } from '../prisma/estoque-db.service'; // Ajuste o caminho se necessário
import { CreateHistoricBuyDto } from './dto/create-historic-buy.dto';

// Interface atualizada para incluir a contagem de compras pendentes/faltantes
export interface ProductToBuy {
    nome: string;
    id: number;
    unidade: string;
    marca: string | null;
    quantidadeMin: number; 
    quantidadeEst: number;
    quantidadeNec: number;
    quantidadePendenteFaltante: number; // Nova propriedade
}

@Injectable()
export class ToBuyProductsService { 
    constructor(private estoqueDb: EstoqueDbService) {}

    /**
     * Lógica para o GET /to-buy-products
     * Retorna a lista de produtos onde o estoque está abaixo do necessário.
     */
    async getList(userId: number): Promise<ProductToBuy[]> {
        // 1. Busca produtos que precisam ser comprados (estoque < necessário)
        const productsToBuyRaw = await this.estoqueDb.produto.findMany({
            where: {
                quantidadeNec: {
                    gt: 0 
                }, ativo: true,

                quantidadeEst: { 
                    lt: this.estoqueDb.produto.fields.quantidadeNec 
                }
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
        
        const productsWithPendingCount = await Promise.all(
            productsToBuyRaw.map(async (product) => {
                
                const pendingAggregation = await this.estoqueDb.historicoCompra.aggregate({
                    _sum: {
                        quantidade: true
                    },
                    where: {
                        produtoId: product.id,
                        confirmadoEntrada: { 
                            in: [EstadoEntrada.PENDENTE, EstadoEntrada.FALTANTE] 
                        }
                    }
                });

                const pendingQuantitySum = pendingAggregation._sum.quantidade || 0;
                return {
                    ...product,
                    quantidadePendenteFaltante: pendingQuantitySum
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
                id: productId, ativo: true
            }, 
        });

        if (!produto) {
            throw new NotFoundException(`Produto com ID ${productId} não encontrado.`);
        }

        try {
             const novaCompra = await this.estoqueDb.historicoCompra.create({
                 data: {
                     quantidade: quantidade,
                     precoTotal: preco, 
                     data: new Date(),
                     confirmadoEntrada: EstadoEntrada.PENDENTE, // Estado inicial
                     produto: { connect: { id: productId } }, 
                     responsavelId: userId 
                 }
             });

            return novaCompra; 

        } catch (error) {
             console.error("Erro ao registrar compra:", error);
             if (error instanceof Prisma.PrismaClientKnownRequestError) {
             }
             throw new BadRequestException("Não foi possível registrar a compra.");
        }
    }
}

