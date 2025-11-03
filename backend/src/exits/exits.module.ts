import { Module } from '@nestjs/common';
import { ExitsController } from './exits.controller';
import { ExitsService } from './exits.service';
import { PrismaModule } from '../prisma/prisma.module'; // Importando nosso PrismaService customizado

@Module({
    imports: [PrismaModule],
    controllers: [ExitsController],
    providers: [ExitsService], // Registre o PrismaService
})
export class ExitsModule { }
