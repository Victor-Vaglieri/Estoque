import { CadastrosDbService } from '../prisma/cadastros-db.service';
import { CreateRegistrationDto } from './dto/create-cadaster.dto';
export declare class RegistrationService {
    private cadastrosDb;
    constructor(cadastrosDb: CadastrosDbService);
    create(dto: CreateRegistrationDto): Promise<{
        message: string;
    }>;
}
