import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, Min, IsArray } from 'class-validator';
// Importe o Enum do seu schema Prisma (ajuste o nome se necessário)
import { Importancia } from '@prisma/alertas-client'; 

export class CreateAlertaDto {
    @IsString()
    @IsNotEmpty()
    titulo: string;

    @IsString()
    @IsNotEmpty()
    descricao: string;

    @IsEnum(Importancia)
    @IsNotEmpty()
    importancia: Importancia;

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @Min(1, { each: true }) // Garante que é um ID de usuário válido
    destinatarios?: number[]; // ID do usuário a quem se destina (opcional)
}
