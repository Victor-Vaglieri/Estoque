import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
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
    @IsInt()
    @Min(1) // Garante que é um ID de usuário válido
    destinadoPara?: number; // ID do usuário a quem se destina (opcional)
}
