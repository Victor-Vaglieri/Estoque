import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(req: any): Promise<{
        quantidade_itens_abaixo_min: number;
        quantidade_saida: number;
        historico_compra_pendente: number;
        nome_ultimo_produto_chego: string;
    }>;
}
