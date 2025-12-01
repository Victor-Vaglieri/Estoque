// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- CONFIGURAÇÃO DE CORS ROBUSTA ---
  app.enableCors({
    origin: [
      'http://localhost:3000',             // Para seus testes locais
      'https://estoque-sand.vercel.app',   // Sua URL do Vercel (SEM a barra / no final)
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Lista explícita de métodos
    allowedHeaders: 'Content-Type, Authorization',     // Headers permitidos
    credentials: true,                                 // Permite cookies/headers de auth
    preflightContinue: false,
    optionsSuccessStatus: 204,                         // Resolve problemas de status 405 em alguns navegadores
  });

  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 3001;
  // O Railway exige escutar no 0.0.0.0
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Aplicação rodando na porta: ${port}`);
}

bootstrap();