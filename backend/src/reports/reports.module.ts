import { Module } from '@nestjs/common';
import { RelatoriosController } from './reports.controller';
import { RelatoriosService } from './reports.service';
// O PrismaModule (que criamos acima) é Global, 
// então não precisamos importá-lo aqui.

@Module({
  controllers: [RelatoriosController],
  providers: [RelatoriosService],
})
export class RelatoriosModule {}