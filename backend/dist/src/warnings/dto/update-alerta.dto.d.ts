import { Importancia } from '@prisma/alertas-client';
export declare class UpdateAlertaDto {
    titulo?: string;
    descricao?: string;
    importancia?: Importancia;
    destinatarios?: number[];
    concluido?: boolean;
}
