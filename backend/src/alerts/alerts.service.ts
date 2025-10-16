//src/alerts/alerts.service.ts
import { Injectable } from '@nestjs/common';
import { AlertasDbService } from '../prisma/alertas-db.service';

@Injectable()
export class AlertsService {
    constructor(private alertasDb: AlertasDbService) { }

    async getAlerts(userId: number) {
        const alerta_alto = await this.alertasDb.alertas.findMany({
            where: {
                importancia: 'ALTA',
                concluido: false,
                destinadoPara: null,
            }
        },);

        const alerta_medio = await this.alertasDb.alertas.findMany({
            where: {
                importancia: 'MEDIA',
                concluido: false,
                destinadoPara: null,
            }
        },);

        const alerta_baixo = await this.alertasDb.alertas.findMany({
            where: {
            importancia: 'BAIXA',
            concluido: false,
            destinadoPara: null,
            }
        },);

        const aviso_ao_usuario = await this.alertasDb.alertas.findMany({
            where: {
                destinadoPara: userId,
                concluido: false,
            }
        },);

        return {
            alerta_alto,
            alerta_medio,
            alerta_baixo,
            aviso_ao_usuario
        };
    }
}