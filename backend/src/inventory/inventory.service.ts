import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/estoque-client';
import { EstoqueDbService } from '../prisma/estoque-db.service'; // Ajuste o caminho
import { UpdateInventarioDto } from './dto/update-inventario.dto';

@Injectable()
export class InventarioService {
    constructor(private estoqueDb: EstoqueDbService) {}
    // TODO caso valor novo seja abaixo do velho lançar alerta para todos da mesma loja
    async updateQuantities(userId: number, updateDto: UpdateInventarioDto) {
        const { updates } = updateDto;
        if (!updates || updates.length === 0) {
            throw new BadRequestException('Nenhuma atualização fornecida.');
        }

        try {
            const results = await this.estoqueDb.$transaction(async (prismaTx) => {
                const updatePromises = updates.map(async (updateItem) => {
                    const { productId, newQuantity } = updateItem;
                    const product = await prismaTx.produto.findUnique({
                        where: { id: productId }, // TODO adicionar somente a loja do usuario
                    });

                    if (!product) {
                        throw new NotFoundException(`Produto com ID ${productId} não encontrado.`);
                    }

                    return prismaTx.produto.update({
                        where: { id: productId },
                        data: { quantidadeEst: newQuantity },
                        select: { id: true, quantidadeEst: true } 
                    });
                });

                return Promise.all(updatePromises);
            });
            return {
                message: `${results.length} produto(s) atualizado(s) com sucesso.`,
                updatedProducts: results 
            };

        } catch (error) {
             console.error("Erro ao atualizar inventário:", error);
             if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) {
                 throw error;
             }
             if (error instanceof Prisma.PrismaClientKnownRequestError) {
             }
             throw new BadRequestException("Não foi possível atualizar o inventário.");
        }
    }
}
