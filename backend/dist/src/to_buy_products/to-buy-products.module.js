"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComprasModule = void 0;
const common_1 = require("@nestjs/common");
const to_buy_products_controller_1 = require("./to-buy-products.controller");
const to_buy_products_service_1 = require("./to-buy-products.service");
const estoque_db_service_1 = require("../prisma/estoque-db.service");
let ComprasModule = class ComprasModule {
};
exports.ComprasModule = ComprasModule;
exports.ComprasModule = ComprasModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [to_buy_products_controller_1.ComprasController],
        providers: [to_buy_products_service_1.ComprasService, estoque_db_service_1.EstoqueDbService],
    })
], ComprasModule);
//# sourceMappingURL=to-buy-products.module.js.map