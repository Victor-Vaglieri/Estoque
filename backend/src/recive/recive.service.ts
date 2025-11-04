import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
// Importe os tipos necessários do seu cliente Prisma
import { Prisma, EstadoEntrada, Produto } from '@prisma/estoque-client'; 
import { EstoqueDbService } from '../prisma/estoque-db.service'; // Ajuste o caminho
import { UpdateRecebimentoDto } from './dto/update-recebimento.dto';

@Injectable()
export class RecebimentosService {
    constructor(private estoqueDb: EstoqueDbService) {}


    async findPending(userId: number) {
        const pending = await this.estoqueDb.historicoCompra.findMany({
            where: {
                confirmadoEntrada: {
                    in: [EstadoEntrada.PENDENTE, EstadoEntrada.FALTANTE],
                },
            },
            include: {
                produto: {
                    select: {
                        id: true,
                        nome: true,
                        unidade: true,
                        marca: true,
                    }
                }, 
            },
            orderBy: {
                data: 'asc',
            }
        });
        return pending;
    }


    async updateStatus(
        userId: number,
        historicoCompraId: number, 
        updateDto: UpdateRecebimentoDto
    ) {
        const { status: newStatus, precoConfirmado } = updateDto;

        const compraOriginal = await this.estoqueDb.historicoCompra.findUnique({
            where: { id: historicoCompraId },
        });

        if (!compraOriginal) {
            throw new NotFoundException(`Registro de compra com ID ${historicoCompraId} não encontrado.`);
        }

        const oldStatus = compraOriginal.confirmadoEntrada;
        const quantidadeComprada = compraOriginal.quantidade;
        const produtoId = compraOriginal.produtoId;

        try {
            const [updatedHistorico, updatedProduto] = await this.estoqueDb.$transaction(async (prismaTx) => {
                let updatedProdutoResult: Produto | null = null; 
                const updatedHistoricoCompra = await prismaTx.historicoCompra.update({
                    where: { id: historicoCompraId },
                    data: {
                        confirmadoEntrada: newStatus,
                        precoTotal: precoConfirmado,
                        responsavelConfirmacaoId: userId, 
                    },
                });

                if (newStatus === EstadoEntrada.CONFIRMADO && oldStatus !== EstadoEntrada.CONFIRMADO) {

                    updatedProdutoResult = await prismaTx.produto.update({
                        where: { id: produtoId },
                        data: {
                            quantidadeEst: {
                                increment: quantidadeComprada,
                            },
                        },
                    });
                    
                    await prismaTx.entrada.create({
                        data: {
                            produtoId: produtoId,
                            quantidade: quantidadeComprada,
                            precoPago: precoConfirmado,
                            fornecedor: compraOriginal.fornecedor,
                            responsavelId: userId,
                        }
                    });

                    if (quantidadeComprada > 0) { 
                        const precoUnitario = precoConfirmado / quantidadeComprada;
                        
                        await prismaTx.historicoPreco.create({
                            data: {
                                produtoId: produtoId,
                                preco: precoUnitario,
                                data: new Date()
                            }
                        });
                    }

                } 
                else if (newStatus !== EstadoEntrada.CONFIRMADO && oldStatus === EstadoEntrada.CONFIRMADO) {
                     const produtoAtual = await prismaTx.produto.findUniqueOrThrow({ where: { id: produtoId } });
                     updatedProdutoResult = await prismaTx.produto.update({
                        where: { id: produtoId },
                        data: {
                            quantidadeEst: {
                                decrement: Math.min(produtoAtual.quantidadeEst, quantidadeComprada), 
                            },
                        },
                    });

                     await prismaTx.saida.create({
                        data: {
                            produtoId: produtoId,
                            quantidade: quantidadeComprada,
                            responsavelId: userId, 
                            motivo: `Reversão de Compra: Status da Compra ID ${historicoCompraId} alterado para ${newStatus}.`,
                        }
                    });
                    
                }
                
                return [updatedHistoricoCompra, updatedProdutoResult]; 
            });

            return updatedHistorico;

        } catch (error) {
            console.error("Erro ao atualizar recebimento:", error);
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                 if (error.code === 'P2025') {
                     throw new NotFoundException(`Erro ao encontrar registo relacionado durante a transação.`);
                 }
            }
             throw new BadRequestException("Não foi possível atualizar o recebimento.");
        }
    }
}

