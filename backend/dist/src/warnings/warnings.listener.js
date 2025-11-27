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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertasListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const warnings_service_1 = require("./warnings.service");
const users_service_1 = require("../users/users.service");
let AlertasListener = class AlertasListener {
    alertasService;
    usuariosService;
    constructor(alertasService, usuariosService) {
        this.alertasService = alertasService;
        this.usuariosService = usuariosService;
    }
    async handleInventarioAlerta(payload) {
        try {
            const usuariosDaLoja = await this.usuariosService.findByLojaId(payload.lojaId);
            if (usuariosDaLoja.length === 0) {
                console.warn(`Alerta de inventário (Loja ${payload.lojaId}), mas nenhum usuário encontrado.`);
                return;
            }
            const novoAlerta = await this.alertasService.createAlertaSistema({
                titulo: payload.titulo,
                descricao: payload.descricao,
                importancia: payload.importancia,
                lojaId: payload.lojaId,
                criadorId: payload.userId,
                criadorNome: 'Sistema (Ajuste de Inventário)',
            });
            await this.alertasService.associarAlertaAUsuarios(novoAlerta.id, usuariosDaLoja.map((u) => u.id));
        }
        catch (error) {
            console.error('Falha ao processar evento de alerta de inventário:', error);
        }
    }
};
exports.AlertasListener = AlertasListener;
__decorate([
    (0, event_emitter_1.OnEvent)('inventario.alerta'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AlertasListener.prototype, "handleInventarioAlerta", null);
exports.AlertasListener = AlertasListener = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [warnings_service_1.WarningsService,
        users_service_1.UsersService])
], AlertasListener);
//# sourceMappingURL=warnings.listener.js.map