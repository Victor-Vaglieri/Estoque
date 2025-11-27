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
exports.WarningsService = void 0;
const common_1 = require("@nestjs/common");
const alertas_db_service_1 = require("../prisma/alertas-db.service");
const alertas_client_1 = require("@prisma/alertas-client");
const usuarios_client_1 = require("@prisma/usuarios-client");
let WarningsService = class WarningsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(authUser) {
        return this.prisma.alertas.findMany({
            where: {
                concluido: false,
                OR: [
                    { lojaId: authUser.lojaId },
                    { destinatarios: { some: { userId: authUser.id } } },
                ],
            },
            orderBy: [{ importancia: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async findOne(authUser, id) {
        const alerta = await this.prisma.alertas.findUnique({
            where: { id: id },
            include: {
                destinatarios: {
                    select: { userId: true },
                },
            },
        });
        if (!alerta) {
            throw new common_1.NotFoundException(`Alerta com ID ${id} não encontrado.`);
        }
        const isDaLoja = alerta.lojaId === authUser.lojaId;
        const isDestinatario = alerta.destinatarios.some((d) => d.userId === authUser.id);
        if (!isDaLoja && !isDestinatario) {
            throw new common_1.ForbiddenException('Você não tem permissão para ver este alerta.');
        }
        delete alerta.destinatarios;
        return alerta;
    }
    async create(authUser, createAlertaDto) {
        const { destinatarios, ...restDto } = createAlertaDto;
        return this.prisma.alertas.create({
            data: {
                ...restDto,
                concluido: false,
                criadorId: authUser.id,
                criadorNome: authUser.nome,
                lojaId: authUser.lojaId,
                destinatarios: {
                    create: destinatarios && destinatarios.length > 0
                        ? destinatarios.map((userId) => ({ userId }))
                        : [],
                },
            },
        });
    }
    async update(authUser, id, updateAlertaDto) {
        const alerta = await this.findOne(authUser, id);
        if (alerta.criadorId !== authUser.id) {
            throw new common_1.ForbiddenException('Você não tem permissão para atualizar este alerta (somente o criador).');
        }
        let finishedAt = alerta.finishedAt;
        if (updateAlertaDto.concluido === true && !alerta.concluido) {
            finishedAt = new Date();
        }
        else if (updateAlertaDto.concluido === false && alerta.concluido) {
            finishedAt = null;
        }
        const { destinatarios, ...restDto } = updateAlertaDto;
        let destinatariosUpdateOps = {};
        if (destinatarios !== undefined) {
            destinatariosUpdateOps = {
                deleteMany: {},
                create: destinatarios.map((userId) => ({ userId })),
            };
        }
        try {
            return await this.prisma.alertas.update({
                where: { id: id },
                data: {
                    ...restDto,
                    finishedAt: finishedAt,
                    ...(destinatarios !== undefined && {
                        destinatarios: destinatariosUpdateOps,
                    }),
                },
            });
        }
        catch (error) {
            if (error instanceof alertas_client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025') {
                throw new common_1.NotFoundException(`Alerta com ID ${id} não encontrado.`);
            }
            throw error;
        }
    }
    async remove(authUser, id) {
        const alerta = await this.findOne(authUser, id);
        const isGestor = authUser.funcoes.includes(usuarios_client_1.Funcao.GESTOR);
        const isCriador = alerta.criadorId === authUser.id;
        if (!isGestor && !isCriador) {
            throw new common_1.ForbiddenException('Você não tem permissão para remover este alerta (somente o criador ou gestor).');
        }
        try {
            return await this.prisma.alertas.delete({
                where: { id: id },
            });
        }
        catch (error) {
            if (error instanceof alertas_client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025') {
                throw new common_1.NotFoundException(`Alerta com ID ${id} não encontrado.`);
            }
            throw error;
        }
    }
    async createAlertaSistema(dto) {
        return this.prisma.alertas.create({
            data: {
                titulo: dto.titulo,
                descricao: dto.descricao,
                importancia: dto.importancia,
                lojaId: dto.lojaId,
                criadorId: dto.criadorId,
                criadorNome: dto.criadorNome,
                concluido: false,
            },
        });
    }
    async associarAlertaAUsuarios(alertaId, userIds) {
        const dataToCreate = userIds.map((userId) => ({
            alertaId: alertaId,
            userId: userId,
        }));
        try {
            return await this.prisma.alertaDestinatario.createMany({
                data: dataToCreate,
            });
        }
        catch (error) {
            if (error instanceof alertas_client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                console.log('Ignorando duplicatas ao associar alerta (P2002).');
                return { count: 0 };
            }
            throw error;
        }
    }
};
exports.WarningsService = WarningsService;
exports.WarningsService = WarningsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [alertas_db_service_1.AlertasDbService])
], WarningsService);
//# sourceMappingURL=warnings.service.js.map