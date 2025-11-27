import { WarningsService } from './warnings.service';
import { UsersService } from '../users/users.service';
import { Importancia } from '@prisma/alertas-client';
interface InventarioAlertaPayload {
    userId: number;
    lojaId: number;
    titulo: string;
    descricao: string;
    importancia: Importancia;
}
export declare class AlertasListener {
    private alertasService;
    private usuariosService;
    constructor(alertasService: WarningsService, usuariosService: UsersService);
    handleInventarioAlerta(payload: InventarioAlertaPayload): Promise<void>;
}
export {};
