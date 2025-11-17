// src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PrismaModule } from './prisma/prisma.module'; 
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { ComprasModule } from './to_buy_products/to-buy-products.module'; 
import { RecebimentosModule } from './recive/recive.module'; 
import { InventarioModule } from './inventory/inventory.module';
import { RelatoriosModule } from './reports/reports.module';
import { WarningsModule } from './warnings/warnings.module';
import { CadastrosModule } from './cadasters/cadasters.module';
import { RegistrationModule } from './create_cadaster/create-cadaster.module';
import { ExitsModule } from './exits/exits.module';
import { ControleModule } from './legacy/controle.module';
@Module({
  imports: [AuthModule, PrismaModule, DashboardModule,ProductsModule,UsersModule,
    ComprasModule,RecebimentosModule,InventarioModule,RelatoriosModule,WarningsModule,CadastrosModule,
    RegistrationModule,ExitsModule,ControleModule], 
  providers: [AppService],
})
export class AppModule {}