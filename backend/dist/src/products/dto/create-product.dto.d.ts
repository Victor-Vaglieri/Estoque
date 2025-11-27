export declare class CreateProdutoDto {
    lojaId?: number;
    nome: string;
    unidade: string;
    marca?: string;
    codigo?: string;
    corredor?: string;
    producao?: boolean;
    fornecedorId: number;
    quantidadeMin: number;
    quantidadeMax: number;
    quantidadeEst: number;
    observacoes?: string;
    ativo?: boolean;
}
