// src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PrismaModule } from './prisma/prisma.module'; 
import { AlertsModule } from './alerts/alerts.module'; 
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { ToBuyProductsModule } from './to_buy_products/to-buy-products.module'; 

@Module({
  imports: [AuthModule, PrismaModule, DashboardModule,AlertsModule,ProductsModule,UsersModule,ToBuyProductsModule], // <-- E ADICIONE AQUI
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}