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
exports.ExitsController = void 0;
const common_1 = require("@nestjs/common");
const exits_service_1 = require("./exits.service");
const create_saida_dto_1 = require("./dto/create-saida.dto");
const update_saida_dto_1 = require("./dto/update-saida.dto");
const passport_1 = require("@nestjs/passport");
let ExitsController = class ExitsController {
    saidasService;
    constructor(saidasService) {
        this.saidasService = saidasService;
    }
    create(createSaidaDto, req) {
        const authUser = req.user;
        if (!authUser?.lojaId) {
            throw new common_1.ForbiddenException('Usuário não associado a uma loja.');
        }
        return this.saidasService.create(createSaidaDto, authUser);
    }
    findAll(req) {
        const authUser = req.user;
        if (!authUser?.lojaId) {
            throw new common_1.ForbiddenException('Usuário não associado a uma loja.');
        }
        return this.saidasService.findAll(authUser);
    }
    update(id, updateSaidaDto, req) {
        const authUser = req.user;
        if (!authUser?.lojaId) {
            throw new common_1.ForbiddenException('Usuário não associado a uma loja.');
        }
        return this.saidasService.update(id, updateSaidaDto, authUser);
    }
};
exports.ExitsController = ExitsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_saida_dto_1.CreateSaidaDto, Object]),
    __metadata("design:returntype", void 0)
], ExitsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExitsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_saida_dto_1.UpdateSaidaDto, Object]),
    __metadata("design:returntype", void 0)
], ExitsController.prototype, "update", null);
exports.ExitsController = ExitsController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('saidas'),
    __metadata("design:paramtypes", [exits_service_1.ExitsService])
], ExitsController);
//# sourceMappingURL=exits.controller.js.map