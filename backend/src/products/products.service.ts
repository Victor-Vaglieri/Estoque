import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EstoqueDbService } from '../prisma/estoque-db.service';
import { UpdateProdutoDto } from './dto/update-product.dto';
import { CreateProdutoDto } from './dto/create-product.dto';
import { Prisma } from '@prisma/estoque-client';

@Injectable()
export class ProductsService {
  constructor(private estoqueDb: EstoqueDbService) {}

  async findAllFornecedores() {
    return this.estoqueDb.fornecedor.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async findAll(lojaId: number) {
    console.log('Loja ID recebida em ProductsService:', lojaId);
    const idLojaUsuario = Number(lojaId);

    const produtos = await this.estoqueDb.produto.findMany({
      where: { ativo: true },
      include: {
        fornecedor: true,
        estoqueLojas: true, 
      },
      orderBy: { nome: 'asc' },
    });

    return produtos.map((produto) => {
      
      const estoqueDaLojaAtual = produto.estoqueLojas.find(e => e.lojaId === idLojaUsuario);
      const qualquerEstoque = produto.estoqueLojas[0];

      return {
        ...produto,
        estoqueLojas: undefined, 
        quantidadeEst: estoqueDaLojaAtual ? estoqueDaLojaAtual.quantidadeEst : 0,
        quantidadeNec: produto.quantidadeMax,
        realLojaId: estoqueDaLojaAtual?.lojaId || qualquerEstoque?.lojaId || null
      };
    });
  }

  async findWithStock(lojaId: number) {
    const estoqueComProdutos = await this.estoqueDb.estoqueLoja.findMany({
      where: {
        lojaId: lojaId,
        quantidadeEst: { gt: 0 },
        produto: { ativo: true },
      },
      include: { produto: true },
      orderBy: { produto: { nome: 'asc' } },
    });

    return estoqueComProdutos.map((estoque) => ({
      ...estoque.produto,
      quantidadeEst: estoque.quantidadeEst,
      quantidadeNec: estoque.produto.quantidadeMax,
    }));
  }

  
  
  
  
  async create(dto: CreateProdutoDto & { lojaId?: number }, lojaIdDoUsuario: number) {
    
    
    const targetLojaId = dto.lojaId ? Number(dto.lojaId) : lojaIdDoUsuario;

    
    const { quantidadeEst, lojaId, ...dadosProduto } = dto;

    try {
      return await this.estoqueDb.$transaction(async (tx) => {
        
        const novoProduto = await tx.produto.create({
          data: dadosProduto,
        });

        
        await tx.estoqueLoja.create({
          data: {
            produtoId: novoProduto.id,
            lojaId: targetLojaId, 
            quantidadeEst: quantidadeEst,
          },
        });

        return novoProduto;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Um produto com este nome ou código já existe.');
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateProdutoDto & { lojaId?: number }, lojaIdDoUsuario: number) {
    
    const { quantidadeEst, lojaId, ...dadosProduto } = dto;

    
    const targetLojaId = lojaId ? Number(lojaId) : lojaIdDoUsuario;

    try {
      return await this.estoqueDb.$transaction(async (tx) => {
        
        
        const produtoAtualizado = await tx.produto.update({
          where: { id },
          data: dadosProduto,
        });

        
        
        if (targetLojaId) {
            
            const estoqueExistente = await tx.estoqueLoja.findUnique({
                where: { produtoId_lojaId: { produtoId: id, lojaId: targetLojaId } }
            });

            
            
            await tx.estoqueLoja.deleteMany({
                where: {
                    produtoId: id,
                    lojaId: { not: targetLojaId } 
                }
            });

            
            
            
            const novaQuantidade = quantidadeEst !== undefined 
                ? quantidadeEst 
                : (estoqueExistente?.quantidadeEst ?? 0);

            await tx.estoqueLoja.upsert({
                where: { produtoId_lojaId: { produtoId: id, lojaId: targetLojaId } },
                update: { quantidadeEst: novaQuantidade },
                create: { 
                    produtoId: id, 
                    lojaId: targetLojaId, 
                    quantidadeEst: novaQuantidade 
                }
            });
        }

        return produtoAtualizado;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
      }
      throw error;
    }
  }
}