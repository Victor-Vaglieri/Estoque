import { Module } from '@nestjs/common';
import { InventarioController } from './inventory.controller';
import { InventarioService } from './inventory.service';
import { PrismaModule } from '../prisma/prisma.module'; // Importe seu módulo Prisma

@Module({
  imports: [PrismaModule], // Disponibiliza o EstoqueDbService
  controllers: [InventarioController],
  providers: [InventarioService],
})
export class InventarioModule {}
