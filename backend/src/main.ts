// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // Importante para validação

async function bootstrap() {
  // 1. Cria a instância da aplicação a partir do nosso módulo principal (AppModule)
  const app = await NestFactory.create(AppModule);

  // 2. [IMPORTANTE] Habilita o CORS (Cross-Origin Resource Sharing)
  // Isso permite que seu frontend (rodando em localhost:3000) possa fazer
  // requisições para o seu backend (rodando em localhost:3001). Sem isso, o navegador bloquearia.
  app.enableCors();

  // 3. [IMPORTANTE] Configura um "Pipe" de validação global
  // Isso garante que todas as requisições que chegam nos seus controllers
  // e usam DTOs (como o LoginDto) sejam validadas automaticamente.
  app.useGlobalPipes(new ValidationPipe());

  // 4. Define a porta em que a aplicação vai rodar
  const port = process.env.PORT || 3001;
  await app.listen(port);

  // Mensagem útil para sabermos que o servidor subiu e em qual porta
  console.log(`🚀 Aplicação rodando na porta: ${port}`);
}

// 5. Executa a função bootstrap para iniciar tudo
bootstrap();