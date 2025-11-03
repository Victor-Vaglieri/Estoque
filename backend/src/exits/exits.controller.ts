import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    UseGuards,
    Req,
    ParseIntPipe,
    ForbiddenException,
} from '@nestjs/common';
import { ExitsService } from './exits.service';
import { CreateSaidaDto } from './dto/create-saida.dto';
import { UpdateSaidaDto } from './dto/update-saida.dto';
import { AuthGuard } from '@nestjs/passport';

// Protege todas as rotas deste controlador.
// O usuário DEVE estar logado.
@UseGuards(AuthGuard('jwt'))
@Controller('saidas')
export class ExitsController {
    constructor(private readonly saidasService: ExitsService) { }

    /**
     * (POST /saidas)
     * Cria uma nova saída.
     * O ID do responsável é pego automaticamente do usuário logado.
     */
    @Post()
    create(@Body() createSaidaDto: CreateSaidaDto, @Req() req) {
        const userId = req.user.sub;
        if (!userId) {
            throw new ForbiddenException('Usuário não autenticado.');
        }
        return this.saidasService.create(createSaidaDto, userId);
    }

    @Get()
    findAll(@Req() req) {
        const userId = req.user.sub;
        if (!userId) {
            throw new ForbiddenException('Usuário não autenticado.');
        }
        return this.saidasService.findAll(userId);
    }


    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateSaidaDto: UpdateSaidaDto,
        @Req() req,
    ) {
        const userId = req.user.sub;
        if (!userId) {
            throw new ForbiddenException('Usuário não autenticado.');
        }
        return this.saidasService.update(id, updateSaidaDto, userId);
    }
}
