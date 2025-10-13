// src/dashboard/dashboard.module.ts

import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PrismaModule } from '../prisma/prisma.module'; // Importe o PrismaModule se ele existir

@Module({
  imports: [PrismaModule], // Disponibiliza o PrismaService para este módulo
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}