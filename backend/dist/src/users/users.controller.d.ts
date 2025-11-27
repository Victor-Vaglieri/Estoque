import { UsersService } from './users.service';
import { UpdateLoginDto } from './dto/update-login.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    updateLogin(req: any, updateLoginDto: UpdateLoginDto): Promise<{
        message: string;
    }>;
    updatePassword(req: any, updatePasswordDto: UpdatePasswordDto): Promise<{
        message: string;
    }>;
}
