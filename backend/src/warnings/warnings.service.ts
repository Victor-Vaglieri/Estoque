import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
// Ajuste o nome do serviço Prisma se for diferente
import { AlertasDbService } from '../prisma/alertas-db.service'; 
// Ajuste o nome do cliente Prisma e importe Tipos e Enums
import { Prisma, Importancia, Alertas } from '@prisma/alertas-client'; 
import { CreateAlertaDto } from './dto/create-alerta.dto';
import { UpdateAlertaDto } from './dto/update-alerta.dto';

@Injectable()
export class WarningsService {
    // Injete o serviço Prisma correto
    constructor(private prisma: AlertasDbService) {}

    /**
     * Busca alertas relevantes para o usuário:
     * - Alertas criados pelo usuário
     * - Alertas destinados ao usuário
     * - Alertas públicos (sem destinatário específico)
     * Exclui os que já estão concluídos.
     */
    async findAll(userId: number): Promise<Alertas[]> {
        return this.prisma.alertas.findMany({
            where: {
                concluido: false, // Busca apenas os não concluídos
            },
            orderBy: [
                // Ordena por importância (ALTA primeiro) e depois por data (mais recentes primeiro)
                {importancia: 'desc'}, // Asumindo ordem ALTA > MEDIA > BAIXA no Enum
                {createdAt: 'desc'},
            ]
        });
    }

    /**
     * Busca um único alerta pelo ID, verificando a permissão do usuário.
     */
    async findOne(userId: number, id: number): Promise<Alertas> {
        const alerta = await this.prisma.alertas.findUnique({
            where: { id: id },
        });

        if (!alerta) {
            throw new NotFoundException(`Alerta com ID ${id} não encontrado.`);
        }

        return alerta;
    }


    /**
     * Cria um novo alerta associado ao usuário.
     */
    async create(userId: number, createAlertaDto: CreateAlertaDto): Promise<Alertas> {
        return this.prisma.alertas.create({
            data: {
                ...createAlertaDto,
                concluido: false, // Começa como não concluído
            },
        });
    }

    /**
     * Atualiza um alerta existente.
     * Verifica se o usuário tem permissão para editar.
     */
    async update(userId: number, id: number, updateAlertaDto: UpdateAlertaDto): Promise<Alertas> {
        const alerta = await this.findOne(userId, id); // Reutiliza findOne para buscar e verificar permissão inicial

        // Lógica para atualizar a data de conclusão
        let finishedAt: Date | null = alerta.finishedAt; // Mantém a data anterior por padrão
        if (updateAlertaDto.concluido === true && !alerta.concluido) {
            finishedAt = new Date(); // Define a data de conclusão ao marcar como concluído
        } else if (updateAlertaDto.concluido === false && alerta.concluido) {
             finishedAt = null; // Remove a data ao reabrir
        }

        try {
            return await this.prisma.alertas.update({
                where: { id: id },
                data: {
                    ...updateAlertaDto,
                     finishedAt: finishedAt, // Atualiza a data de conclusão
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException(`Alerta com ID ${id} não encontrado.`);
            }
            throw error;
        }
    }

    /**
     * Remove um alerta.
     * Verifica se o usuário tem permissão para remover.
     */
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
