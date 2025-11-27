"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelatoriosService = void 0;
const common_1 = require("@nestjs/common");
const alertas_db_service_1 = require("../prisma/alertas-db.service");
const controle_db_service_1 = require("../prisma/controle-db.service");
const estoque_db_service_1 = require("../prisma/estoque-db.service");
const usuarios_db_service_1 = require("../prisma/usuarios-db.service");
const XLSX = __importStar(require("xlsx"));
let RelatoriosService = class RelatoriosService {
    estoqueDb;
    controleDb;
    alertasDb;
    usuariosDb;
    constructor(estoqueDb, controleDb, alertasDb, usuariosDb) {
        this.estoqueDb = estoqueDb;
        this.controleDb = controleDb;
        this.alertasDb = alertasDb;
        this.usuariosDb = usuariosDb;
    }
    async getOverview(lojaId) {
        const rawResult = await this.estoqueDb.$queryRaw `
            SELECT COUNT(*)::int as count
            FROM estoque."EstoqueLoja" AS E
            JOIN estoque."Produto" AS P ON E."produtoId" = P."id"
            WHERE E."lojaId" = ${lojaId}
              AND P."ativo" = true
              AND E."quantidadeEst" < P."quantidadeMin"
        `;
        const lowStockCount = Number(rawResult[0]?.count || 0);
        const totalItems = await this.estoqueDb.produto.count({
            where: { ativo: true },
        });
        const allEstoque = await this.estoqueDb.estoqueLoja.findMany({
            include: {
                produto: {
                    include: {
                        historicoPreco: { orderBy: { data: 'desc' }, take: 1 },
                        entradas: { orderBy: { data: 'desc' }, take: 1 }
                    },
                },
            },
        });
        let totalValue = 0;
        allEstoque.forEach((est) => {
            let lastPrice = est.produto.historicoPreco[0]?.preco;
            if (!lastPrice && est.produto.entradas?.length > 0) {
                lastPrice = est.produto.entradas[0].precoPago;
            }
            totalValue += est.quantidadeEst * (lastPrice || 0);
        });
        return {
            totalValue,
            totalItems,
            lowStockCount,
        };
    }
    async getStockValueByLoja() {
        const lojas = await this.estoqueDb.loja.findMany();
        const allEstoque = await this.estoqueDb.estoqueLoja.findMany({
            include: {
                produto: {
                    include: {
                        historicoPreco: {
                            orderBy: { data: 'desc' },
                            take: 1,
                        },
                        entradas: {
                            orderBy: { data: 'desc' },
                            take: 1,
                        },
                    },
                },
            },
        });
        const valueMap = new Map();
        allEstoque.forEach((est) => {
            let lastPrice = est.produto.historicoPreco[0]?.preco;
            if (!lastPrice) {
                lastPrice = est.produto.entradas[0]?.precoPago ?? 0;
            }
            const itemValue = est.quantidadeEst * lastPrice;
            const currentTotal = valueMap.get(est.lojaId) ?? 0;
            valueMap.set(est.lojaId, currentTotal + itemValue);
        });
        return lojas.map((loja) => {
            return {
                name: loja.nome,
                value: valueMap.get(loja.id) || 0,
            };
        });
    }
    async getPurchaseHistory() {
        const allPurchases = await this.estoqueDb.historicoCompra.findMany({
            orderBy: { data: 'asc' },
            select: { data: true, precoTotal: true },
        });
        const monthlyTotals = {};
        allPurchases.forEach((purchase) => {
            const monthKey = purchase.data.toISOString().substring(0, 7);
            if (!monthlyTotals[monthKey]) {
                monthlyTotals[monthKey] = 0;
            }
            monthlyTotals[monthKey] += purchase.precoTotal;
        });
        return Object.entries(monthlyTotals).map(([month, total]) => ({
            month: month,
            totalSpent: total,
        }));
    }
    async exportControle(startDate, endDate) {
        endDate.setHours(23, 59, 59, 999);
        console.log('--- FILTRANDO VIA CÓDIGO (MEMÓRIA) ---');
        const allCostura = await this.controleDb.costuraRegistro.findMany({ include: { itens: true } });
        const allTingimento = await this.controleDb.tingimentoRegistro.findMany({ include: { itens: true } });
        const allTapete = await this.controleDb.tapeteRegistro.findMany({ include: { itens: true } });
        const allMala = await this.controleDb.malaRegistro.findMany({ include: { itens: true } });
        const isWithinRange = (data) => {
            if (!data)
                return false;
            const d = new Date(data);
            return d >= startDate && d <= endDate;
        };
        const costura = allCostura.filter(r => isWithinRange(r.data_recebimento));
        const tingimento = allTingimento.filter(r => isWithinRange(r.data_recebimento));
        const tapete = allTapete.filter(r => isWithinRange(r.data_recebimento));
        const mala = allMala.filter(r => isWithinRange(r.data_recebimento));
        console.log(`Registros filtrados: Costura=${costura.length}, Mala=${mala.length}`);
        const costuraSheet = costura.flatMap((r) => r.itens.map((item) => ({
            ROL: r.rol, LojaID: r.lojaId, Cliente: r.nome_cliente, DataRecebimento: r.data_recebimento, DataEntrega: r.data_da_entrega, Ticket: item.ticket, Peça: item.peca, Serviço: item.descricao_do_servico, Custo: item.custo, Cobrado: item.cobrado
        })));
        const tingimentoSheet = tingimento.flatMap((r) => r.itens.map((item) => ({
            ROL: r.rol, LojaID: r.lojaId, Cliente: r.nome_cliente, DataRecebimento: r.data_recebimento, EnvioWashtec: r.envio_a_washtec, RetornoWashtec: r.retorno_da_washtec, DataEntrega: r.data_da_entrega, StripTag: item.strip_tag, Peça: item.peca, ValorWashtec: item.valor_washtec, ValorCobrado: item.valor_cobrado
        })));
        const tapeteSheet = tapete.flatMap((r) => r.itens.map((item) => ({
            ROL: r.rol, LojaID: r.lojaId, Cliente: r.nome_cliente, OS_Master: r.os_master, DataRecebimento: r.data_recebimento, EnvioMaster: r.envio_a_master, RetornoMaster: r.retorno_da_master, DataEntrega: r.data_da_entrega, StripDryclean: item.strip_tag_dryclean, StripMaster: item.strip_tag_master, ValorMaster: item.valor_master, ValorCobrado: item.valor_cobrado
        })));
        const malaSheet = mala.flatMap((r) => r.itens.map((item) => ({
            ROL: r.rol, LojaID: r.lojaId, Cliente: r.nome_cliente, OS_Master: r.os_master, DataRecebimento: r.data_recebimento, EnvioMaster: r.envio_a_master, RetornoMaster: r.retorno_da_master, DataEntrega: r.data_da_entrega, StripDryclean: item.strip_tag_dryclean, StripMaster: item.strip_tag_master, ValorMaster: item.valor_master, ValorCobrado: item.valor_cobrado
        })));
        try {
            const wb = XLSX.utils.book_new();
            if (costuraSheet.length > 0)
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(costuraSheet), 'Costura');
            if (tingimentoSheet.length > 0)
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tingimentoSheet), 'Tingimento');
            if (tapeteSheet.length > 0)
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tapeteSheet), 'Tapete');
            if (malaSheet.length > 0)
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(malaSheet), 'Mala');
            if (wb.SheetNames.length === 0) {
                const wsEmpty = XLSX.utils.aoa_to_sheet([['Aviso'], ['Nenhum registro encontrado neste período (verifique as datas).']]);
                XLSX.utils.book_append_sheet(wb, wsEmpty, 'Sem Dados');
            }
            return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
        }
        catch (error) {
            console.error('Erro ao gerar XLSX:', error);
            throw new common_1.InternalServerErrorException('Falha ao gerar o arquivo XLSX do Controle.');
        }
    }
    async exportFornecedores() {
        const fornecedores = await this.estoqueDb.fornecedor.findMany({
            include: {
                produtos: {
                    where: { ativo: true },
                    include: {
                        estoqueLojas: {
                            select: { lojaId: true, quantidadeEst: true },
                        },
                    },
                },
            },
        });
        const lojas = await this.estoqueDb.loja.findMany();
        try {
            const wb = XLSX.utils.book_new();
            for (const fornecedor of fornecedores) {
                const sheetData = fornecedor.produtos.map((p) => {
                    const estoqueTotal = p.estoqueLojas.reduce((sum, est) => sum + est.quantidadeEst, 0);
                    const diferenca = (p.quantidadeMax - estoqueTotal) >= 0 ? (p.quantidadeMax - estoqueTotal) : 0;
                    const estoquePorLoja = {};
                    for (const loja of lojas) {
                        const estoqueLoja = p.estoqueLojas.find((el) => el.lojaId === loja.id);
                        estoquePorLoja[`Estoque (${loja.nome})`] = estoqueLoja?.quantidadeEst ?? 0;
                    }
                    return {
                        Produto: p.nome,
                        Tipo: p.producao ? 'Produção' : 'Revenda',
                        Codigo: p.codigo,
                        Unidade: p.unidade,
                        EstoqueMinimo: p.quantidadeMin,
                        EstoqueMaximo: p.quantidadeMax,
                        EstoqueTotal: estoqueTotal,
                        'Diferença (Max - Total)': diferenca,
                        ...estoquePorLoja,
                    };
                });
                if (sheetData.length > 0) {
                    const sheetName = fornecedor.nome.substring(0, 30).replace(/[\\/?*[\]]/g, '');
                    const ws = XLSX.utils.json_to_sheet(sheetData);
                    ws['!cols'] = this.autoFitColumns(sheetData);
                    XLSX.utils.book_append_sheet(wb, ws, sheetName);
                }
            }
            if (wb.SheetNames.length === 0) {
                const wsEmpty = XLSX.utils.aoa_to_sheet([['Nenhum fornecedor com produtos ativos encontrado.']]);
                wsEmpty['!cols'] = [{ wch: 50 }];
                XLSX.utils.book_append_sheet(wb, wsEmpty, 'Vazio');
            }
            return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
        }
        catch (error) {
            console.error(error);
            throw new common_1.InternalServerErrorException('Falha ao gerar o arquivo XLSX de Fornecedores.');
        }
    }
    autoFitColumns(data) {
        if (!data || data.length === 0)
            return [];
        const headers = Object.keys(data[0]);
        return headers.map((key) => {
            const maxContentLength = data.reduce((max, row) => {
                const cellValue = row[key] ? String(row[key]) : '';
                return Math.max(max, cellValue.length);
            }, key.length);
            return { wch: maxContentLength + 2 };
        });
    }
};
exports.RelatoriosService = RelatoriosService;
exports.RelatoriosService = RelatoriosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [estoque_db_service_1.EstoqueDbService,
        controle_db_service_1.ControleDbService,
        alertas_db_service_1.AlertasDbService,
        usuarios_db_service_1.UsuariosDbService])
], RelatoriosService);
//# sourceMappingURL=reports.service.js.map