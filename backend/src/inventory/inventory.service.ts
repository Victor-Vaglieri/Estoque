import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EstoqueDbService } from '../prisma/estoque-db.service';

import { EventEmitter2 } from '@nestjs/event-emitter';


interface UpdateEstoqueItem {
  produtoId: number;
  newQuantity: number;
}


type AuthUser = {
  id: number;
  lojaId: number;
};

@Injectable()
export class InventarioService {
  
  constructor(
    private estoqueDb: EstoqueDbService,
    private eventEmitter: EventEmitter2,
  ) {}

  
  async findAllByLoja(lojaId: number) {
    const estoqueLojas = await this.estoqueDb.estoqueLoja.findMany({
      where: { lojaId },
      include: {
        produto: true, 
      },
    });

    
    return estoqueLojas.map((el) => ({
      ...el.produto, 
      id: el.produtoId, 
      quantidadeEst: el.quantidadeEst, 
    }));
  }

  
  async ajustarEstoque(
    updates: UpdateEstoqueItem[],
    lojaId: number,
    userId: number,
  ) {
    return this.estoqueDb.$transaction(async (tx) => {
      for (const update of updates) {
        const { produtoId, newQuantity } = update;

        
        
        const estoqueAtual = await tx.estoqueLoja.findUnique({
          where: { produtoId_lojaId: { produtoId, lojaId } },
          include: {
            produto: {
              select: { nome: true, unidade: true },
            },
          },
        });

        if (!estoqueAtual) {
          throw new NotFoundException(
            `Produto ID ${produtoId} não encontrado no estoque desta loja.`,
          );
        }

        const diferenca = newQuantity - estoqueAtual.quantidadeEst;

        if (diferenca === 0) {
          continue; 
        }

        
        await tx.estoqueLoja.update({
          where: { id: estoqueAtual.id },
          data: { quantidadeEst: newQuantity },
        });

        
        if (diferenca > 0) {
          await tx.entrada.create({
            data: {
              produtoId: produtoId,
              lojaId: lojaId,
              quantidade: diferenca,
              responsavelId: userId,
              precoPago: 0, 
              fornecedorId: null, 
            },
          });
        }
        
        else if (diferenca < 0) {
          
          await tx.saida.create({
            data: {
              produtoId: produtoId,
              lojaId: lojaId,
              quantidade: Math.abs(diferenca), 
              responsavelId: userId,
              motivo: 'Ajuste de Inventário',
            },
          });

          
          
          this.eventEmitter.emit('inventario.alerta', {
            userId: userId, // Passa o ID de quem fez o ajuste
            lojaId: lojaId,
            titulo: 'Ajuste de Inventário',
            descricao: `O estoque de "${
              estoqueAtual.produto.nome
            }" foi ajustado manualmente para ${newQuantity} ${
              estoqueAtual.produto.unidade || 'un.'
            }. (Estoque anterior: ${estoqueAtual.quantidadeEst})`,
            importancia: 'MEDIA', 
          });
          
        }
      }
      return { message: 'Inventário atualizado com sucesso' };
    });
  }
}