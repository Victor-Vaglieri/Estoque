export declare class RegisterPurchaseDto {
    productId: number;
    quantidade: number;
    precoTotal: number;
}
export interface ProductToBuy {
    id: number;
    nome: string;
    unidade: string;
    marca: string | null;
    codigo: string | null;
    quantidadeMin: number;
    quantidadeMax: number;
    quantidadeEst: number;
    quantidadePendenteFaltante: number;
    fornecedor: {
        id: number;
        nome: string;
    };
}
