import { Module } from '@nestjs/common';
import { ExitsController } from './exits.controller';
import { ExitsService } from './exits.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ExitsController],
    providers: [ExitsService],
})
export class ExitsModule { }
