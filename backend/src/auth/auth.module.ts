// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module'; // Importe o PrismaModule
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule, // Disponibiliza o PrismaService para este módulo
    JwtModule.register({
      global: true, // Torna o JwtModule global, não precisa importar em outros módulos
      secret: process.env.SECRET_JWT, // Use uma variável de ambiente para o segredo
      signOptions: { expiresIn: '1h' }, // O token expira em 1 hora
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}