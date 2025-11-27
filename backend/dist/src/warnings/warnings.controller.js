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
exports.WarningsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const warnings_service_1 = require("./warnings.service");
const create_alerta_dto_1 = require("./dto/create-alerta.dto");
const update_alerta_dto_1 = require("./dto/update-alerta.dto");
let WarningsController = class WarningsController {
    warningsService;
    constructor(warningsService) {
        this.warningsService = warningsService;
    }
    create(req, createAlertaDto) {
        const userId = req.user;
        return this.warningsService.create(userId, createAlertaDto);
    }
    findAll(req) {
        const userId = req.user;
        return this.warningsService.findAll(userId);
    }
    findOne(req, id) {
        const userId = req.user;
        return this.warningsService.findOne(userId, id);
    }
    update(req, id, updateAlertaDto) {
        const userId = req.user;
        return this.warningsService.update(userId, id, updateAlertaDto);
    }
    remove(req, id) {
        const userId = req.user;
        return this.warningsService.remove(userId, id);
    }
};
exports.WarningsController = WarningsController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_alerta_dto_1.CreateAlertaDto]),
    __metadata("design:returntype", void 0)
], WarningsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WarningsController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], WarningsController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_alerta_dto_1.UpdateAlertaDto]),
    __metadata("design:returntype", void 0)
], WarningsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], WarningsController.prototype, "remove", null);
exports.WarningsController = WarningsController = __decorate([
    (0, common_1.Controller)('avisos'),
    __metadata("design:paramtypes", [warnings_service_1.WarningsService])
], WarningsController);
//# sourceMappingURL=warnings.controller.js.map