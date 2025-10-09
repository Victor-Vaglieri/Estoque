// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { UsuariosDbService } from './usuarios-db.service';
import { EstoqueDbService } from './estoque-db.service';

@Global()
@Module({
  providers: [UsuariosDbService, EstoqueDbService],
  exports: [UsuariosDbService, EstoqueDbService], // Exporta ambos os serviços
})
export class PrismaModule {}