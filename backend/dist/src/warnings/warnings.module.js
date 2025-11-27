"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarningsModule = void 0;
const common_1 = require("@nestjs/common");
const warnings_controller_1 = require("./warnings.controller");
const warnings_service_1 = require("./warnings.service");
const alertas_db_service_1 = require("../prisma/alertas-db.service");
const users_module_1 = require("../users/users.module");
const warnings_listener_1 = require("./warnings.listener");
let WarningsModule = class WarningsModule {
};
exports.WarningsModule = WarningsModule;
exports.WarningsModule = WarningsModule = __decorate([
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule],
        controllers: [warnings_controller_1.WarningsController],
        providers: [warnings_service_1.WarningsService, warnings_listener_1.AlertasListener, alertas_db_service_1.AlertasDbService],
    })
], WarningsModule);
//# sourceMappingURL=warnings.module.js.map