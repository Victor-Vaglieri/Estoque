import { OnModuleInit } from '@nestjs/common';
import { PrismaClient as CadastrosClient } from '@prisma/cadastros-client';
export declare class CadastrosDbService extends CadastrosClient implements OnModuleInit {
    onModuleInit(): Promise<void>;
}
