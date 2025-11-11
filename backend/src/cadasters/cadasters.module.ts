import { Module } from '@nestjs/common';
import { PerfisController } from './cadasters.controller';
import { PerfisService } from './cadasters.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule], 
  controllers: [PerfisController],
  providers: [PerfisService],
})
export class CadastrosModule {}

