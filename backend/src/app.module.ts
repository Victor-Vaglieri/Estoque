// src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module'; // <-- IMPORTE AQUI

@Module({
  imports: [AuthModule, PrismaModule], // <-- E ADICIONE AQUI
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}