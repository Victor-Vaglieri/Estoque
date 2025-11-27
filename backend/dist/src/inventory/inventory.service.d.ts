import { EstoqueDbService } from '../prisma/estoque-db.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
interface UpdateEstoqueItem {
    produtoId: number;
    newQuantity: number;
}
export declare class InventarioService {
    private estoqueDb;
    private eventEmitter;
    constructor(estoqueDb: EstoqueDbService, eventEmitter: EventEmitter2);
    findAllForInventory(lojaIdUsuario: number): Promise<{
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
    findAllByLoja(lojaId: number): Promise<{
        id: number;
        quantidadeEst: number;
        nome: string;
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
    ajustarEstoque(updates: UpdateEstoqueItem[], lojaId: number, userId: number): Promise<{
        message: string;
    }>;
}
export {};
