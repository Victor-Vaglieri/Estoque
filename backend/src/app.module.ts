// src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PrismaModule } from './prisma/prisma.module'; // <-- IMPORTE AQUI

@Module({
  imports: [AuthModule, PrismaModule, DashboardModule], // <-- E ADICIONE AQUI
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}