import { EstoqueDbService } from '../prisma/estoque-db.service';
import { RegisterPurchaseDto, ProductToBuy } from './dto/compras.dto';
type AuthUser = {
    id: number;
    lojaId: number;
};
export declare class ComprasService {
    private estoqueDb;
    constructor(estoqueDb: EstoqueDbService);
    findAllToBuy(lojaId: number): Promise<Record<string, ProductToBuy[]>>;
    registerPurchase(dto: RegisterPurchaseDto, authUser: AuthUser): Promise<{
        data: Date;
        id: number;
        fornecedorId: number | null;
        produtoId: number;
        quantidade: number;
        responsavelId: number;
        precoTotal: number;
    }>;
    private groupProductsByFornecedor;
}
export {};
