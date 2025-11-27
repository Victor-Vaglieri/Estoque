import { RegistrationService } from './create-cadaster.service';
import { CreateRegistrationDto } from './dto/create-cadaster.dto';
export declare class RegistrationController {
    private readonly registrationService;
    constructor(registrationService: RegistrationService);
    registerUser(createDto: CreateRegistrationDto): Promise<{
        message: string;
    }>;
}
