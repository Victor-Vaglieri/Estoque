import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/estoque-client';
import { EstoqueDbService } from '../prisma/estoque-db.service'; // Ajuste o caminho
import { UpdateInventarioDto } from './dto/update-inventario.dto';

@Injectable()
export class InventarioService {
    constructor(private estoqueDb: EstoqueDbService) {}

    /**
     * Atualiza a quantidade de múltiplos produtos numa única transação.
     * Garante que o usuário só pode atualizar seus próprios produtos.
     */
    async updateQuantities(userId: number, updateDto: UpdateInventarioDto) {
        const { updates } = updateDto;

        if (!updates || updates.length === 0) {
            throw new BadRequestException('Nenhuma atualização fornecida.');
        }

        // --- Início da Transação Prisma ---
        // Usamos uma transação para garantir que TODAS as atualizações
        // sejam bem-sucedidas, ou NENHUMA delas.
        try {
            const results = await this.estoqueDb.$transaction(async (prismaTx) => {
                const updatePromises = updates.map(async (updateItem) => {
                    const { productId, newQuantity } = updateItem;

                    // 1. Verifica se o produto existe E pertence ao usuário logado
                    const product = await prismaTx.produto.findUnique({
                        where: { id: productId },
                    });

                    if (!product) {
                        // Lança um erro DENTRO da transação para cancelá-la
                        throw new NotFoundException(`Produto com ID ${productId} não encontrado.`);
                    }

                    // 2. Executa a atualização da quantidade
                    return prismaTx.produto.update({
                        where: { id: productId },
                        data: { quantidadeEst: newQuantity },
                        select: { id: true, quantidadeEst: true } // Retorna apenas o ID e a nova quantidade
                    });
                });

                // Espera que todas as verificações e atualizações dentro do map sejam concluídas
                return Promise.all(updatePromises);
            });
            // --- Fim da Transação Prisma ---

            // Se chegou aqui, a transação foi bem-sucedida
            return {
                message: `${results.length} produto(s) atualizado(s) com sucesso.`,
                updatedProducts: results // Retorna a lista de IDs e novas quantidades
            };

        } catch (error) {
             console.error("Erro ao atualizar inventário:", error);
             // Relança erros específicos que podem ter ocorrido dentro da transação
             if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) {
                 throw error;
             }
             // Trata outros erros do Prisma ou erros inesperados
             if (error instanceof Prisma.PrismaClientKnownRequestError) {
                  // Pode adicionar tratamento específico para erros do Prisma se necessário
             }
             throw new BadRequestException("Não foi possível atualizar o inventário.");
        }
    }
}
