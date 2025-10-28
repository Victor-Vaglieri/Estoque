//src/alerts/alerts.module.ts
import { Module } from '@nestjs/common';
import { WarningsController } from './warnings.controller'; // Ou avisos.controller.ts se renomear
import { WarningsService } from './warnings.service';    // Ou avisos.service.ts se renomear
// Ajuste o caminho para o seu módulo Prisma
import { PrismaModule } from '../prisma/prisma.module'; 

@Module({
  imports: [PrismaModule], // Garante que o serviço Prisma está disponível
  controllers: [WarningsController],
  providers: [WarningsService],
})
export class WarningsModule {} // Mantenha o nome da classe ou renomeie para AvisosModule
