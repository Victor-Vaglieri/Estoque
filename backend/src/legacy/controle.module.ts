import { Module } from '@nestjs/common';
import { ControleService } from './controle.service';
import { ControleController } from './controle.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ControleController],
  providers: [ControleService],
})
export class ControleModule { }