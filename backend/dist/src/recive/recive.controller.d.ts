import { RecebimentosService } from './recive.service';
import { UpdateRecebimentoDto } from './dto/update-recebimento.dto';
export declare class RecebimentosController {
    private readonly recebimentosService;
    constructor(recebimentosService: RecebimentosService);
    findPending(req: any): Promise<{
        id: number;
        quantidade: number;
        precoTotal: number;
        data: Date;
        confirmadoEntrada: import("@prisma/estoque-client/client").$Enums.EstadoEntrada;
        produto: {
            nome: string;
            id: number;
            marca: string | null;
            unidade: string;
        };
    }[]>;
    updateStatus(historicoCompraId: number, req: any, updateRecebimentoDto: UpdateRecebimentoDto): Promise<{
        id: number;
        lojaId: number;
        quantidade: number;
        historicoCompraId: number;
        confirmadoEntrada: import("@prisma/estoque-client/client").$Enums.EstadoEntrada;
        responsavelConfirmacaoId: number | null;
    }>;
}
