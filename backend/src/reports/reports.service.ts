import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/estoque-client';
import { EstoqueDbService } from '../prisma/estoque-db.service'; 
import * as XLSX from 'xlsx'; 

// --- CORREÇÃO: Adicionar 'export' ---
export interface StockValue {
    name: string;
    value: number;
}

// --- CORREÇÃO: Adicionar 'export' ---
export interface PurchaseHistory {
    month: string; // Ex: "2025-10"
    totalSpent: number;
}


@Injectable()
export class ReportsService {
    constructor(private estoqueDb: EstoqueDbService) {}

    async getOverview(userId: number) {
        const products = await this.estoqueDb.produto.findMany({
            where: {ativo: true},
            include: {
                historicoPreco: {
                     orderBy: { data: 'desc' },
                     take: 1
                }
            }
        });

        let totalValue = 0;
        let lowStockCount = 0;
        const totalItems = products.length;

        products.forEach(p => {
            const lastPrice = p.historicoPreco[0]?.preco ?? 0; // Usa último preço ou 0
            totalValue += p.quantidadeEst * lastPrice; // Calcula valor estimado
            if (p.quantidadeEst < p.quantidadeMin) {
                lowStockCount++;
            }
        });


        return {
            totalValue,
            totalItems,
            lowStockCount,
        };
    }

    /**
     * Prepara os dados para o gráfico de Valor do Estoque por Produto.
     */
    async getStockValueData(userId: number): Promise<StockValue[]> {
         const products = await this.estoqueDb.produto.findMany({
             include: {
                historicoPreco: {
                     orderBy: { data: 'desc' },
                     take: 1
                }
            }
        });

        const stockValues = products.map(p => {
             const lastPrice = p.historicoPreco[0]?.preco ?? 0;
             return {
                name: p.nome,
                value: p.quantidadeEst * lastPrice,
             };
        });
        
        // Ordena por valor decrescente
        stockValues.sort((a, b) => b.value - a.value);

        return stockValues; // O frontend pegará o top 10
    }


    async getPurchaseHistoryData(userId: number): Promise<PurchaseHistory[]> {
        const allPurchases = await this.estoqueDb.historicoCompra.findMany({
            orderBy: { data: 'asc' },
            select: { data: true, precoTotal: true }
        });

        const monthlyTotals: Record<string, number> = {}; 
        allPurchases.forEach(purchase => {
            const monthKey = purchase.data.toISOString().substring(0, 7); 
            if (!monthlyTotals[monthKey]) {
                monthlyTotals[monthKey] = 0;
            }
            monthlyTotals[monthKey] += purchase.precoTotal;
        });
        const purchaseHistory: PurchaseHistory[] = Object.entries(monthlyTotals).map(([month, total]) => ({
            month: month,
            totalSpent: total,
        }));
        
        return purchaseHistory;
    }


    async generateInventoryXlsx(userId: number): Promise<Buffer> {
         const products = await this.estoqueDb.produto.findMany({
            select: {
                id: true,
                nome: true,
                marca: true,
                unidade: true,
                quantidadeEst: true,
                quantidadeMin: true,
                quantidadeNec: true,
                observacoes: true,
            },
             orderBy: { nome: 'asc'} // Ordena por nome
        });

        const dataForSheet = products.map(p => ({
            'ID': p.id,
            'Nome': p.nome,
            'Marca': p.marca ?? '',
            'Unidade': p.unidade,
            'Estoque Atual': p.quantidadeEst,
            'Estoque Mínimo': p.quantidadeMin,
            'Estoque Necessário': p.quantidadeNec,
            'Observações': p.observacoes ?? '',
        }));

        try {
            const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventário');

            const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
            return buffer;
        } catch (error) {
            console.error("Erro ao gerar XLSX do inventário:", error);
            throw new InternalServerErrorException("Não foi possível gerar o relatório de inventário.");
        }
    }

    async generateComprasXlsx(userId: number): Promise<Buffer> {
        const compras = await this.estoqueDb.historicoCompra.findMany({
            where: { responsavelId: userId },
            include: {
                produto: { select: { nome: true, unidade: true } },
            },
            orderBy: { data: 'desc' }
        });

         const dataForSheet = compras.map(c => ({
            'ID Compra': c.id,
            'Data': c.data.toLocaleDateString('pt-BR'),
            'Produto': c.produto.nome,
            'Quantidade': c.quantidade,
            'Unidade': c.produto.unidade,
            'Preço Total (R$)': c.precoTotal,
            'Preço Unitário (R$)': c.quantidade > 0 ? (c.precoTotal / c.quantidade).toFixed(2) : 'N/A',
            'Fornecedor': c.fornecedor ?? '',
            'Status Entrada': c.confirmadoEntrada,
            'ID Resp. Confirmação': c.responsavelConfirmacaoId ?? '', 
        }));

         try {
            const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Histórico de Compras');
            
            worksheet['!cols'] = [
                { wch: 10 }, // ID Compra
                { wch: 12 }, // Data
                { wch: 30 }, // Produto
                { wch: 12 }, // Quantidade
                { wch: 10 }, // Unidade
                { wch: 18 }, // Preço Total
                { wch: 18 }, // Preço Unitário
                { wch: 20 }, // Fornecedor
                { wch: 15 }, // Status Entrada
                { wch: 20 }, // ID Resp. Confirmação
            ];


            const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
            return buffer;
        } catch (error) {
            console.error("Erro ao gerar XLSX de compras:", error);
            throw new InternalServerErrorException("Não foi possível gerar o relatório de compras.");
        }
    }
}

