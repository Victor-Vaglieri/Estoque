
import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PrismaModule } from '../prisma/prisma.module'; // Importe seu módulo Prisma

@Module({
  imports: [PrismaModule], // Disponibiliza o EstoqueDbService
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
