import { Module } from '@nestjs/common';
import { PerfisController } from './cadasters.controller';
import { PerfisService } from './cadasters.service';

// --- IMPORTANTE ---
// Importe os DOIS módulos Prisma que fornecem os serviços de DB
import { PrismaModule } from 'src/prisma/prisma.module'; // Assumindo este nome

@Module({
  // Importa ambos os módulos Prisma
  imports: [PrismaModule], 
  controllers: [PerfisController],
  providers: [PerfisService],
})
export class CadastrosModule {}

