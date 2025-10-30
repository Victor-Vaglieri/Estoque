// src/prisma/alertas-db.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient as CadastrosClient } from '@prisma/cadastros-client';

@Injectable()
export class CadastrosDbService extends CadastrosClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}