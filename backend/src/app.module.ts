// src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PrismaModule } from './prisma/prisma.module'; 
import { AlertsModule } from './alerts/alerts.module'; 
import { ProductsModule } from './products/products.module'; // <-- IMPORTAÇÃO DO MÓDULO DE PRODUTOS
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule, PrismaModule, DashboardModule,AlertsModule,ProductsModule,UsersModule], // <-- E ADICIONE AQUI
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}