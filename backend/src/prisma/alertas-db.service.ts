// src/prisma/alertas-db.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient as AlertasClient } from '@prisma/alertas-client';

@Injectable()
export class AlertasDbService extends AlertasClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}