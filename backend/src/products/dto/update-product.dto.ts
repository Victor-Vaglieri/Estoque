import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsOptional,
    Min
} from 'class-validator';

export class UpdateProductDto {
    // O nome é uma string e não pode estar vazio.
    @IsString({ message: 'O nome do produto deve ser um texto.' })
    @IsNotEmpty({ message: 'O nome do produto é obrigatório.' })
    nome: string;

    // A unidade é uma string e não pode estar vazia.
    @IsString()
    @IsNotEmpty()
    unidade: string;

    // A marca é opcional. Se for enviada, deve ser uma string.
    @IsOptional()
    @IsString()
    marca: string;

    // A quantidade mínima é um número, não pode ser negativa.
    @IsNumber()
    @Min(0)
    quantidadeMin: number;
    
    // A quantidade necessária é um número, não pode ser negativa.
    @IsNumber()
    @Min(0)
    quantidadeNec: number;
    
    // As observações são opcionais. Se forem enviadas, devem ser uma string.
    @IsOptional()
    @IsString()
    observacoes: string;
}
