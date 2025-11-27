import { InventarioService } from './inventory.service';
import { AjusteInventarioDto } from './dto/update-inventario.dto';
export declare class InventarioController {
    private readonly inventarioService;
    constructor(inventarioService: InventarioService);
    findAll(req: any): Promise<{
        id: number;
        nome: string;
        codigo: string | null;
        marca: string | null;
        unidade: string;
        quantidadeMin: number;
        quantidadeEst: number;
        estoquePorLoja: {
            lojaId: number;
            nomeLoja: string;
            quantidade: number;
        }[];
    }[]>;
    ajustarEstoque(ajusteInventarioDto: AjusteInventarioDto, req: any): Promise<{
        message: string;
    }>;
}
