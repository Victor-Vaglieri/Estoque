// src/dashboard/dashboard.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { EstoqueDbService } from '../prisma/estoque-db.service';
import { Prisma } from '@prisma/estoque-client';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';

export interface Product { // TODO espelhar com o novo esquema
  nome: string;
  id: number;
  unidade: string;
  marca: string | null;
  ultimoPreco: number | null;
  precoMedio: number | null;
  quantidadeMin: number;
  quantidadeEst: number;
  quantidadeNec: number;
  observacoes: string | null;
  ativo: boolean;
}

@Injectable()
export class ProductsService {
  constructor(private estoqueDb: EstoqueDbService) { }

  async getProducts(userId: number): Promise<Product[]> { // TODO espelhar com o novo esquema, aqui não precisa de exclusão por loja, se deve listar de todas
    const produtos = await this.estoqueDb.produto.findMany({});
    const produtos_list: Product[] = [];
    for (let produto of produtos) {
      produtos_list.push({
        nome: produto.nome,
        id: produto.id,
        unidade: produto.unidade,
        marca: produto.marca ?? null,
        ultimoPreco: await this.estoqueDb.historicoPreco.findFirst({
          where: { produtoId: produto.id },
          orderBy: { data: 'desc' },
        }).then(precoRecord => precoRecord ? precoRecord.preco : null),
        precoMedio: await this.estoqueDb.historicoPreco.aggregate({
          _avg: {
            preco: true,
          },
          where: { produtoId: produto.id },
        }).then(avgRecord => avgRecord._avg.preco ?? null),
        quantidadeMin: produto.quantidadeMin,
        quantidadeEst: produto.quantidadeEst,
        quantidadeNec: produto.quantidadeNec,
        observacoes: produto.observacoes ?? null,
        ativo: produto.ativo
      });
    }
    return produtos_list;
  }

  async getProductsInventory(userId: number): Promise<Product[]> { // TODO espelhar com o novo esquema, aqui sim se deve excluir por loja do usuario
    const produtos = await this.estoqueDb.produto.findMany({
      where: {
        ativo: true
      }
    });
    const produtos_list: Product[] = [];
    for (let produto of produtos) {
      produtos_list.push({
        nome: produto.nome,
        id: produto.id,
        unidade: produto.unidade,
        marca: produto.marca ?? null,
        ultimoPreco: await this.estoqueDb.historicoPreco.findFirst({
          where: { produtoId: produto.id },
          orderBy: { data: 'desc' },
        }).then(precoRecord => precoRecord ? precoRecord.preco : null),
        precoMedio: await this.estoqueDb.historicoPreco.aggregate({
          _avg: {
            preco: true,
          },
          where: { produtoId: produto.id },
        }).then(avgRecord => avgRecord._avg.preco ?? null),
        quantidadeMin: produto.quantidadeMin,
        quantidadeEst: produto.quantidadeEst,
        quantidadeNec: produto.quantidadeNec,
        observacoes: produto.observacoes ?? null,
        ativo: produto.ativo
      });
    }
    return produtos_list;
  }

  async modifyProduct(
    userId: number,
    productId: number,
    productData: UpdateProductDto
  ) {
    try {
      const updatedProduct = await this.estoqueDb.produto.update({
        where: {
          id: productId,
        },
        data: productData,
      });

      return updatedProduct;

    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(
          `Produto com o ID ${productId} não encontrado ou não pertence a este utilizador.`
        );
      }
      throw error;
    }
  }

  async addProduct(userId: number, productData: CreateProductDto) {

    const newProduct = await this.estoqueDb.produto.create({
      data: {
        ...productData,
        quantidadeEst: 0,
        ativo: true
      }
    });

    return newProduct;
  }

  async getProductsWithStock(userId: number): Promise<Product[]> {
    const produtos = await this.estoqueDb.produto.findMany({
      where: {
        quantidadeMin: { lt: this.estoqueDb.produto.fields.quantidadeEst },
        ativo: true
      }
    });
    const produtos_list: Product[] = [];
    for (let produto of produtos) {
      produtos_list.push({
        nome: produto.nome,
        id: produto.id,
        unidade: produto.unidade,
        marca: produto.marca ?? null,
        ultimoPreco: await this.estoqueDb.historicoPreco.findFirst({
          where: { produtoId: produto.id },
          orderBy: { data: 'desc' },
        }).then(precoRecord => precoRecord ? precoRecord.preco : null),
        precoMedio: await this.estoqueDb.historicoPreco.aggregate({
          _avg: {
            preco: true,
          },
          where: { produtoId: produto.id },
        }).then(avgRecord => avgRecord._avg.preco ?? null),
        quantidadeMin: produto.quantidadeMin,
        quantidadeEst: produto.quantidadeEst,
        quantidadeNec: produto.quantidadeNec,
        observacoes: produto.observacoes ?? null,
        ativo: produto.ativo
      });
    }
    return produtos_list;
  }
}