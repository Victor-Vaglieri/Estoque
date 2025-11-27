import { WarningsService } from './warnings.service';
import { CreateAlertaDto } from './dto/create-alerta.dto';
import { UpdateAlertaDto } from './dto/update-alerta.dto';
export declare class WarningsController {
    private readonly warningsService;
    constructor(warningsService: WarningsService);
    create(req: any, createAlertaDto: CreateAlertaDto): Promise<{
        id: number;
        createdAt: Date;
        lojaId: number;
        titulo: string;
        descricao: string;
        importancia: import("@prisma/alertas-client/client").$Enums.Importancia;
        concluido: boolean;
        finishedAt: Date | null;
        criadorId: number;
        criadorNome: string;
    }>;
    findAll(req: any): Promise<{
        id: number;
        createdAt: Date;
        lojaId: number;
        titulo: string;
        descricao: string;
        importancia: import("@prisma/alertas-client/client").$Enums.Importancia;
        concluido: boolean;
        finishedAt: Date | null;
        criadorId: number;
        criadorNome: string;
    }[]>;
    findOne(req: any, id: number): Promise<{
        id: number;
        createdAt: Date;
        lojaId: number;
        titulo: string;
        descricao: string;
        importancia: import("@prisma/alertas-client/client").$Enums.Importancia;
        concluido: boolean;
        finishedAt: Date | null;
        criadorId: number;
        criadorNome: string;
    }>;
    update(req: any, id: number, updateAlertaDto: UpdateAlertaDto): Promise<{
        id: number;
        createdAt: Date;
        lojaId: number;
        titulo: string;
        descricao: string;
        importancia: import("@prisma/alertas-client/client").$Enums.Importancia;
        concluido: boolean;
        finishedAt: Date | null;
        criadorId: number;
        criadorNome: string;
    }>;
    remove(req: any, id: number): Promise<{
        id: number;
        createdAt: Date;
        lojaId: number;
        titulo: string;
        descricao: string;
        importancia: import("@prisma/alertas-client/client").$Enums.Importancia;
        concluido: boolean;
        finishedAt: Date | null;
        criadorId: number;
        criadorNome: string;
    }>;
}
