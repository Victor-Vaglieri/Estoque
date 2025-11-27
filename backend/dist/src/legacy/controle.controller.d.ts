import { ControleService } from './controle.service';
import { LegacyPayloadDto } from './dto/legacy-payload.dto';
export declare class ControleController {
    private readonly legacyService;
    constructor(legacyService: ControleService);
    private validateTipo;
    create(tipoParam: string, legacyPayloadDto: LegacyPayloadDto, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        lojaId: number;
        rol: number;
        nome_cliente: string;
        meio_de_contato_inicial: import("@prisma/controle-client/client").$Enums.MeioDeContato | null;
        data_recebimento: Date | null;
        data_da_entrega: Date | null;
    }>;
    update(tipoParam: string, legacyPayloadDto: LegacyPayloadDto, req: any): Promise<any>;
    find(tipoParam: string, req: any, rol?: string): Promise<{
        fixos: any;
        multiplos: any;
    } | {
        id: number;
        rol: number;
        nome_cliente: string;
        data_recebimento: Date | null;
        data_da_entrega: Date | null;
    }[]>;
}
