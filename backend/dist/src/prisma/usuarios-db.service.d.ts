import { OnModuleInit } from '@nestjs/common';
import { PrismaClient as UsuariosClient } from '@prisma/usuarios-client';
export declare class UsuariosDbService extends UsuariosClient implements OnModuleInit {
    onModuleInit(): Promise<void>;
}
