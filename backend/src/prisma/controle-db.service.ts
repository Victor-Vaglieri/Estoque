// src/prisma/alertas-db.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient as ControleClient } from '@prisma/controle-client';

@Injectable()
export class ControleDbService extends ControleClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}