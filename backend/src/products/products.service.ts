// src/dashboard/dashboard.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
// 1. Importe o serviço correto que existe no seu módulo Prisma
import { EstoqueDbService } from '../prisma/estoque-db.service';
import { Prisma } from '@prisma/estoque-client'; // Importe o Prisma para ter acesso ao `Prisma.sql` se precisar 
import { UpdateProductDto } from './dto/update-product.dto';

export interface Product {
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
}

@Injectable()
export class ProductsService {
    constructor(private estoqueDb: EstoqueDbService) { }

    async getProducts(userId: number): Promise<Product[]> {
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
                precoMedio:  await this.estoqueDb.historicoPreco.aggregate({
                    _avg: {
                        preco: true,
                    },
                    where: { produtoId: produto.id },
                }).then(avgRecord => avgRecord._avg.preco ?? null), 
                quantidadeMin: produto.quantidadeMin, 
                quantidadeEst: produto.quantidadeEst, 
                quantidadeNec: produto.quantidadeNec, 
                observacoes: produto.observacoes ?? null
            });
        }
        return produtos_list;
    }

    async modifyProduct(
    userId: number,
    productId: number,
    productData: UpdateProductDto // Use o DTO que criamos
  ) {
    try {
      // 2. E o 'userId' do produto corresponde ao 'userId' do utilizador autenticado.
      const updatedProduct = await this.estoqueDb.produto.update({
        where: {
          id: productId, // <-- ESSA É A VERIFICAÇÃO DE SEGURANÇA CRUCIAL
        },
        data: productData,
      });

      return updatedProduct;

    } catch (error) {
      // Se o Prisma não encontrar um registo que corresponda à cláusula 'where',
      // ele lança um erro com o código 'P2025'.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        // Lançamos uma exceção clara do NestJS.
        // O NestJS irá automaticamente convertê-la numa resposta 404 Not Found.
        throw new NotFoundException(
          `Produto com o ID ${productId} não encontrado ou não pertence a este utilizador.`
        );
      }
      // Se for outro tipo de erro, nós o relançamos para ser tratado globalmente.
      throw error;
    }
  }

    async addProduct(userId: number, productData: Prisma.ProdutoCreateInput) {
        const newProduct = await this.estoqueDb.produto.create({
            data: { ...productData },

        });
        return newProduct;
    }
}