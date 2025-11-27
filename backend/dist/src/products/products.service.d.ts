import { EstoqueDbService } from '../prisma/estoque-db.service';
import { UpdateProdutoDto } from './dto/update-product.dto';
import { CreateProdutoDto } from './dto/create-product.dto';
export declare class ProductsService {
    private estoqueDb;
    constructor(estoqueDb: EstoqueDbService);
    findAllFornecedores(): Promise<{
        nome: string;
        id: number;
    }[]>;
    findAll(lojaId: number): Promise<{
        estoqueLojas: undefined;
        quantidadeEst: number;
        quantidadeNec: number;
        realLojaId: number | null;
        fornecedor: {
            nome: string;
            id: number;
        };
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
    }[]>;
    findWithStock(lojaId: number): Promise<{
        quantidadeEst: number;
        quantidadeNec: number;
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
    }[]>;
    create(dto: CreateProdutoDto & {
        lojaId?: number;
    }, lojaIdDoUsuario: number): Promise<{
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
    }>;
    update(id: number, dto: UpdateProdutoDto & {
        lojaId?: number;
    }, lojaIdDoUsuario: number): Promise<{
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
    }>;
}
