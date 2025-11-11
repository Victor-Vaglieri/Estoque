import { Module } from '@nestjs/common';
import { RecebimentosController } from './recive.controller';
import { RecebimentosService } from './recive.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RecebimentosController],
  providers: [RecebimentosService],
})
export class RecebimentosModule {}
