import { Module } from '@nestjs/common';
import { InventarioController } from './inventory.controller';
import { InventarioService } from './inventory.service';
import { EstoqueDbService } from '../prisma/estoque-db.service'; 
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../prisma/prisma.module'; 

@Module({

  imports: [EventEmitterModule.forRoot(),PrismaModule], 
  controllers: [InventarioController],
  providers: [InventarioService, EstoqueDbService], 
})
export class InventarioModule {}