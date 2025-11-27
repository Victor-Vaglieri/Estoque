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
exports.InventarioService = void 0;
const common_1 = require("@nestjs/common");
const estoque_db_service_1 = require("../prisma/estoque-db.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let InventarioService = class InventarioService {
    estoqueDb;
    eventEmitter;
    constructor(estoqueDb, eventEmitter) {
        this.estoqueDb = estoqueDb;
        this.eventEmitter = eventEmitter;
    }
    async findAllForInventory(lojaIdUsuario) {
        const produtos = await this.estoqueDb.produto.findMany({
            where: { ativo: true },
            include: {
                estoqueLojas: {
                    include: {
                        loja: { select: { id: true, nome: true } }
                    }
                },
            },
            orderBy: { nome: 'asc' },
        });
        return produtos.map((p) => {
            const estoqueAtual = p.estoqueLojas.find(e => e.lojaId === lojaIdUsuario);
            return {
                id: p.id,
                nome: p.nome,
                codigo: p.codigo,
                marca: p.marca,
                unidade: p.unidade,
                quantidadeMin: p.quantidadeMin,
                quantidadeEst: estoqueAtual ? estoqueAtual.quantidadeEst : 0,
                estoquePorLoja: p.estoqueLojas.map(e => ({
                    lojaId: e.lojaId,
                    nomeLoja: e.loja.nome,
                    quantidade: e.quantidadeEst
                }))
            };
        });
    }
    async findAllByLoja(lojaId) {
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
    async ajustarEstoque(updates, lojaId, userId) {
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
                    throw new common_1.NotFoundException(`Produto ID ${produtoId} não encontrado no estoque desta loja.`);
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
                        userId: userId,
                        lojaId: lojaId,
                        titulo: 'Ajuste de Inventário',
                        descricao: `O estoque de "${estoqueAtual.produto.nome}" foi ajustado manualmente para ${newQuantity} ${estoqueAtual.produto.unidade || 'un.'}. (Estoque anterior: ${estoqueAtual.quantidadeEst})`,
                        importancia: 'MEDIA',
                    });
                }
            }
            return { message: 'Inventário atualizado com sucesso' };
        });
    }
};
exports.InventarioService = InventarioService;
exports.InventarioService = InventarioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [estoque_db_service_1.EstoqueDbService,
        event_emitter_1.EventEmitter2])
], InventarioService);
//# sourceMappingURL=inventory.service.js.map