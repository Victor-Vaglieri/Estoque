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
exports.PerfisController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const cadasters_service_1 = require("./cadasters.service");
const perfis_dto_1 = require("./dto/perfis.dto");
const usuarios_client_1 = require("@prisma/usuarios-client");
let PerfisController = class PerfisController {
    perfisService;
    constructor(perfisService) {
        this.perfisService = perfisService;
    }
    checkGestor(user) {
        if (!user.funcoes || !user.funcoes.includes(usuarios_client_1.Funcao.GESTOR)) {
            throw new common_1.ForbiddenException('Acesso negado. Apenas Gestores.');
        }
    }
    getUserId(user) {
        const id = user.id || user.sub;
        if (!id) {
            throw new common_1.InternalServerErrorException('ID do usuário não encontrado no token.');
        }
        return id;
    }
    getSolicitacoes(req) {
        this.checkGestor(req.user);
        return this.perfisService.getSolicitacoes();
    }
    getUsuarios(req) {
        this.checkGestor(req.user);
        return this.perfisService.getUsuarios();
    }
    getSolicitacoesConfirmadas(req) {
        this.checkGestor(req.user);
        return this.perfisService.getSolicitacoesConfirmadas();
    }
    getLojas(req) {
        this.checkGestor(req.user);
        return this.perfisService.getLojas();
    }
    aprovarSolicitacao(id, dto, req) {
        this.checkGestor(req.user);
        const adminId = this.getUserId(req.user);
        return this.perfisService.aprovarSolicitacao(adminId, id, dto);
    }
    rejeitarSolicitacao(id, req) {
        this.checkGestor(req.user);
        return this.perfisService.rejeitarSolicitacao(id);
    }
    updateUser(id, dto, req) {
        this.checkGestor(req.user);
        return this.perfisService.updateUser(id, dto);
    }
    deleteUser(id, req) {
        this.checkGestor(req.user);
        const adminId = this.getUserId(req.user);
        return this.perfisService.deleteUser(adminId, id);
    }
    async findAllFornecedores(req) {
        this.checkGestor(req.user);
        return this.perfisService.findAllFornecedores();
    }
    async createFornecedor(req, body) {
        this.checkGestor(req.user);
        return this.perfisService.createFornecedor(body.nome);
    }
    async updateFornecedor(req, id, body) {
        this.checkGestor(req.user);
        return this.perfisService.updateFornecedor(Number(id), body.nome);
    }
    async deleteFornecedor(req, id) {
        this.checkGestor(req.user);
        return this.perfisService.deleteFornecedor(Number(id));
    }
};
exports.PerfisController = PerfisController;
__decorate([
    (0, common_1.Get)('solicitacoes'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerfisController.prototype, "getSolicitacoes", null);
__decorate([
    (0, common_1.Get)('usuarios'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerfisController.prototype, "getUsuarios", null);
__decorate([
    (0, common_1.Get)('confirmados'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerfisController.prototype, "getSolicitacoesConfirmadas", null);
__decorate([
    (0, common_1.Get)('lojas'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerfisController.prototype, "getLojas", null);
__decorate([
    (0, common_1.Post)('aprovar/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, perfis_dto_1.AprovarSolicitacaoDto, Object]),
    __metadata("design:returntype", void 0)
], PerfisController.prototype, "aprovarSolicitacao", null);
__decorate([
    (0, common_1.Delete)('rejeitar/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PerfisController.prototype, "rejeitarSolicitacao", null);
__decorate([
    (0, common_1.Patch)('usuario/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, perfis_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", void 0)
], PerfisController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)('usuario/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PerfisController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('fornecedores'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PerfisController.prototype, "findAllFornecedores", null);
__decorate([
    (0, common_1.Post)('fornecedores'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PerfisController.prototype, "createFornecedor", null);
__decorate([
    (0, common_1.Patch)('fornecedores/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PerfisController.prototype, "updateFornecedor", null);
__decorate([
    (0, common_1.Delete)('fornecedores/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PerfisController.prototype, "deleteFornecedor", null);
exports.PerfisController = PerfisController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('perfis'),
    __metadata("design:paramtypes", [cadasters_service_1.PerfisService])
], PerfisController);
//# sourceMappingURL=cadasters.controller.js.map