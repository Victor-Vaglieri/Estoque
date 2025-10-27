import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';
// Importe o Enum do seu schema Prisma
import { EstadoEntrada } from '@prisma/estoque-client'; 

export class UpdateRecebimentoDto {
    // Valida se o status enviado é um dos valores válidos do Enum
    @IsEnum(EstadoEntrada, { message: 'Status inválido.' })
    @IsNotEmpty({ message: 'O status é obrigatório.' })
    status: EstadoEntrada;

    // Valida se o preço confirmado é um número não negativo
    @IsNumber({}, { message: 'O preço confirmado deve ser um número.' })
    @Min(0, { message: 'O preço confirmado não pode ser negativo.' })
    @IsNotEmpty({ message: 'O preço confirmado é obrigatório.' })
    precoConfirmado: number;
}
