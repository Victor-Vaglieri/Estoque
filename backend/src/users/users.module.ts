import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
// Importe os módulos de que este módulo depende
// (Ex: O módulo que exporta o seu EstoqueDbService, que pode ser PrismaModule)
// import { PrismaModule } from '../prisma/prisma.module';

@Module({
  // Se o seu PrismaService estiver num módulo separado, importe-o
  // imports: [PrismaModule], 
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
