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
exports.ControleService = void 0;
const common_1 = require("@nestjs/common");
const controle_db_service_1 = require("../prisma/controle-db.service");
const controle_client_1 = require("@prisma/controle-client");
let ControleService = class ControleService {
    controleDB;
    constructor(controleDB) {
        this.controleDB = controleDB;
    }
    async findAll(tipo, authUser) {
        if (!authUser?.lojaId) {
            throw new common_1.ForbiddenException('Usuário não associado a uma loja.');
        }
        const selectFields = {
            id: true,
            rol: true,
            nome_cliente: true,
            data_recebimento: true,
            data_da_entrega: true,
        };
        const whereClause = {
            lojaId: authUser.lojaId,
        };
        switch (tipo) {
            case 'costura':
                return this.controleDB.costuraRegistro.findMany({
                    select: selectFields,
                    where: whereClause,
                    orderBy: { rol: 'desc' },
                });
            case 'tingimento':
                return this.controleDB.tingimentoRegistro.findMany({
                    select: selectFields,
                    where: whereClause,
                    orderBy: { rol: 'desc' },
                });
            case 'tapete':
                return this.controleDB.tapeteRegistro.findMany({
                    select: selectFields,
                    where: whereClause,
                    orderBy: { rol: 'desc' },
                });
            case 'mala':
                return this.controleDB.malaRegistro.findMany({
                    select: selectFields,
                    where: whereClause,
                    orderBy: { rol: 'desc' },
                });
        }
    }
    async findByRol(tipo, rol, authUser) {
        if (!authUser?.lojaId) {
            throw new common_1.ForbiddenException('Usuário não associado a uma loja.');
        }
        let registro;
        switch (tipo) {
            case 'costura':
                registro = await this.controleDB.costuraRegistro.findUnique({
                    where: { rol },
                    include: { itens: true },
                });
                break;
            case 'tingimento':
                registro = await this.controleDB.tingimentoRegistro.findUnique({
                    where: { rol },
                    include: { itens: true },
                });
                break;
            case 'tapete':
                registro = await this.controleDB.tapeteRegistro.findUnique({
                    where: { rol },
                    include: { itens: true },
                });
                break;
            case 'mala':
                registro = await this.controleDB.malaRegistro.findUnique({
                    where: { rol },
                    include: { itens: true },
                });
                break;
        }
        if (!registro) {
            return null;
        }
        if (registro.lojaId !== authUser.lojaId) {
            throw new common_1.ForbiddenException('Acesso negado a este ROL.');
        }
        const { itens, ...fixos } = registro;
        return { fixos, multiplos: itens || [] };
    }
    async create(tipo, payload, authUser) {
        if (!authUser || !authUser.lojaId) {
            throw new common_1.ForbiddenException('Usuário não associado a uma loja. Impossível criar registro.');
        }
        const dadosFixos = this.prepareFixedData(payload.fixos);
        const dadosMultiplos = this.prepareMultipleData(payload.multiplos);
        const lojaId = Number(authUser.lojaId);
        switch (tipo) {
            case 'costura':
                return this.controleDB.costuraRegistro.create({
                    data: {
                        ...dadosFixos,
                        lojaId: lojaId,
                        rol: Number(dadosFixos.rol),
                        itens: {
                            create: dadosMultiplos,
                        },
                    },
                });
            case 'tingimento':
                return this.controleDB.tingimentoRegistro.create({
                    data: {
                        ...dadosFixos,
                        lojaId: lojaId,
                        rol: Number(dadosFixos.rol),
                        itens: {
                            create: dadosMultiplos,
                        },
                    },
                });
            case 'tapete':
                return this.controleDB.tapeteRegistro.create({
                    data: {
                        ...dadosFixos,
                        lojaId: lojaId,
                        rol: Number(dadosFixos.rol),
                        itens: {
                            create: dadosMultiplos,
                        },
                    },
                });
            case 'mala':
                return this.controleDB.malaRegistro.create({
                    data: {
                        ...dadosFixos,
                        lojaId: lojaId,
                        rol: Number(dadosFixos.rol),
                        itens: {
                            create: dadosMultiplos,
                        },
                    },
                });
        }
    }
    async update(tipo, payload, authUser) {
        if (!authUser?.lojaId) {
            throw new common_1.ForbiddenException('Usuário não associado a uma loja.');
        }
        const dadosFixos = this.prepareFixedData(payload.fixos);
        const dadosMultiplos = this.prepareMultipleData(payload.multiplos);
        const rol = dadosFixos.rol;
        if (!rol) {
            throw new common_1.NotFoundException('ROL não fornecido para atualização.');
        }
        delete dadosFixos.id;
        delete dadosFixos.createdAt;
        delete dadosFixos.updatedAt;
        delete dadosFixos.lojaId;
        return this.controleDB.$transaction(async (tx) => {
            let registroAtualizado;
            let registroId;
            const registroExistente = await tx[`${tipo}Registro`].findUnique({
                where: { rol },
                select: { id: true, lojaId: true },
            });
            if (!registroExistente) {
                throw new common_1.NotFoundException('ROL não encontrado.');
            }
            if (registroExistente.lojaId !== authUser.lojaId) {
                throw new common_1.ForbiddenException('Acesso negado a este ROL.');
            }
            switch (tipo) {
                case 'costura':
                    registroAtualizado = await tx.costuraRegistro.update({
                        where: { rol },
                        data: dadosFixos,
                    });
                    registroId = registroAtualizado.id;
                    await tx.costuraItem.deleteMany({ where: { registroId } });
                    if (dadosMultiplos.length > 0) {
                        await tx.costuraItem.createMany({
                            data: dadosMultiplos.map((item) => ({ ...item, registroId })),
                        });
                    }
                    break;
                case 'tingimento':
                    registroAtualizado = await tx.tingimentoRegistro.update({
                        where: { rol },
                        data: dadosFixos,
                    });
                    registroId = registroAtualizado.id;
                    await tx.tingimentoItem.deleteMany({ where: { registroId } });
                    if (dadosMultiplos.length > 0) {
                        await tx.tingimentoItem.createMany({
                            data: dadosMultiplos.map((item) => ({ ...item, registroId })),
                        });
                    }
                    break;
                case 'tapete':
                    registroAtualizado = await tx.tapeteRegistro.update({
                        where: { rol },
                        data: dadosFixos,
                    });
                    registroId = registroAtualizado.id;
                    await tx.tapeteItem.deleteMany({ where: { registroId } });
                    if (dadosMultiplos.length > 0) {
                        await tx.tapeteItem.createMany({
                            data: dadosMultiplos.map((item) => ({ ...item, registroId })),
                        });
                    }
                    break;
                case 'mala':
                    registroAtualizado = await tx.malaRegistro.update({
                        where: { rol },
                        data: dadosFixos,
                    });
                    registroId = registroAtualizado.id;
                    await tx.malaItem.deleteMany({ where: { registroId } });
                    if (dadosMultiplos.length > 0) {
                        await tx.malaItem.createMany({
                            data: dadosMultiplos.map((item) => ({ ...item, registroId })),
                        });
                    }
                    break;
            }
            return registroAtualizado;
        });
    }
    mapMeioDeContato(value) {
        if (!value)
            return null;
        const key = value.toUpperCase().trim();
        switch (key) {
            case 'GOOGLE':
                return controle_client_1.MeioDeContato.GOOGLE;
            case 'REDE_SOCIAL':
                return controle_client_1.MeioDeContato.REDE_SOCIAL;
            case 'AMIGOS':
                return controle_client_1.MeioDeContato.AMIGOS;
            case 'LOJA':
                return controle_client_1.MeioDeContato.LOJA;
            case 'OUTROS':
                return controle_client_1.MeioDeContato.OUTROS;
            default:
                throw new common_1.BadRequestException(`Valor inválido para Meio de Contato: ${value}`);
        }
    }
    prepareFixedData(fixos) {
        const dadosLimpos = {};
        const dateKeys = [
            'data_recebimento',
            'data_da_entrega',
            'envio_a_washtec',
            'retorno_da_washtec',
            'envio_a_master',
            'retorno_da_master',
        ];
        for (const key in fixos) {
            const value = fixos[key];
            if (key === 'meio_de_contato') {
                dadosLimpos['meio_de_contato_inicial'] = this.mapMeioDeContato(value);
            }
            else if (dateKeys.includes(key)) {
                dadosLimpos[key] = value ? new Date(value) : null;
            }
            else if (key === 'rol' && value) {
                dadosLimpos[key] = parseInt(value, 10);
            }
            else if (value !== undefined && value !== null) {
                dadosLimpos[key] = value;
            }
        }
        delete dadosLimpos.id;
        delete dadosLimpos.createdAt;
        delete dadosLimpos.updatedAt;
        return dadosLimpos;
    }
    prepareMultipleData(multiplos) {
        return multiplos.map((item) => {
            const itemLimpo = { ...item };
            for (const key in itemLimpo) {
                const value = itemLimpo[key];
                if (key.includes('custo') ||
                    key.includes('cobrado') ||
                    key.includes('valor')) {
                    const floatVal = parseFloat(value);
                    itemLimpo[key] = isNaN(floatVal) ? null : floatVal;
                }
            }
            delete itemLimpo.id;
            delete itemLimpo.registroId;
            return itemLimpo;
        });
    }
};
exports.ControleService = ControleService;
exports.ControleService = ControleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [controle_db_service_1.ControleDbService])
], ControleService);
//# sourceMappingURL=controle.service.js.map