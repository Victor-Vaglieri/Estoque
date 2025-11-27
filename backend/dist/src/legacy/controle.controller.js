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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControleController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const controle_service_1 = require("./controle.service");
const legacy_payload_dto_1 = require("./dto/legacy-payload.dto");
let ControleController = class ControleController {
    legacyService;
    constructor(legacyService) {
        this.legacyService = legacyService;
    }
    validateTipo(tipo) {
        const tiposValidos = [
            'costura',
            'tingimento',
            'tapete',
            'mala',
        ];
        if (!tiposValidos.includes(tipo)) {
            throw new common_1.BadRequestException('Tipo de serviço inválido');
        }
        return tipo;
    }
    create(tipoParam, legacyPayloadDto, req) {
        const tipo = this.validateTipo(tipoParam);
        const authUser = req.user;
        return this.legacyService.create(tipo, legacyPayloadDto, authUser);
    }
    update(tipoParam, legacyPayloadDto, req) {
        const tipo = this.validateTipo(tipoParam);
        const authUser = req.user;
        return this.legacyService.update(tipo, legacyPayloadDto, authUser);
    }
    async find(tipoParam, req, rol) {
        const tipo = this.validateTipo(tipoParam);
        const authUser = req.user;
        if (rol) {
            const rolNumerico = parseInt(rol, 10);
            if (isNaN(rolNumerico)) {
                throw new common_1.BadRequestException('ROL inválido. Deve ser um número.');
            }
            const data = await this.legacyService.findByRol(tipo, rolNumerico, authUser);
            if (!data) {
                throw new common_1.NotFoundException('Registro não encontrado com este ROL.');
            }
            return data;
        }
        return this.legacyService.findAll(tipo, authUser);
    }
};
exports.ControleController = ControleController;
__decorate([
    (0, common_1.Post)(':tipo'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('tipo')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, legacy_payload_dto_1.LegacyPayloadDto, Object]),
    __metadata("design:returntype", void 0)
], ControleController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':tipo'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('tipo')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, legacy_payload_dto_1.LegacyPayloadDto, Object]),
    __metadata("design:returntype", void 0)
], ControleController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(':tipo'),
    __param(0, (0, common_1.Param)('tipo')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('rol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ControleController.prototype, "find", null);
exports.ControleController = ControleController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('legacy'),
    __metadata("design:paramtypes", [controle_service_1.ControleService])
], ControleController);
//# sourceMappingURL=controle.controller.js.map