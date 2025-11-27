import { EstoqueDbService } from '../prisma/estoque-db.service';
export declare class DashboardService {
    private estoqueDb;
    constructor(estoqueDb: EstoqueDbService);
    getStats(lojaId: number): Promise<{
        quantidade_itens_abaixo_min: number;
        quantidade_saida: number;
        historico_compra_pendente: number;
        nome_ultimo_produto_chego: string;
    }>;
}
