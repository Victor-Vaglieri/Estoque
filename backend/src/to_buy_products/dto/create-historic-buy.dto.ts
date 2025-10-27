import { IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';


export class CreateHistoricBuyDto {
    @IsNumber({}, { message: 'O ID do produto deve ser um número.' })
    @IsNotEmpty({ message: 'O ID do produto é obrigatório.' })
    productId: number;

    @IsNumber({}, { message: 'A quantidade deve ser um número.' })
    @IsPositive({ message: 'A quantidade deve ser um número positivo.' })
    @IsNotEmpty({ message: 'A quantidade é obrigatória.' })
    quantidade: number;

    @IsNumber({}, { message: 'O preço deve ser um número.' })
    @Min(0, { message: 'O preço não pode ser negativo.' })
    @IsNotEmpty({ message: 'O preço é obrigatório.' })
    preco: number;
}
