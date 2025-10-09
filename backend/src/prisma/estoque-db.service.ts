// src/prisma/estoque-db.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient as EstoqueClient } from '@prisma/estoque-client';

@Injectable()
export class EstoqueDbService extends EstoqueClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}