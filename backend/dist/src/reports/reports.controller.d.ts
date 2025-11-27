import { StreamableFile } from '@nestjs/common';
import { RelatoriosService } from './reports.service';
import type { Response } from 'express';
import { StockValueByLoja, PurchaseHistory } from './dto/relatorios.dto';
export declare class RelatoriosController {
    private readonly relatoriosService;
    constructor(relatoriosService: RelatoriosService);
    private checkGestor;
    getOverview(req: any): Promise<{
        totalValue: number;
        totalItems: number;
        lowStockCount: number;
    }>;
    getStockValueByLoja(req: any): Promise<StockValueByLoja[]>;
    getPurchaseHistory(req: any): Promise<PurchaseHistory[]>;
    exportControle(req: any, res: Response, startDate?: string, endDate?: string): Promise<StreamableFile>;
    exportFornecedores(req: any, res: Response): Promise<StreamableFile>;
    debugDatabase(): Promise<{
        mensagem: string;
        quantidade: number;
        amostra: {
            id: number;
            cliente: string;
            data_recebimento: Date | null;
            tipo_data: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
        }[];
    }>;
}
