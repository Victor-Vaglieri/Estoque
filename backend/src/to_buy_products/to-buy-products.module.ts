import { Module } from '@nestjs/common';
import { ComprasController } from './to-buy-products.controller';
import { ComprasService } from './to-buy-products.service';
import { EstoqueDbService } from '../prisma/estoque-db.service'; 

@Module({
  imports: [],
  controllers: [ComprasController],
  providers: [ComprasService, EstoqueDbService],
})
export class ComprasModule {}