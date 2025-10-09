// src/prisma/usuarios-db.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient as UsuariosClient } from '@prisma/usuarios-client';

@Injectable()
export class UsuariosDbService extends UsuariosClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}