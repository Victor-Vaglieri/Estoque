import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { RegistrationService } from './create-cadaster.service';
import { CreateRegistrationDto } from './dto/create-cadaster.dto';

@Controller('cadastrar_usuario')
export class RegistrationController {
    constructor(private readonly registrationService: RegistrationService) {}
    @Post()
    async registerUser(
        @Body(new ValidationPipe()) createDto: CreateRegistrationDto
    ) {
        return this.registrationService.create(createDto);
    }
}
