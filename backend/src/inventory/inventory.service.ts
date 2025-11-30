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
    console.log('Loja ID recebida em InventoryService:', lojaIdUsuario);
    const idLoja = Number(lojaIdUsuario);

    const produtos = await this.estoqueDb.produto.findMany({
      where: { ativo: true },
      include: {
        
        estoqueLojas: {
          include: {
            loja: { select: { id: true, nome: true } },
          },
        },
      },
      orderBy: { nome: 'asc' },
    });

    return produtos.map((p) => {
      
      
      const estoqueAtual = p.estoqueLojas.find((e) => e.lojaId === idLoja);

      return {
        id: p.id,
        nome: p.nome,
        codigo: p.codigo,
        marca: p.marca,
        unidade: p.unidade,
        quantidadeMin: p.quantidadeMin,
        
        
        
        quantidadeEst: estoqueAtual ? estoqueAtual.quantidadeEst : 0,
        
        
        estoquePorLoja: p.estoqueLojas.map((e) => ({
          lojaId: e.lojaId,
          nomeLoja: e.loja.nome,
          quantidade: e.quantidadeEst,
        })),
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
          include: { produto: { select: { nome: true, unidade: true } } },
        });

        
        let qtdAnterior = 0;
        let nomeProduto = '';
        let unidadeProduto = '';

        if (!estoqueAtual) {
           
           const prod = await tx.produto.findUnique({ where: { id: produtoId }});
           if(!prod) throw new NotFoundException(`Produto ${produtoId} não existe.`);
           nomeProduto = prod.nome;
           unidadeProduto = prod.unidade;

           
           await tx.estoqueLoja.create({
               data: { lojaId, produtoId, quantidadeEst: newQuantity }
           });
        } else {
           qtdAnterior = estoqueAtual.quantidadeEst;
           nomeProduto = estoqueAtual.produto.nome;
           unidadeProduto = estoqueAtual.produto.unidade;

           if (newQuantity === qtdAnterior) continue; 

           
           await tx.estoqueLoja.update({
             where: { id: estoqueAtual.id },
             data: { quantidadeEst: newQuantity },
           });
        }

        const diferenca = newQuantity - qtdAnterior;

        
        if (diferenca > 0) {
          await tx.entrada.create({
            data: {
              produtoId,
              lojaId,
              quantidade: diferenca,
              responsavelId: userId,
              precoPago: 0, 
              data: new Date()
            },
          });
        } else if (diferenca < 0) {
          await tx.saida.create({
            data: {
              produtoId,
              lojaId,
              quantidade: Math.abs(diferenca),
              responsavelId: userId,
              motivo: 'Ajuste de Inventário',
              data: new Date()
            },
          });
        }
        
        
        this.eventEmitter.emit('inventario.alerta', {
            userId,
            lojaId,
            titulo: 'Ajuste de Inventário',
            descricao: `Estoque de "${nomeProduto}" ajustado de ${qtdAnterior} para ${newQuantity} ${unidadeProduto}.`,
            importancia: 'MEDIA'
        });
      }
      return { message: 'Inventário atualizado com sucesso' };
    });
  }
} 