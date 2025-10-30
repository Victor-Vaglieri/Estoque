import { Module } from '@nestjs/common';
import { RegistrationController } from './create-cadaster.controller';
import { RegistrationService } from './create-cadaster.service';
// Importe o módulo que fornece o CadastrosDbService
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule // Precisa importar para injetar o CadastrosDbService
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService],
})
export class RegistrationModule {}