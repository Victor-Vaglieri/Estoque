import { ComprasService } from './to-buy-products.service';
import { RegisterPurchaseDto, ProductToBuy } from './dto/compras.dto';
export declare class ComprasController {
    private readonly comprasService;
    constructor(comprasService: ComprasService);
    getShoppingList(req: any): Promise<Record<string, ProductToBuy[]>>;
    registerPurchase(dto: RegisterPurchaseDto, req: any): Promise<{
        data: Date;
        id: number;
        fornecedorId: number | null;
        produtoId: number;
        quantidade: number;
        responsavelId: number;
        precoTotal: number;
    }>;
}
