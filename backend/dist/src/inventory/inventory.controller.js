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
exports.InventarioController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const inventory_service_1 = require("./inventory.service");
const update_inventario_dto_1 = require("./dto/update-inventario.dto");
let InventarioController = class InventarioController {
    inventarioService;
    constructor(inventarioService) {
        this.inventarioService = inventarioService;
    }
    findAll(req) {
        const authUser = req.user;
        if (!authUser?.lojaId) {
            throw new common_1.ForbiddenException('Usuário não associado a uma loja.');
        }
        return this.inventarioService.findAllForInventory(authUser.lojaId);
    }
    ajustarEstoque(ajusteInventarioDto, req) {
        const authUser = req.user;
        if (!authUser?.lojaId) {
            throw new common_1.ForbiddenException('Usuário não associado a uma loja.');
        }
        return this.inventarioService.ajustarEstoque(ajusteInventarioDto.updates, authUser.lojaId, authUser.id);
    }
};
exports.InventarioController = InventarioController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)('ajuste'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_inventario_dto_1.AjusteInventarioDto, Object]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "ajustarEstoque", null);
exports.InventarioController = InventarioController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('inventario'),
    __metadata("design:paramtypes", [inventory_service_1.InventarioService])
], InventarioController);
//# sourceMappingURL=inventory.controller.js.map