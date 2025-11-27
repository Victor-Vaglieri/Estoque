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
exports.ComprasService = void 0;
const common_1 = require("@nestjs/common");
const estoque_db_service_1 = require("../prisma/estoque-db.service");
const estoque_client_1 = require("@prisma/estoque-client");
let ComprasService = class ComprasService {
    estoqueDb;
    constructor(estoqueDb) {
        this.estoqueDb = estoqueDb;
    }
    async findAllToBuy(lojaId) {
        const estoques = await this.estoqueDb.estoqueLoja.findMany({
            where: {
                produto: { ativo: true },
            },
            include: {
                produto: {
                    include: { fornecedor: true },
                },
            },
        });
        const mapaProdutos = new Map();
        for (const est of estoques) {
            const pid = est.produtoId;
            const atual = mapaProdutos.get(pid);
            if (atual) {
                atual.totalEstoque += est.quantidadeEst;
            }
            else {
                mapaProdutos.set(pid, {
                    produto: est.produto,
                    totalEstoque: est.quantidadeEst
                });
            }
        }
        const distribuicoesPendentes = await this.estoqueDb.compraDistribuicao.findMany({
            where: {
                confirmadoEntrada: { in: [estoque_client_1.EstadoEntrada.PENDENTE, estoque_client_1.EstadoEntrada.FALTANTE] },
            },
            include: {
                historicoCompra: { select: { produtoId: true } },
            },
        });
        const pendenteMap = new Map();
        for (const dist of distribuicoesPendentes) {
            const produtoId = dist.historicoCompra.produtoId;
            const totalAtual = pendenteMap.get(produtoId) ?? 0;
            pendenteMap.set(produtoId, totalAtual + dist.quantidade);
        }
        const productsToBuy = [];
        for (const item of mapaProdutos.values()) {
            const { produto, totalEstoque } = item;
            const quantidadePendente = pendenteMap.get(produto.id) ?? 0;
            if (totalEstoque + quantidadePendente < produto.quantidadeMax) {
                productsToBuy.push({
                    id: produto.id,
                    nome: produto.nome,
                    unidade: produto.unidade,
                    marca: produto.marca,
                    codigo: produto.codigo,
                    quantidadeMin: produto.quantidadeMin,
                    quantidadeMax: produto.quantidadeMax,
                    quantidadeEst: totalEstoque,
                    quantidadePendenteFaltante: quantidadePendente,
                    fornecedor: produto.fornecedor,
                });
            }
        }
        return this.groupProductsByFornecedor(productsToBuy);
    }
    async registerPurchase(dto, authUser) {
        const { productId, quantidade, precoTotal } = dto;
        const { id: userId, lojaId } = authUser;
        const produto = await this.estoqueDb.produto.findUnique({
            where: { id: productId },
            select: { fornecedorId: true },
        });
        if (!produto) {
            throw new common_1.NotFoundException('Produto não encontrado.');
        }
        return this.estoqueDb.$transaction(async (tx) => {
            const novaCompra = await tx.historicoCompra.create({
                data: {
                    produtoId: productId,
                    quantidade: quantidade,
                    precoTotal: precoTotal || 0.0,
                    responsavelId: userId,
                    fornecedorId: produto.fornecedorId,
                },
            });
            await tx.compraDistribuicao.create({
                data: {
                    historicoCompraId: novaCompra.id,
                    lojaId: lojaId,
                    quantidade: quantidade,
                    confirmadoEntrada: estoque_client_1.EstadoEntrada.PENDENTE,
                },
            });
            return novaCompra;
        });
    }
    groupProductsByFornecedor(products) {
        return products.reduce((acc, product) => {
            const fornecedorNome = product.fornecedor?.nome || 'Fornecedor Desconhecido';
            if (!acc[fornecedorNome]) {
                acc[fornecedorNome] = [];
            }
            acc[fornecedorNome].push(product);
            return acc;
        }, {});
    }
};
exports.ComprasService = ComprasService;
exports.ComprasService = ComprasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [estoque_db_service_1.EstoqueDbService])
], ComprasService);
//# sourceMappingURL=to-buy-products.service.js.map