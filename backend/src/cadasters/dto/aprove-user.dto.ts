import { IsArray, IsEnum, ArrayMinSize } from 'class-validator';
// Importe o Enum do seu schema Prisma de usuários
import { Funcao } from '@prisma/usuarios-client';

export class AprovarSolicitacaoDto {
    @IsArray()
    @IsEnum(Funcao, { 
        each: true, // Valida cada item do array
        message: 'Cada função deve ser um valor válido do enum (Ex: GESTOR, FUNCIONARIO)' 
    })
    @ArrayMinSize(1, { message: 'Pelo menos uma função deve ser selecionada.' })
    funcoes: Funcao[];
}
