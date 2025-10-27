import { Module } from '@nestjs/common';
import { ToBuyProductsController } from './to-buy-products.controller';
import { ToBuyProductsService } from './to-buy-products.service';
import { PrismaModule } from '../prisma/prisma.module'; // Importe o seu módulo Prisma

@Module({
  imports: [PrismaModule], // Disponibiliza o EstoqueDbService para o ToBuyProductsService
  controllers: [ToBuyProductsController],
  providers: [ToBuyProductsService],
})
export class ToBuyProductsModule {}

