import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
// Importe os tipos necessários do seu cliente Prisma
import { Prisma, EstadoEntrada, Produto } from '@prisma/estoque-client'; 
import { EstoqueDbService } from '../prisma/estoque-db.service'; // Ajuste o caminho
import { UpdateRecebimentoDto } from './dto/update-recebimento.dto';

@Injectable()
export class RecebimentosService {
    constructor(private estoqueDb: EstoqueDbService) {}

    /**
     * Busca todos os HistóricoCompra com status PENDENTE ou FALTANTE.
     * Inclui dados do produto associado.
     */
    async findPending(userId: number /* userId pode ser usado para filtro futuro */) {
        
        // TODO: Adicionar lógica de permissão se necessário
        
        const pending = await this.estoqueDb.historicoCompra.findMany({
            where: {
                confirmadoEntrada: {
                    in: [EstadoEntrada.PENDENTE, EstadoEntrada.FALTANTE],
                },
            },
            include: {
                produto: { // Inclui os dados do produto relacionado
                    select: {
                        id: true,
                        nome: true,
                        unidade: true,
                        marca: true,
                    }
                }, 
            },
            orderBy: {
                data: 'asc', // Ordena pelos mais antigos primeiro
            }
        });
        return pending;
    }

    /**
     * Atualiza o status e o preço de um HistóricoCompra.
     * Cria registos de Entrada/Saida, atualiza o estoque e o histórico de preço.
     */
    async updateStatus(
        userId: number, // ID do usuário que está confirmando
        historicoCompraId: number, 
        updateDto: UpdateRecebimentoDto
    ) {
        const { status: newStatus, precoConfirmado } = updateDto;

        // 1. Encontra o registro de compra original
        const compraOriginal = await this.estoqueDb.historicoCompra.findUnique({
            where: { id: historicoCompraId },
        });

        if (!compraOriginal) {
            throw new NotFoundException(`Registro de compra com ID ${historicoCompraId} não encontrado.`);
        }

        const oldStatus = compraOriginal.confirmadoEntrada;
        const quantidadeComprada = compraOriginal.quantidade;
        const produtoId = compraOriginal.produtoId;

        // --- Início da Transação Prisma ---
        try {
            // $transaction garante que todas as operações falhem ou tenham sucesso juntas
            const [updatedHistorico, updatedProduto] = await this.estoqueDb.$transaction(async (prismaTx) => {
                
                let updatedProdutoResult: Produto | null = null; 

                // 2. Atualiza o HistóricoCompra (sempre)
                const updatedHistoricoCompra = await prismaTx.historicoCompra.update({
                    where: { id: historicoCompraId },
                    data: {
                        confirmadoEntrada: newStatus,
                        precoTotal: precoConfirmado, // Atualiza o preço com o valor da NF
                        responsavelConfirmacaoId: userId, // Regista quem confirmou
                    },
                });

                // 3. Lógica de Atualização de Estoque e Registo
                
                // Caso 1: Novo status é CONFIRMADO e o antigo NÃO ERA
                if (newStatus === EstadoEntrada.CONFIRMADO && oldStatus !== EstadoEntrada.CONFIRMADO) {
                    
                    // 3a. Incrementa o estoque
                    updatedProdutoResult = await prismaTx.produto.update({
                        where: { id: produtoId },
                        data: {
                            quantidadeEst: {
                                increment: quantidadeComprada,
                            },
                        },
                    });
                    
                    // 3b. Cria o registo na tabela Entrada
                    await prismaTx.entrada.create({
                        data: {
                            produtoId: produtoId,
                            quantidade: quantidadeComprada,
                            precoPago: precoConfirmado, // Preço TOTAL confirmado da NF
                            fornecedor: compraOriginal.fornecedor, // Da compra original
                            responsavelId: userId, // ID de quem confirmou
                        }
                    });

                    // 3c. --- ADIÇÃO CORRIGIDA ---
                    // Adiciona ao Histórico de Preço o NOVO PREÇO UNITÁRIO
                    if (quantidadeComprada > 0) { // Evita divisão por zero
                        const precoUnitario = precoConfirmado / quantidadeComprada;
                        
                        await prismaTx.historicoPreco.create({
                            data: {
                                produtoId: produtoId,
                                preco: precoUnitario, // Salva o PREÇO UNITÁRIO
                                data: new Date() // Data da confirmação
                            }
                        });
                    }
                    // --- FIM DA ADIÇÃO ---

                } 
                // Caso 2: Novo status NÃO É CONFIRMADO mas o antigo ERA
                else if (newStatus !== EstadoEntrada.CONFIRMADO && oldStatus === EstadoEntrada.CONFIRMADO) {
                     
                     // 3a. Decrementa o estoque
                     const produtoAtual = await prismaTx.produto.findUniqueOrThrow({ where: { id: produtoId } });
                     updatedProdutoResult = await prismaTx.produto.update({
                        where: { id: produtoId },
                        data: {
                            quantidadeEst: {
                                decrement: Math.min(produtoAtual.quantidadeEst, quantidadeComprada), 
                            },
                        },
                    });

                    // 3b. Cria um registo na tabela Saida para justificar a reversão
                     await prismaTx.saida.create({
                        data: {
                            produtoId: produtoId,
                            quantidade: quantidadeComprada,
                            responsavelId: userId, // ID de quem fez a reversão
                            motivo: `Reversão de Compra: Status da Compra ID ${historicoCompraId} alterado para ${newStatus}.`,
                        }
                    });
                    
                    // Nota: Não removemos o preço do HistóricoPreco, pois o preço 
                    // foi válido naquela data, mesmo que a entrada tenha sido revertida.
                }
                
                return [updatedHistoricoCompra, updatedProdutoResult]; 
            });
            // --- Fim da Transação Prisma ---

            return updatedHistorico; // Retorna o histórico atualizado

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

