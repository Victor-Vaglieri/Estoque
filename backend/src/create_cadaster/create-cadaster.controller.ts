import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { RegistrationService } from './create-cadaster.service';
import { CreateRegistrationDto } from './dto/create-cadaster.dto';

@Controller('cadastrar_usuario') // Endpoint exato que o frontend chama
export class RegistrationController {
    constructor(private readonly registrationService: RegistrationService) {}

    /**
     * Rota PÚBLICA para criar uma nova solicitação de cadastro.
     * Note que NÃO usamos @UseGuards(AuthGuard('jwt')) aqui,
     * pois o usuário ainda não está logado.
     */
    @Post()
    async registerUser(
        // Valida automaticamente o body da requisição usando o DTO
        @Body(new ValidationPipe()) createDto: CreateRegistrationDto
    ) {
        return this.registrationService.create(createDto);
    }
}
