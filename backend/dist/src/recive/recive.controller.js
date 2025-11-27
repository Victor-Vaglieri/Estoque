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
exports.RecebimentosController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const recive_service_1 = require("./recive.service");
const update_recebimento_dto_1 = require("./dto/update-recebimento.dto");
let RecebimentosController = class RecebimentosController {
    recebimentosService;
    constructor(recebimentosService) {
        this.recebimentosService = recebimentosService;
    }
    async findPending(req) {
        const userId = req.user;
        return this.recebimentosService.findPending(userId);
    }
    async updateStatus(historicoCompraId, req, updateRecebimentoDto) {
        const userId = req.user;
        return this.recebimentosService.updateStatus(userId, historicoCompraId, updateRecebimentoDto);
    }
};
exports.RecebimentosController = RecebimentosController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('/pendentes'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecebimentosController.prototype, "findPending", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, update_recebimento_dto_1.UpdateRecebimentoDto]),
    __metadata("design:returntype", Promise)
], RecebimentosController.prototype, "updateStatus", null);
exports.RecebimentosController = RecebimentosController = __decorate([
    (0, common_1.Controller)('recebimentos'),
    __metadata("design:paramtypes", [recive_service_1.RecebimentosService])
], RecebimentosController);
//# sourceMappingURL=recive.controller.js.map