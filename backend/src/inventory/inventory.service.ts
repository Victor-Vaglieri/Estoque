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


  async findAllForInventory(lojaIdUsuario: number) {
    const produtos = await this.estoqueDb.produto.findMany({
      where: { ativo: true },
      include: {
        // Traz o estoque de todas as lojas para exibir na tabela
        estoqueLojas: {
            include: {
                loja: { select: { id: true, nome: true } }
            }
        },
      },
      orderBy: { nome: 'asc' },
    });

    return produtos.map((p) => {
      // Encontra o estoque específico da loja do usuário para edição
      const estoqueAtual = p.estoqueLojas.find(e => e.lojaId === lojaIdUsuario);

      return {
        id: p.id,
        nome: p.nome,
        codigo: p.codigo,
        marca: p.marca,
        unidade: p.unidade,
        quantidadeMin: p.quantidadeMin,
        // Quantidade da loja do usuário (para referência do input)
        quantidadeEst: estoqueAtual ? estoqueAtual.quantidadeEst : 0,
        // Lista completa para as colunas dinâmicas
        estoquePorLoja: p.estoqueLojas.map(e => ({
            lojaId: e.lojaId,
            nomeLoja: e.loja.nome,
            quantidade: e.quantidadeEst
        }))
      };
    });
  }

  
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