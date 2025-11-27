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
exports.ComprasController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const to_buy_products_service_1 = require("./to-buy-products.service");
const compras_dto_1 = require("./dto/compras.dto");
let ComprasController = class ComprasController {
    comprasService;
    constructor(comprasService) {
        this.comprasService = comprasService;
    }
    async getShoppingList(req) {
        const authUser = req.user;
        if (!authUser?.lojaId) {
            throw new common_1.ForbiddenException('Usuário não associado a uma loja.');
        }
        return this.comprasService.findAllToBuy(authUser.lojaId);
    }
    registerPurchase(dto, req) {
        const authUser = req.user;
        if (!authUser?.lojaId) {
            throw new common_1.ForbiddenException('Usuário não associado a uma loja.');
        }
        return this.comprasService.registerPurchase(dto, authUser);
    }
};
exports.ComprasController = ComprasController;
__decorate([
    (0, common_1.Get)('lista'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ComprasController.prototype, "getShoppingList", null);
__decorate([
    (0, common_1.Post)('registrar'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [compras_dto_1.RegisterPurchaseDto, Object]),
    __metadata("design:returntype", void 0)
], ComprasController.prototype, "registerPurchase", null);
exports.ComprasController = ComprasController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('compras'),
    __metadata("design:paramtypes", [to_buy_products_service_1.ComprasService])
], ComprasController);
//# sourceMappingURL=to-buy-products.controller.js.map