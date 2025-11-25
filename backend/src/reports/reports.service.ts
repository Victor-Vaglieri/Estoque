import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
    EstadoEntrada,
    Prisma,
} from '@prisma/estoque-client';

import { AlertasDbService } from '../prisma/alertas-db.service';
import { ControleDbService } from '../prisma/controle-db.service';
import { EstoqueDbService } from '../prisma/estoque-db.service';
import { UsuariosDbService } from '../prisma/usuarios-db.service';
import * as XLSX from 'xlsx';


interface StockValueByLoja {
    name: string;
    value: number;
}
interface PurchaseHistory {
    month: string;
    totalSpent: number;
}

@Injectable()
export class RelatoriosService {

    constructor(
        private estoqueDb: EstoqueDbService,
        private controleDb: ControleDbService,
        private alertasDb: AlertasDbService,
        private usuariosDb: UsuariosDbService,
    ) { }


    async getOverview(lojaId: number) {

        const rawResult: { count: number }[] = await this.estoqueDb.$queryRaw(
            Prisma.sql`
        SELECT COUNT(*) as count
        FROM "EstoqueLoja" AS E
        JOIN "Produto" AS P ON E."produtoId" = P."id"
        WHERE E."lojaId" = ${lojaId}
          AND P."ativo" = 1
          AND E."quantidadeEst" < P."quantidadeMin"
      `,
        );
        const lowStockCount = Number(rawResult[0]?.count || 0);


        const totalItems = await this.estoqueDb.produto.count({
            where: { ativo: true },
        });


        // MUDANÇA: 'valorEstoque' não existe. Calculamos manualmente.
        const allEstoque = await this.estoqueDb.estoqueLoja.findMany({
            include: {
                produto: {
                    include: {
                        historicoPreco: {
                            orderBy: { data: 'desc' },
                            take: 1, // Pega o último preço
                        },
                    },
                },
            },
        });

        let totalValue = 0;
        allEstoque.forEach((est) => {
            // (Estoque da Loja) * (Último Preço do Produto)
            const lastPrice = est.produto.historicoPreco[0]?.preco ?? 0;
            totalValue += est.quantidadeEst * lastPrice;
        });

        return {
            totalValue,
            totalItems,
            lowStockCount,
        };
    }


    async getStockValueByLoja(): Promise<StockValueByLoja[]> {
        const lojas = await this.estoqueDb.loja.findMany();

        const allEstoque = await this.estoqueDb.estoqueLoja.findMany({
            include: {
                produto: {
                    include: {
                        // 1. Tenta buscar o preço definido (Tabela de Preço)
                        historicoPreco: {
                            orderBy: { data: 'desc' },
                            take: 1,
                        },
                        // 2. Traz também a última entrada como plano B (Preço de Custo)
                        entradas: {
                            orderBy: { data: 'desc' },
                            take: 1,
                        },
                    },
                },
            },
        });

        const valueMap = new Map<number, number>();

        allEstoque.forEach((est) => {
            // Lógica de Preço Inteligente:
            let lastPrice = est.produto.historicoPreco[0]?.preco;

            // Se não tiver preço no histórico, usa o preço pago na última entrada
            if (!lastPrice) {
                lastPrice = est.produto.entradas[0]?.precoPago ?? 0;
            }

            const itemValue = est.quantidadeEst * lastPrice;
            const currentTotal = valueMap.get(est.lojaId) ?? 0;

            valueMap.set(est.lojaId, currentTotal + itemValue);
        });

        // 3. Mapeia os resultados
        return lojas.map((loja) => {
            return {
                name: loja.nome,
                value: valueMap.get(loja.id) || 0,
            };
        });
    }


    async getPurchaseHistory(): Promise<PurchaseHistory[]> {
        const allPurchases = await this.estoqueDb.historicoCompra.findMany({
            orderBy: { data: 'asc' },
            select: { data: true, precoTotal: true },
        });

        const monthlyTotals: Record<string, number> = {};
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




    async exportControle(startDate: Date, endDate: Date): Promise<Buffer> {
        // Ajusta para o final do dia
        endDate.setHours(23, 59, 59, 999);

        console.log('--- FILTRANDO VIA CÓDIGO (MEMÓRIA) ---');
        
        // 1. Busca TUDO do banco (sem filtro de data na query)
        // Isso evita o problema de incompatibilidade de formato de data do SQLite
        const allCostura = await this.controleDb.costuraRegistro.findMany({ include: { itens: true } });
        const allTingimento = await this.controleDb.tingimentoRegistro.findMany({ include: { itens: true } });
        const allTapete = await this.controleDb.tapeteRegistro.findMany({ include: { itens: true } });
        const allMala = await this.controleDb.malaRegistro.findMany({ include: { itens: true } });

        // 2. Função auxiliar para filtrar
        const isWithinRange = (data?: Date | null) => {
            if (!data) return false;
            const d = new Date(data);
            return d >= startDate && d <= endDate;
        };

        // 3. Aplica o filtro manualmente
        const costura = allCostura.filter(r => isWithinRange(r.data_recebimento));
        const tingimento = allTingimento.filter(r => isWithinRange(r.data_recebimento));
        const tapete = allTapete.filter(r => isWithinRange(r.data_recebimento));
        const mala = allMala.filter(r => isWithinRange(r.data_recebimento));

        console.log(`Registros filtrados: Costura=${costura.length}, Mala=${mala.length}`);

        // ... (O resto do código de mapeamento continua IGUAL) ...
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
            
            if (costuraSheet.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(costuraSheet), 'Costura');
            if (tingimentoSheet.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tingimentoSheet), 'Tingimento');
            if (tapeteSheet.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tapeteSheet), 'Tapete');
            if (malaSheet.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(malaSheet), 'Mala');

            if (wb.SheetNames.length === 0) {
                const wsEmpty = XLSX.utils.aoa_to_sheet([['Aviso'], ['Nenhum registro encontrado neste período (verifique as datas).']]);
                XLSX.utils.book_append_sheet(wb, wsEmpty, 'Sem Dados');
            }

            return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
        } catch (error) {
            console.error('Erro ao gerar XLSX:', error);
            throw new InternalServerErrorException('Falha ao gerar o arquivo XLSX do Controle.');
        }
    }


    async exportFornecedores(): Promise<Buffer> {
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
                    const estoqueTotal = p.estoqueLojas.reduce(
                        (sum, est) => sum + est.quantidadeEst,
                        0,
                    );

                    const estoquePorLoja = {};
                    for (const loja of lojas) {
                        const estoqueLoja = p.estoqueLojas.find(
                            (el) => el.lojaId === loja.id,
                        );
                        estoquePorLoja[`Estoque (${loja.nome})`] =
                            estoqueLoja?.quantidadeEst ?? 0;
                    }

                    return {
                        Produto: p.nome,
                        Codigo: p.codigo,
                        Unidade: p.unidade,
                        EstoqueMinimo: p.quantidadeMin,
                        EstoqueMaximo: p.quantidadeMax,
                        EstoqueTotal: estoqueTotal,
                        Tipo: p.producao ? 'Produção' : '', // TODO ver aqui
                        ...estoquePorLoja,
                    };
                });
                if (sheetData.length > 0) {
                    const sheetName = fornecedor.nome.substring(0, 30).replace(/[\\/?*[\]]/g, '');

                    XLSX.utils.book_append_sheet(
                        wb,
                        XLSX.utils.json_to_sheet(sheetData),
                        sheetName,
                    );
                }
            }

            return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException(
                'Falha ao gerar o arquivo XLSX de Fornecedores.',
            );
        }
    }
}