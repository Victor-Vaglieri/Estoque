import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AlertasDbService } from '../prisma/alertas-db.service'; 
import { Prisma, Importancia, Alertas } from '@prisma/alertas-client'; 
import { CreateAlertaDto } from './dto/create-alerta.dto';
import { UpdateAlertaDto } from './dto/update-alerta.dto';

// TODO rever tudo porque todo usuario pode criar alertas, então sempre filtrar por loja 
@Injectable()
export class WarningsService {
    constructor(private prisma: AlertasDbService) {}
    async findAll(userId: number): Promise<Alertas[]> {
        return this.prisma.alertas.findMany({
            where: {
                concluido: false, 
            },
            orderBy: [
                {importancia: 'desc'},
                {createdAt: 'desc'},
            ]
        });
    }

    async findOne(userId: number, id: number): Promise<Alertas> {
        const alerta = await this.prisma.alertas.findUnique({
            where: { id: id },
        });

        if (!alerta) {
            throw new NotFoundException(`Alerta com ID ${id} não encontrado.`);
        }

        return alerta;
    }


    async create(userId: number, createAlertaDto: CreateAlertaDto): Promise<Alertas> {
        return this.prisma.alertas.create({
            data: {
                ...createAlertaDto,
                concluido: false,
            },
        });
    }

    async update(userId: number, id: number, updateAlertaDto: UpdateAlertaDto): Promise<Alertas> {
        const alerta = await this.findOne(userId, id); 

        let finishedAt: Date | null = alerta.finishedAt;
        if (updateAlertaDto.concluido === true && !alerta.concluido) {
            finishedAt = new Date();
        } else if (updateAlertaDto.concluido === false && alerta.concluido) {
             finishedAt = null;
        }

        try {
            return await this.prisma.alertas.update({
                where: { id: id },
                data: {
                    ...updateAlertaDto,
                     finishedAt: finishedAt,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException(`Alerta com ID ${id} não encontrado.`);
            }
            throw error;
        }
    }

    async remove(userId: number, id: number): Promise<Alertas> {
        try {
            return await this.prisma.alertas.delete({
                where: { id: id },
            });
        } catch (error) {
             if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException(`Alerta com ID ${id} não encontrado.`);
            }
            throw error;
        }
    }
}
