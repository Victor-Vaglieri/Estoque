import { Module } from '@nestjs/common';
import { RecebimentosController } from './recive.controller';
import { RecebimentosService } from './recive.service';
import { PrismaModule } from '../prisma/prisma.module'; // Importe seu módulo Prisma

@Module({
  imports: [PrismaModule], // Disponibiliza o EstoqueDbService
  controllers: [RecebimentosController],
  providers: [RecebimentosService],
})
export class RecebimentosModule {}
