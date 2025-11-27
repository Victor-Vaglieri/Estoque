import { OnModuleInit } from '@nestjs/common';
import { PrismaClient as AlertasClient } from '@prisma/alertas-client';
export declare class AlertasDbService extends AlertasClient implements OnModuleInit {
    onModuleInit(): Promise<void>;
}
