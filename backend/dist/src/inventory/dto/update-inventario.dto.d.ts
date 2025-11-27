declare class UpdateEstoqueDto {
    produtoId: number;
    newQuantity: number;
}
export declare class AjusteInventarioDto {
    updates: UpdateEstoqueDto[];
}
export {};
