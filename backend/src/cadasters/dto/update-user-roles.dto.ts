import { IsArray, IsEnum } from 'class-validator';
// Importe o Enum do seu schema Prisma de usuários
import { Funcao } from '@prisma/usuarios-client';

export class UpdateUserRolesDto {
    @IsArray()
    @IsEnum(Funcao, { 
        each: true, 
        message: 'Cada função deve ser um valor válido do enum (Ex: GESTOR, FUNCIONARIO)' 
    })
    funcoes: Funcao[];
}
