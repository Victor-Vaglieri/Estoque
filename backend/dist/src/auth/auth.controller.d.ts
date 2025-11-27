import { AuthService } from './auth.service';
declare class LoginDto {
    login: string;
    senha: string;
}
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signIn(signInDto: LoginDto): Promise<{
        token: string;
        user: {
            id: number;
            nome: string;
            lojaId: number | null;
            funcoes: import("@prisma/usuarios-client/client").$Enums.Funcao[];
        };
    }>;
}
export {};
