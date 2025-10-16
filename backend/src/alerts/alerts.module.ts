//src/alerts/alerts.module.ts
import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { PrismaModule } from '../prisma/prisma.module'; // Importe o PrismaModule se ele existir

@Module({
  imports: [PrismaModule], // Disponibiliza o PrismaService para este módulo
  controllers: [AlertsController],
  providers: [AlertsService],
})
export class AlertsModule {}