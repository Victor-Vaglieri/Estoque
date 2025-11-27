import { Funcao } from '@prisma/usuarios-client';
export declare class AprovarSolicitacaoDto {
    funcoes: Funcao[];
    lojaId: number;
}
export declare class UpdateUserDto {
    nome: string;
    login: string;
    senha?: string;
    lojaId: number;
    funcoes: Funcao[];
}
