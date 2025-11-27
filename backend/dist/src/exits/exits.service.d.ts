import { EstoqueDbService } from '../prisma/estoque-db.service';
import { CreateSaidaDto } from './dto/create-saida.dto';
import { UpdateSaidaDto } from './dto/update-saida.dto';
type AuthUser = {
    id: number;
    lojaId: number;
};
export declare class ExitsService {
    private estoqueDb;
    constructor(estoqueDb: EstoqueDbService);
    create(createSaidaDto: CreateSaidaDto, authUser: AuthUser): Promise<{
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
    findAll(authUser: AuthUser): Promise<{
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
    update(id: number, updateSaidaDto: UpdateSaidaDto, authUser: AuthUser): Promise<{
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
export {};
