import { AlertasDbService } from '../prisma/alertas-db.service';
import { Prisma, Importancia, Alertas } from '@prisma/alertas-client';
import { CreateAlertaDto } from './dto/create-alerta.dto';
import { UpdateAlertaDto } from './dto/update-alerta.dto';
import { Funcao } from '@prisma/usuarios-client';
type AuthUser = {
    id: number;
    lojaId: number;
    nome: string;
    funcoes: Funcao[];
};
interface CreateAlertaSistemaDto {
    titulo: string;
    descricao: string;
    importancia: Importancia;
    lojaId: number;
    criadorId: number;
    criadorNome: string;
}
export declare class WarningsService {
    private prisma;
    constructor(prisma: AlertasDbService);
    findAll(authUser: AuthUser): Promise<Alertas[]>;
    findOne(authUser: AuthUser, id: number): Promise<Alertas>;
    create(authUser: AuthUser, createAlertaDto: CreateAlertaDto): Promise<Alertas>;
    update(authUser: AuthUser, id: number, updateAlertaDto: UpdateAlertaDto): Promise<Alertas>;
    remove(authUser: AuthUser, id: number): Promise<Alertas>;
    createAlertaSistema(dto: CreateAlertaSistemaDto): Promise<Alertas>;
    associarAlertaAUsuarios(alertaId: number, userIds: number[]): Promise<Prisma.BatchPayload>;
}
export {};
