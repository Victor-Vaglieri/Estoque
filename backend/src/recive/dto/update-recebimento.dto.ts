import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';

import { EstadoEntrada } from '@prisma/estoque-client'; 

export class UpdateRecebimentoDto {
    
    @IsEnum(EstadoEntrada, { message: 'Status inválido.' })
    @IsNotEmpty({ message: 'O status é obrigatório.' })
    status: EstadoEntrada;

    
    @IsNumber({}, { message: 'O preço confirmado deve ser um número.' })
    @Min(0, { message: 'O preço confirmado não pode ser negativo.' })
    @IsNotEmpty({ message: 'O preço confirmado é obrigatório.' })
    precoConfirmado: number;
}
