import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    Min
} from 'class-validator';

// Este DTO é quase idêntico ao UpdateProductDto.
// Define os campos que o frontend DEVE enviar para criar um novo produto.
export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    nome: string;

    @IsString()
    @IsNotEmpty()
    unidade: string;

    @IsOptional()
    @IsString()
    marca: string;

    @IsNumber()
    @Min(0)
    quantidadeMin: number;
    
    @IsNumber()
    @Min(0)
    quantidadeNec: number;
    
    @IsOptional()
    @IsString()
    observacoes: string;
}