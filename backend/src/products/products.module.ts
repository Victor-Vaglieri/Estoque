// src/dashboard/dashboard.module.ts

import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaModule } from '../prisma/prisma.module'; // Importe o PrismaModule se ele existir

@Module({
  imports: [PrismaModule], // Disponibiliza o PrismaService para este módulo
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}