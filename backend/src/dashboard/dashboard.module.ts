import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
// Importe o serviço Prisma do seu banco de estoque
import { EstoqueDbService } from '../prisma/estoque-db.service'; 

@Module({
  imports: [],
  controllers: [DashboardController],
  providers: [DashboardService, EstoqueDbService],
})
export class DashboardModule {}