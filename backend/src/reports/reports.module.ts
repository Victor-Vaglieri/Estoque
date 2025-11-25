import { Module } from '@nestjs/common';
import { RelatoriosController } from './reports.controller';
import { RelatoriosService } from './reports.service';

@Module({
  controllers: [RelatoriosController],
  providers: [RelatoriosService],
})
export class RelatoriosModule {}