import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, Min, IsBoolean, IsArray } from 'class-validator';
// Importe o Enum do seu schema Prisma (ajuste o nome se necessário)
import { Importancia } from '@prisma/alertas-client'; 

export class UpdateAlertaDto {
    // Todos os campos são opcionais para permitir atualizações parciais (PATCH)
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    titulo?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    descricao?: string;

    @IsOptional()
    @IsEnum(Importancia)
    importancia?: Importancia;

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @Min(1, { each: true }) // Garante que é um ID de usuário válido
    destinatarios?: number[]; // ID do usuário a quem se destina (opcional)

    // Campo específico para marcar como concluído/pendente
    @IsOptional()
    @IsBoolean()
    concluido?: boolean; 
}
