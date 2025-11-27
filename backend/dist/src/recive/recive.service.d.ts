import { EstoqueDbService } from '../prisma/estoque-db.service';
import { UpdateRecebimentoDto } from './dto/update-recebimento.dto';
type AuthUser = {
    id: number;
    lojaId: number;
};
export declare class RecebimentosService {
    private estoqueDb;
    constructor(estoqueDb: EstoqueDbService);
    findPending(authUser: AuthUser): Promise<{
        id: number;
        quantidade: number;
        precoTotal: number;
        data: Date;
        confirmadoEntrada: import("@prisma/estoque-client").$Enums.EstadoEntrada;
        produto: {
            nome: string;
            id: number;
            marca: string | null;
            unidade: string;
        };
    }[]>;
    updateStatus(authUser: AuthUser, distribuicaoId: number, updateDto: UpdateRecebimentoDto): Promise<{
        id: number;
        lojaId: number;
        quantidade: number;
        historicoCompraId: number;
        confirmadoEntrada: import("@prisma/estoque-client").$Enums.EstadoEntrada;
        responsavelConfirmacaoId: number | null;
    }>;
}
export {};
