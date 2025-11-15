import { Module } from '@nestjs/common';
import { InventarioController } from './inventory.controller';
import { InventarioService } from './inventory.service';
import { EstoqueDbService } from '../prisma/estoque-db.service'; 
// MUDANÇA: Importar o Event Emitter
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({

  imports: [EventEmitterModule.forRoot()], 
  controllers: [InventarioController],
  providers: [InventarioService, EstoqueDbService], 
})
export class InventarioModule {}