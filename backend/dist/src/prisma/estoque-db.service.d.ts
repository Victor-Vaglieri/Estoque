import { OnModuleInit } from '@nestjs/common';
import { PrismaClient as EstoqueClient } from '@prisma/estoque-client';
export declare class EstoqueDbService extends EstoqueClient implements OnModuleInit {
    onModuleInit(): Promise<void>;
}
