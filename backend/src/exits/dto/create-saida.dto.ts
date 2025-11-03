import {
  IsInt,
  IsString,
  IsDateString,
  IsOptional,
  IsNotEmpty,
  IsPositive,
  Min,
} from 'class-validator';

/**
 * Valida os dados para CRIAR uma nova Saída.
 * Note que 'responsavelId' não está aqui, pois virá do token.
 */
export class CreateSaidaDto {
  @IsInt()
  @IsNotEmpty()
  produtoId: number;

  @IsInt()
  @IsPositive()
  @Min(1)
  @IsNotEmpty()
  quantidade: number;

  @IsDateString()
  @IsOptional()
  data?: string;

  @IsString()
  @IsOptional()
  motivo?: string;
}
