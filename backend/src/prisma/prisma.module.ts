// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { UsuariosDbService } from './usuarios-db.service';
import { EstoqueDbService } from './estoque-db.service';
import { AlertasDbService } from './alertas-db.service';

@Global()
@Module({
  providers: [UsuariosDbService, EstoqueDbService,AlertasDbService],
  exports: [UsuariosDbService, EstoqueDbService,AlertasDbService], // Exporta ambos os serviços
})
export class PrismaModule {}