import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';
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
    @IsInt()
    @Min(1)
    destinadoPara?: number;

    // Campo específico para marcar como concluído/pendente
    @IsOptional()
    @IsBoolean()
    concluido?: boolean; 
}
