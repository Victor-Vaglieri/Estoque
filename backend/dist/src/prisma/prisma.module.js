"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaModule = void 0;
const common_1 = require("@nestjs/common");
const usuarios_db_service_1 = require("./usuarios-db.service");
const estoque_db_service_1 = require("./estoque-db.service");
const alertas_db_service_1 = require("./alertas-db.service");
const cadastros_db_service_1 = require("./cadastros-db.service");
const controle_db_service_1 = require("./controle-db.service");
let PrismaModule = class PrismaModule {
};
exports.PrismaModule = PrismaModule;
exports.PrismaModule = PrismaModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [usuarios_db_service_1.UsuariosDbService, estoque_db_service_1.EstoqueDbService, alertas_db_service_1.AlertasDbService, cadastros_db_service_1.CadastrosDbService, controle_db_service_1.ControleDbService],
        exports: [usuarios_db_service_1.UsuariosDbService, estoque_db_service_1.EstoqueDbService, alertas_db_service_1.AlertasDbService, cadastros_db_service_1.CadastrosDbService, controle_db_service_1.ControleDbService],
    })
], PrismaModule);
//# sourceMappingURL=prisma.module.js.map