import { JwtService } from '@nestjs/jwt';
import { UsuariosDbService } from 'src/prisma/usuarios-db.service';
export declare class AuthService {
    private usuariosDb;
    private jwtService;
    constructor(usuariosDb: UsuariosDbService, jwtService: JwtService);
    login(login: string, pass: string): Promise<{
        token: string;
        user: {
            id: number;
            nome: string;
            lojaId: number | null;
            funcoes: import("@prisma/usuarios-client/client").$Enums.Funcao[];
        };
    }>;
}
