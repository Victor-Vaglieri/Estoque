import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  Min,
} from 'class-validator';

/**
 * Este DTO reflete o formulário "Criar Novo Produto" do frontend.
 * Ele inclui todos os novos campos do schema 'Produto' E
 * o 'quantidadeEst' (estoque inicial) que será usado para criar o 'EstoqueLoja'.
 */
export class CreateProdutoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  unidade: string;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsString()
  @IsOptional()
  codigo?: string;

  @IsString()
  @IsOptional()
  corredor?: string;

  @IsBoolean()
  @IsOptional()
  producao?: boolean;

  @IsInt()
  @IsNotEmpty()
  fornecedorId: number;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  quantidadeMin: number;

  // MUDANÇA: Renomeado de 'quantidadeNec'
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  quantidadeMax: number; 

  // MUDANÇA: Este é o estoque inicial para a loja do usuário
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  quantidadeEst: number;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}