import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';

// Valida cada item no array de atualização
class UpdateEstoqueDto {
  @IsInt()
  @IsNotEmpty()
  produtoId: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  newQuantity: number;
}

// Valida o corpo da requisição PATCH
export class AjusteInventarioDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateEstoqueDto)
  updates: UpdateEstoqueDto[];
}