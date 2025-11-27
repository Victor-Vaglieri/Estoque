import { OnModuleInit } from '@nestjs/common';
import { PrismaClient as ControleClient } from '@prisma/controle-client';
export declare class ControleDbService extends ControleClient implements OnModuleInit {
    onModuleInit(): Promise<void>;
}
