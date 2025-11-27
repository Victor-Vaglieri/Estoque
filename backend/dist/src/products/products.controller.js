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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const products_service_1 = require("./products.service");
const update_product_dto_1 = require("./dto/update-product.dto");
const create_product_dto_1 = require("./dto/create-product.dto");
let ProductsController = class ProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    findAllFornecedores() {
        return this.productsService.findAllFornecedores();
    }
    async getProducts(req) {
        const authUser = req.user;
        if (!authUser?.lojaId) {
            throw new common_1.ForbiddenException('Usuário não associado a uma loja.');
        }
        return this.productsService.findAll(authUser.lojaId);
    }
    async getProductsWithStock(req) {
        const authUser = req.user;
        if (!authUser?.lojaId) {
            throw new common_1.ForbiddenException('Usuário não associado a uma loja.');
        }
        return this.productsService.findWithStock(authUser.lojaId);
    }
    async addProduct(req, createProductDto) {
        const authUser = req.user;
        if (!authUser?.lojaId) {
            throw new common_1.ForbiddenException('Usuário não associado a uma loja.');
        }
        return this.productsService.create(createProductDto, authUser.lojaId);
    }
    async modifyProduct(productId, req, updateProductDto) {
        const authUser = req.user;
        if (!authUser?.lojaId) {
            throw new common_1.ForbiddenException('Usuário não associado a uma loja.');
        }
        return this.productsService.update(productId, updateProductDto, authUser.lojaId);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)('fornecedores'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAllFornecedores", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Get)('withStock'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProductsWithStock", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_product_dto_1.CreateProdutoDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "addProduct", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, update_product_dto_1.UpdateProdutoDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "modifyProduct", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map