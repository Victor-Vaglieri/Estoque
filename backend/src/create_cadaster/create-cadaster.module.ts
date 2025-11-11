import { Module } from '@nestjs/common';
import { RegistrationController } from './create-cadaster.controller';
import { RegistrationService } from './create-cadaster.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService],
})
export class RegistrationModule {}