import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class RegisterPurchaseDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  quantidade: number;

  // MUDANÇA: O frontend envia 'precoTotal'
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
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