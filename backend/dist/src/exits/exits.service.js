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
exports.ExitsService = void 0;
const common_1 = require("@nestjs/common");
const estoque_db_service_1 = require("../prisma/estoque-db.service");
let ExitsService = class ExitsService {
    estoqueDb;
    constructor(estoqueDb) {
        this.estoqueDb = estoqueDb;
    }
    async create(createSaidaDto, authUser) {
        const { produtoId, quantidade } = createSaidaDto;
        const { id: userId, lojaId } = authUser;
        return this.estoqueDb.$transaction(async (tx) => {
            const estoqueLoja = await tx.estoqueLoja.findUnique({
                where: {
                    produtoId_lojaId: {
                        produtoId: produtoId,
                        lojaId: lojaId,
                    },
                },
            });
            if (!estoqueLoja) {
                throw new common_1.NotFoundException('Produto não encontrado no estoque desta loja.');
            }
            if (estoqueLoja.quantidadeEst < quantidade) {
                throw new common_1.BadRequestException(`Estoque insuficiente. Disponível nesta loja: ${estoqueLoja.quantidadeEst}`);
            }
            await tx.estoqueLoja.update({
                where: {
                    produtoId_lojaId: {
                        produtoId: produtoId,
                        lojaId: lojaId,
                    },
                },
                data: {
                    quantidadeEst: { decrement: quantidade },
                },
            });
            const data = {
                ...createSaidaDto,
                responsavelId: userId,
                lojaId: lojaId,
            };
            const novaSaida = await tx.saida.create({
                data,
                include: {
                    produto: true,
                },
            });
            return novaSaida;
        }, {
            maxWait: 5000,
            timeout: 10000
        });
    }
    async findAll(authUser) {
        const saidas = await this.estoqueDb.saida.findMany({
            where: {
                lojaId: authUser.lojaId,
            },
            include: {
                produto: {
                    include: {
                        estoqueLojas: {
                            where: { lojaId: authUser.lojaId }
                        }
                    }
                },
            },
            orderBy: {
                data: 'desc',
            },
        });
        return saidas.map((saida) => {
            const estoqueAtual = saida.produto?.estoqueLojas[0]?.quantidadeEst ?? 0;
            return {
                ...saida,
                produto: {
                    ...saida.produto,
                    quantidadeEst: estoqueAtual,
                    estoqueLojas: undefined,
                },
            };
        });
    }
    async update(id, updateSaidaDto, authUser) {
        return this.estoqueDb.$transaction(async (tx) => {
            const saidaOriginal = await tx.saida.findUnique({
                where: { id },
            });
            if (!saidaOriginal) {
                throw new common_1.NotFoundException('Registro de saída não encontrado.');
            }
            if (saidaOriginal.lojaId !== authUser.lojaId) {
                throw new common_1.ForbiddenException('Você não tem permissão para editar este registro.');
            }
            const novaQuantidade = updateSaidaDto.quantidade;
            if (novaQuantidade !== undefined && novaQuantidade !== saidaOriginal.quantidade) {
                const estoqueLoja = await tx.estoqueLoja.findUnique({
                    where: {
                        produtoId_lojaId: {
                            produtoId: saidaOriginal.produtoId,
                            lojaId: saidaOriginal.lojaId,
                        },
                    },
                });
                if (!estoqueLoja) {
                    throw new common_1.NotFoundException('Estoque deste produto não encontrado na loja.');
                }
                const diferencaEstoque = novaQuantidade - saidaOriginal.quantidade;
                if (diferencaEstoque > 0) {
                    if (estoqueLoja.quantidadeEst < diferencaEstoque) {
                        throw new common_1.BadRequestException(`Estoque insuficiente para adicionar mais ${diferencaEstoque} itens. Disponível: ${estoqueLoja.quantidadeEst}`);
                    }
                }
                await tx.estoqueLoja.update({
                    where: {
                        produtoId_lojaId: {
                            produtoId: saidaOriginal.produtoId,
                            lojaId: authUser.lojaId,
                        },
                    },
                    data: {
                        quantidadeEst: { decrement: diferencaEstoque },
                    },
                });
            }
            return tx.saida.update({
                where: { id },
                data: updateSaidaDto,
                include: {
                    produto: true,
                },
            });
        });
    }
};
exports.ExitsService = ExitsService;
exports.ExitsService = ExitsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [estoque_db_service_1.EstoqueDbService])
], ExitsService);
//# sourceMappingURL=exits.service.js.map