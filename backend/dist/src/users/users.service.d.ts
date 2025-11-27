import { UsuariosDbService } from '../prisma/usuarios-db.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: UsuariosDbService);
    updateLogin(userId: number, newLogin: string): Promise<{
        message: string;
    }>;
    updatePassword(userId: number, dto: UpdatePasswordDto): Promise<{
        message: string;
    }>;
    findByLojaId(lojaId: number): Promise<{
        id: number;
    }[]>;
}
