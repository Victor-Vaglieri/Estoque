// src/prisma/prisma.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // O OnModuleInit é opcional, mas garante que a conexão
  // seja estabelecida assim que o módulo iniciar.
  async onModuleInit() {
    await this.$connect();
  }
}