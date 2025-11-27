import { AlertasDbService } from '../prisma/alertas-db.service';
import { ControleDbService } from '../prisma/controle-db.service';
import { EstoqueDbService } from '../prisma/estoque-db.service';
import { UsuariosDbService } from '../prisma/usuarios-db.service';
interface StockValueByLoja {
    name: string;
    value: number;
}
interface PurchaseHistory {
    month: string;
    totalSpent: number;
}
export declare class RelatoriosService {
    private estoqueDb;
    private controleDb;
    private alertasDb;
    private usuariosDb;
    constructor(estoqueDb: EstoqueDbService, controleDb: ControleDbService, alertasDb: AlertasDbService, usuariosDb: UsuariosDbService);
    getOverview(lojaId: number): Promise<{
        totalValue: number;
        totalItems: number;
        lowStockCount: number;
    }>;
    getStockValueByLoja(): Promise<StockValueByLoja[]>;
    getPurchaseHistory(): Promise<PurchaseHistory[]>;
    exportControle(startDate: Date, endDate: Date): Promise<Buffer>;
    exportFornecedores(): Promise<Buffer>;
    private autoFitColumns;
}
export {};
