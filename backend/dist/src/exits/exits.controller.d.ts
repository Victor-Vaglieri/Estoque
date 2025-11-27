import { ExitsService } from './exits.service';
import { CreateSaidaDto } from './dto/create-saida.dto';
import { UpdateSaidaDto } from './dto/update-saida.dto';
export declare class ExitsController {
    private readonly saidasService;
    constructor(saidasService: ExitsService);
    create(createSaidaDto: CreateSaidaDto, req: any): Promise<{
        produto: {
            nome: string;
            id: number;
            codigo: string | null;
            corredor: string | null;
            producao: boolean;
            marca: string | null;
            categoria: string | null;
            unidade: string;
            quantidadeMin: number;
            quantidadeMax: number;
            observacoes: string | null;
            ativo: boolean;
            createdAt: Date;
            updatedAt: Date;
            fornecedorId: number;
        };
    } & {
        data: Date;
        id: number;
        produtoId: number;
        lojaId: number;
        quantidade: number;
        responsavelId: number;
        motivo: string | null;
    }>;
    findAll(req: any): Promise<{
        produto: {
            quantidadeEst: number;
            estoqueLojas: undefined;
            nome: string;
            id: number;
            codigo: string | null;
            corredor: string | null;
            producao: boolean;
            marca: string | null;
            categoria: string | null;
            unidade: string;
            quantidadeMin: number;
            quantidadeMax: number;
            observacoes: string | null;
            ativo: boolean;
            createdAt: Date;
            updatedAt: Date;
            fornecedorId: number;
        };
        data: Date;
        id: number;
        produtoId: number;
        lojaId: number;
        quantidade: number;
        responsavelId: number;
        motivo: string | null;
    }[]>;
    update(id: number, updateSaidaDto: UpdateSaidaDto, req: any): Promise<{
        produto: {
            nome: string;
            id: number;
            codigo: string | null;
            corredor: string | null;
            producao: boolean;
            marca: string | null;
            categoria: string | null;
            unidade: string;
            quantidadeMin: number;
            quantidadeMax: number;
            observacoes: string | null;
            ativo: boolean;
            createdAt: Date;
            updatedAt: Date;
            fornecedorId: number;
        };
    } & {
        data: Date;
        id: number;
        produtoId: number;
        lojaId: number;
        quantidade: number;
        responsavelId: number;
        motivo: string | null;
    }>;
}
