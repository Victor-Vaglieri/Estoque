import { Importancia } from '@prisma/alertas-client';
export declare class CreateAlertaDto {
    titulo: string;
    descricao: string;
    importancia: Importancia;
    destinatarios?: number[];
}
