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
exports.RelatoriosController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const reports_service_1 = require("./reports.service");
const usuarios_client_1 = require("@prisma/usuarios-client");
let RelatoriosController = class RelatoriosController {
    relatoriosService;
    constructor(relatoriosService) {
        this.relatoriosService = relatoriosService;
    }
    checkGestor(user) {
        if (!user.funcoes.includes(usuarios_client_1.Funcao.GESTOR)) {
            throw new common_1.ForbiddenException('Acesso negado. Apenas Gestores.');
        }
    }
    getOverview(req) {
        const authUser = req.user;
        if (!authUser?.lojaId) {
            throw new common_1.ForbiddenException('Usuário não associado a uma loja.');
        }
        return this.relatoriosService.getOverview(authUser.lojaId);
    }
    getStockValueByLoja(req) {
        this.checkGestor(req.user);
        return this.relatoriosService.getStockValueByLoja();
    }
    getPurchaseHistory(req) {
        this.checkGestor(req.user);
        return this.relatoriosService.getPurchaseHistory();
    }
    async exportControle(req, res, startDate, endDate) {
        this.checkGestor(req.user);
        if (!startDate || !endDate) {
            throw new common_1.BadRequestException('Data de início e fim são obrigatórias.');
        }
        const fileBuffer = await this.relatoriosService.exportControle(new Date(startDate), new Date(endDate));
        const fileName = `controle_${startDate}_a_${endDate}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        return new common_1.StreamableFile(fileBuffer);
    }
    async exportFornecedores(req, res) {
        this.checkGestor(req.user);
        const fileBuffer = await this.relatoriosService.exportFornecedores();
        const fileName = `estoque_por_fornecedor_${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        return new common_1.StreamableFile(fileBuffer);
    }
    async debugDatabase() {
        const tudo = await this.relatoriosService['controleDb'].costuraRegistro.findMany({
            take: 5,
        });
        return {
            mensagem: "Teste de conexão direta",
            quantidade: tudo.length,
            amostra: tudo.map(item => ({
                id: item.id,
                cliente: item.nome_cliente,
                data_recebimento: item.data_recebimento,
                tipo_data: typeof item.data_recebimento
            }))
        };
    }
};
exports.RelatoriosController = RelatoriosController;
__decorate([
    (0, common_1.Get)('overview'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RelatoriosController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('stock-value-by-loja'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RelatoriosController.prototype, "getStockValueByLoja", null);
__decorate([
    (0, common_1.Get)('purchase-history'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RelatoriosController.prototype, "getPurchaseHistory", null);
__decorate([
    (0, common_1.Get)('export/controle'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], RelatoriosController.prototype, "exportControle", null);
__decorate([
    (0, common_1.Get)('export/fornecedores'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RelatoriosController.prototype, "exportFornecedores", null);
__decorate([
    (0, common_1.Get)('debug-db'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RelatoriosController.prototype, "debugDatabase", null);
exports.RelatoriosController = RelatoriosController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('relatorios'),
    __metadata("design:paramtypes", [reports_service_1.RelatoriosService])
], RelatoriosController);
//# sourceMappingURL=reports.controller.js.map