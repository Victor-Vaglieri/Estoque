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
import { RecebimentosModule } from './recive/recive.module'; // <-- IMporte o módulo de recebimentos
import { InventarioModule } from './inventory/inventory.module';
import { ReportsModule } from './reports/reports.module';
import { WarningsModule } from './warnings/warnings.module';
import { CadastrosModule } from './cadasters/cadasters.module';
import { RegistrationModule } from './create_cadaster/create-cadaster.module';
import { ExitsModule } from './exits/exits.module';
import { ControleModule } from './legacy/controle.module';
@Module({
  imports: [AuthModule, PrismaModule, DashboardModule,AlertsModule,ProductsModule,UsersModule,ToBuyProductsModule,RecebimentosModule,InventarioModule,ReportsModule,WarningsModule,CadastrosModule,RegistrationModule,ExitsModule,ControleModule], // <-- E ADICIONE AQUI
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}