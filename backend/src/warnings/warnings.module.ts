import { Module } from '@nestjs/common';
import { WarningsController } from './warnings.controller';
import { WarningsService } from './warnings.service';
import { AlertasDbService } from '../prisma/alertas-db.service'; 
import { UsersModule } from '../users/users.module'; 
import { AlertasListener } from './warnings.listener';

@Module({
  imports: [UsersModule], 
  controllers: [WarningsController],
  providers: [WarningsService, AlertasListener, AlertasDbService],
})
export class WarningsModule {}