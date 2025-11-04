// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { UsuariosDbService } from './usuarios-db.service';
import { EstoqueDbService } from './estoque-db.service';
import { AlertasDbService } from './alertas-db.service';
import { CadastrosDbService } from './cadastros-db.service';
import { ControleDbService } from './controle-db.service';

@Global()
@Module({
  providers: [UsuariosDbService, EstoqueDbService,AlertasDbService,CadastrosDbService,ControleDbService],
  exports: [UsuariosDbService, EstoqueDbService,AlertasDbService,CadastrosDbService,ControleDbService], // Exporta ambos os serviços
})
export class PrismaModule {}