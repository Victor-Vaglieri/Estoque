import { Type } from 'class-transformer';
import { 
    IsArray, 
    IsNotEmpty, 
    IsNumber, 
    Min, 
    ValidateNested // Para validar objetos dentro do array
} from 'class-validator';

/**
 * Define a estrutura de um único item de atualização de inventário.
 */
class InventarioUpdateItemDto {
    @IsNumber({}, { message: 'productId deve ser um número.' })
    @IsNotEmpty({ message: 'productId é obrigatório.' })
    productId: number;

    @IsNumber({}, { message: 'newQuantity deve ser um número.' })
    @Min(0, { message: 'newQuantity não pode ser negativo.' })
    @IsNotEmpty({ message: 'newQuantity é obrigatório.' })
    newQuantity: number;
}

/**
 * Define a estrutura do corpo da requisição para PATCH /inventario/update.
 * Espera um objeto com uma propriedade 'updates' que é um array de itens.
 */
export class UpdateInventarioDto {
    @IsArray({ message: 'O campo "updates" deve ser um array.' })
    // Valida cada objeto dentro do array usando as regras do InventarioUpdateItemDto
    @ValidateNested({ each: true }) 
    // Garante que o NestJS transforme os objetos do array em instâncias da classe
    @Type(() => InventarioUpdateItemDto) 
    updates: InventarioUpdateItemDto[];
}
