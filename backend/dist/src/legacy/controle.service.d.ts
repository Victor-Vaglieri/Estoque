import { ControleDbService } from '../prisma/controle-db.service';
import { LegacyPayloadDto } from './dto/legacy-payload.dto';
type TipoServico = 'costura' | 'tingimento' | 'tapete' | 'mala';
type AuthUser = {
    id: number;
    lojaId: number;
};
export declare class ControleService {
    private controleDB;
    constructor(controleDB: ControleDbService);
    findAll(tipo: TipoServico, authUser: AuthUser): Promise<{
        id: number;
        rol: number;
        nome_cliente: string;
        data_recebimento: Date | null;
        data_da_entrega: Date | null;
    }[]>;
    findByRol(tipo: TipoServico, rol: number, authUser: AuthUser): Promise<{
        fixos: any;
        multiplos: any;
    } | null>;
    create(tipo: TipoServico, payload: LegacyPayloadDto, authUser: AuthUser): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        lojaId: number;
        rol: number;
        nome_cliente: string;
        meio_de_contato_inicial: import("@prisma/controle-client").$Enums.MeioDeContato | null;
        data_recebimento: Date | null;
        data_da_entrega: Date | null;
    }>;
    update(tipo: TipoServico, payload: LegacyPayloadDto, authUser: AuthUser): Promise<any>;
    private mapMeioDeContato;
    private prepareFixedData;
    private prepareMultipleData;
}
export {};
