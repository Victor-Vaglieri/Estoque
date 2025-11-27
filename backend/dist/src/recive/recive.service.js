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
exports.RecebimentosService = void 0;
const common_1 = require("@nestjs/common");
const estoque_client_1 = require("@prisma/estoque-client");
const estoque_db_service_1 = require("../prisma/estoque-db.service");
let RecebimentosService = class RecebimentosService {
    estoqueDb;
    constructor(estoqueDb) {
        this.estoqueDb = estoqueDb;
    }
    async findPending(authUser) {
        if (!authUser.lojaId) {
            throw new common_1.ForbiddenException('Usuário não associado a uma loja.');
        }
        const distribuicoes = await this.estoqueDb.compraDistribuicao.findMany({
            where: {
                lojaId: authUser.lojaId,
                confirmadoEntrada: {
                    in: [estoque_client_1.EstadoEntrada.PENDENTE, estoque_client_1.EstadoEntrada.FALTANTE],
                },
            },
            include: {
                historicoCompra: {
                    include: {
                        produto: {
                            select: {
                                id: true,
                                nome: true,
                                unidade: true,
                                marca: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                historicoCompra: { data: 'asc' },
            },
        });
        return distribuicoes.map((dist) => ({
            id: dist.id,
            quantidade: dist.quantidade,
            precoTotal: dist.historicoCompra.precoTotal,
            data: dist.historicoCompra.data,
            confirmadoEntrada: dist.confirmadoEntrada,
            produto: dist.historicoCompra.produto,
        }));
    }
    async updateStatus(authUser, distribuicaoId, updateDto) {
        const { status: newStatus, precoConfirmado } = updateDto;
        const { id: userId, lojaId } = authUser;
        const distribuicaoOriginal = await this.estoqueDb.compraDistribuicao.findUnique({
            where: { id: distribuicaoId },
            include: { historicoCompra: true },
        });
        if (!distribuicaoOriginal) {
            throw new common_1.NotFoundException(`Registro de distribuição com ID ${distribuicaoId} não encontrado.`);
        }
        if (distribuicaoOriginal.lojaId !== lojaId) {
            throw new common_1.ForbiddenException('Você não tem permissão para confirmar esta entrada.');
        }
        const oldStatus = distribuicaoOriginal.confirmadoEntrada;
        const quantidadeParaLoja = distribuicaoOriginal.quantidade;
        const produtoId = distribuicaoOriginal.historicoCompra.produtoId;
        const fornecedorId = distribuicaoOriginal.historicoCompra.fornecedorId;
        const quantidadeTotalDaCompra = distribuicaoOriginal.historicoCompra.quantidade;
        try {
            const [updatedDistribuicao] = await this.estoqueDb.$transaction(async (prismaTx) => {
                const updatedDistribuicao = await prismaTx.compraDistribuicao.update({
                    where: { id: distribuicaoId },
                    data: {
                        confirmadoEntrada: newStatus,
                        responsavelConfirmacaoId: userId,
                    },
                });
                if (newStatus === estoque_client_1.EstadoEntrada.CONFIRMADO &&
                    oldStatus !== estoque_client_1.EstadoEntrada.CONFIRMADO) {
                    await prismaTx.estoqueLoja.upsert({
                        where: {
                            produtoId_lojaId: {
                                produtoId: produtoId,
                                lojaId: lojaId,
                            },
                        },
                        update: {
                            quantidadeEst: { increment: quantidadeParaLoja },
                        },
                        create: {
                            produtoId: produtoId,
                            lojaId: lojaId,
                            quantidadeEst: quantidadeParaLoja,
                        },
                    });
                    let precoUnitarioReal = 0;
                    if (quantidadeTotalDaCompra > 0) {
                        precoUnitarioReal = precoConfirmado / quantidadeTotalDaCompra;
                    }
                    const precoPagoParaEstaEntrada = precoUnitarioReal * quantidadeParaLoja;
                    await prismaTx.entrada.create({
                        data: {
                            produtoId: produtoId,
                            quantidade: quantidadeParaLoja,
                            precoPago: precoConfirmado,
                            fornecedorId: fornecedorId,
                            responsavelId: userId,
                            lojaId: lojaId,
                        },
                    });
                    if (quantidadeParaLoja > 0) {
                        await prismaTx.historicoPreco.create({
                            data: {
                                produtoId: produtoId,
                                preco: precoUnitarioReal,
                                data: new Date(),
                            },
                        });
                    }
                }
                else if (newStatus !== estoque_client_1.EstadoEntrada.CONFIRMADO &&
                    oldStatus === estoque_client_1.EstadoEntrada.CONFIRMADO) {
                    const estoqueLoja = await prismaTx.estoqueLoja.findUnique({
                        where: {
                            produtoId_lojaId: {
                                produtoId: produtoId,
                                lojaId: lojaId,
                            },
                        },
                    });
                    if (estoqueLoja) {
                        await prismaTx.estoqueLoja.update({
                            where: { id: estoqueLoja.id },
                            data: {
                                quantidadeEst: {
                                    decrement: Math.min(estoqueLoja.quantidadeEst, quantidadeParaLoja),
                                },
                            },
                        });
                    }
                    await prismaTx.saida.create({
                        data: {
                            produtoId: produtoId,
                            quantidade: quantidadeParaLoja,
                            responsavelId: userId,
                            lojaId: lojaId,
                            motivo: `Reversão de Recebimento: Status da Distribuição ID ${distribuicaoId} alterado para ${newStatus}.`,
                        },
                    });
                }
                return [updatedDistribuicao];
            });
            return updatedDistribuicao;
        }
        catch (error) {
            console.error('Erro ao atualizar recebimento:', error);
            if (error instanceof estoque_client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new common_1.NotFoundException(`Erro ao encontrar registo relacionado durante a transação.`);
                }
            }
            throw new common_1.BadRequestException('Não foi possível atualizar o recebimento.');
        }
    }
};
exports.RecebimentosService = RecebimentosService;
exports.RecebimentosService = RecebimentosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [estoque_db_service_1.EstoqueDbService])
], RecebimentosService);
//# sourceMappingURL=recive.service.js.map