"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const estoque_db_service_1 = require("../prisma/estoque-db.service");
const estoque_client_1 = require("@prisma/estoque-client");
let ProductsService = class ProductsService {
    estoqueDb;
    constructor(estoqueDb) {
        this.estoqueDb = estoqueDb;
    }
    async findAllFornecedores() {
        return this.estoqueDb.fornecedor.findMany({
            orderBy: { nome: 'asc' },
        });
    }
    async findAll(lojaId) {
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
    async findWithStock(lojaId) {
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
    async create(dto, lojaIdDoUsuario) {
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
        }
        catch (error) {
            if (error instanceof estoque_client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.BadRequestException('Um produto com este nome ou código já existe.');
            }
            throw error;
        }
    }
    async update(id, dto, lojaIdDoUsuario) {
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
        }
        catch (error) {
            if (error instanceof estoque_client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new common_1.NotFoundException(`Produto com ID ${id} não encontrado.`);
            }
            throw error;
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [estoque_db_service_1.EstoqueDbService])
], ProductsService);
//# sourceMappingURL=products.service.js.map