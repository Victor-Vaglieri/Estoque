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

  // --- NOVO MÉTODO: Buscar Fornecedores ---
  async findAllFornecedores() {
    return this.estoqueDb.fornecedor.findMany({
      orderBy: { nome: 'asc' },
    });
  }
  // ----------------------------------------

  async findAll(lojaId: number) {
    const produtos = await this.estoqueDb.produto.findMany({
      where: {
        ativo: true,
      },
      include: {
        fornecedor: true,
        estoqueLojas: {
          where: {
            lojaId: lojaId,
          },
        },
      },
      orderBy: { nome: 'asc' },
    });

    return produtos.map((produto) => {
      const estoqueDaLoja = produto.estoqueLojas[0] || null;
      return {
        ...produto,
        estoqueLojas: undefined,
        quantidadeEst: estoqueDaLoja ? estoqueDaLoja.quantidadeEst : 0,
        quantidadeNec: produto.quantidadeMax,
      };
    });
  }

  async findWithStock(lojaId: number) {
    const estoqueComProdutos = await this.estoqueDb.estoqueLoja.findMany({
      where: {
        lojaId: lojaId,
        quantidadeEst: { gt: 0 },
        produto: {
          ativo: true,
        },
      },
      include: {
        produto: true,
      },
      orderBy: { produto: { nome: 'asc' } },
    });

    return estoqueComProdutos.map((estoque) => ({
      ...estoque.produto,
      quantidadeEst: estoque.quantidadeEst,
      quantidadeNec: estoque.produto.quantidadeMax,
    }));
  }

  async create(dto: CreateProdutoDto, lojaId: number) {
    const { quantidadeEst, ...dadosProduto } = dto;

    try {
      return await this.estoqueDb.$transaction(async (tx) => {
        const novoProduto = await tx.produto.create({
          data: dadosProduto,
        });

        await tx.estoqueLoja.create({
          data: {
            produtoId: novoProduto.id,
            lojaId: lojaId,
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

  async update(id: number, dto: UpdateProdutoDto, lojaId: number) {
    const { quantidadeEst, ...dadosProduto } = dto;

    try {
      return await this.estoqueDb.$transaction(async (tx) => {
        const produtoAtualizado = await tx.produto.update({
          where: { id },
          data: dadosProduto,
        });

        if (quantidadeEst !== undefined) {
          await tx.estoqueLoja.upsert({
            where: {
              produtoId_lojaId: {
                produtoId: id,
                lojaId: lojaId,
              },
            },
            update: {
              quantidadeEst: quantidadeEst,
            },
            create: {
              produtoId: id,
              lojaId: lojaId,
              quantidadeEst: quantidadeEst,
            },
          });
        }

        return produtoAtualizado;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
      }
      throw error;
    }
  }
}