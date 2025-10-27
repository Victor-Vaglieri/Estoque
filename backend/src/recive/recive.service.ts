import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
// 1. Importe o tipo 'Produto' do seu cliente Prisma
import { Prisma, EstadoEntrada, Produto } from '@prisma/estoque-client'; 
import { EstoqueDbService } from '../prisma/estoque-db.service';
import { UpdateRecebimentoDto } from './dto/update-recebimento.dto';

@Injectable()
export class RecebimentosService {
    constructor(private estoqueDb: EstoqueDbService) {}

    /**
     * Busca todos os HistóricoCompra com status PENDENTE ou FALTANTE.
     * Inclui dados do produto associado.
     */
    async findPending(userId: number) {
        const pending = await this.estoqueDb.historicoCompra.findMany({
            where: {
                confirmadoEntrada: {
                    in: [EstadoEntrada.PENDENTE, EstadoEntrada.FALTANTE],
                },
            },
            include: {
                produto: { 
                    select: { id: true, nome: true, unidade: true, marca: true }
                }, 
            },
            orderBy: { data: 'asc' }
        });
        return pending;
    }

    /**
     * Atualiza o status e o preço de um HistóricoCompra.
     * Atualiza o estoque do produto conforme necessário.
     */
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
                
                // 2. CORREÇÃO AQUI: Tipagem explícita para a variável
                // Indica que ela pode ser null OU um objeto Produto
                let updatedProdutoResult: Produto | null = null; 

                const updatedHistoricoCompra = await prismaTx.historicoCompra.update({
                    where: { id: historicoCompraId },
                    data: {
                        confirmadoEntrada: newStatus,
                        precoTotal: precoConfirmado, 
                        responsavelConfirmacaoId: userId, 
                    },
                });

                // Lógica de Atualização de Estoque
                
                // Caso 1: Novo status é CONFIRMADO e o antigo NÃO ERA
                if (newStatus === EstadoEntrada.CONFIRMADO && oldStatus !== EstadoEntrada.CONFIRMADO) {
                    updatedProdutoResult = await prismaTx.produto.update({ // Agora a atribuição é válida
                        where: { id: produtoId },
                        data: {
                            quantidadeEst: {
                                increment: quantidadeComprada,
                            },
                        },
                    });
                } 
                // Caso 2: Novo status NÃO É CONFIRMADO mas o antigo ERA
                else if (newStatus !== EstadoEntrada.CONFIRMADO && oldStatus === EstadoEntrada.CONFIRMADO) {
                     // Primeiro busca o produto para garantir que o estoque não fique negativo
                     const produtoAtual = await prismaTx.produto.findUniqueOrThrow({ where: { id: produtoId } });
                     updatedProdutoResult = await prismaTx.produto.update({ // Agora a atribuição é válida
                        where: { id: produtoId },
                        data: {
                            quantidadeEst: {
                                decrement: Math.min(produtoAtual.quantidadeEst, quantidadeComprada), 
                            },
                        },
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

