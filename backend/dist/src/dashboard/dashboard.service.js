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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const estoque_db_service_1 = require("../prisma/estoque-db.service");
const estoque_client_1 = require("@prisma/estoque-client");
let DashboardService = class DashboardService {
    estoqueDb;
    constructor(estoqueDb) {
        this.estoqueDb = estoqueDb;
    }
    async getStats(lojaId) {
        const rawResult = await this.estoqueDb.$queryRaw `
        SELECT COUNT(*)::int as count
        FROM estoque."EstoqueLoja" AS E
        JOIN estoque."Produto" AS P ON E."produtoId" = P."id"
        WHERE E."lojaId" = ${lojaId}
          AND P."ativo" = true
          AND E."quantidadeEst" < P."quantidadeMin"
      `;
        const itensAbaixoMin = Number(rawResult[0]?.count || 0);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const amanha = new Date(hoje);
        amanha.setDate(hoje.getDate() + 1);
        const saidasHoje = await this.estoqueDb.saida.aggregate({
            _sum: {
                quantidade: true,
            },
            where: {
                lojaId: lojaId,
                data: {
                    gte: hoje,
                    lt: amanha,
                },
            },
        });
        const comprasPendentes = await this.estoqueDb.compraDistribuicao.count({
            where: {
                lojaId: lojaId,
                confirmadoEntrada: {
                    in: [estoque_client_1.EstadoEntrada.PENDENTE, estoque_client_1.EstadoEntrada.FALTANTE],
                },
            },
        });
        const ultimaEntrada = await this.estoqueDb.entrada.findFirst({
            where: {
                lojaId: lojaId,
            },
            orderBy: {
                data: 'desc',
            },
            include: {
                produto: {
                    select: { nome: true },
                },
            },
        });
        return {
            quantidade_itens_abaixo_min: itensAbaixoMin,
            quantidade_saida: saidasHoje._sum.quantidade || 0,
            historico_compra_pendente: comprasPendentes,
            nome_ultimo_produto_chego: ultimaEntrada?.produto.nome || 'Nenhum',
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [estoque_db_service_1.EstoqueDbService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map