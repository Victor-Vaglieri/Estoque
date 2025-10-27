import { Controller, Get, Patch, Param, Body, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RecebimentosService } from './recive.service';
import { UpdateRecebimentoDto } from './dto/update-recebimento.dto';

@Controller('recebimentos') // Rota base /recebimentos
export class RecebimentosController {
    constructor(private readonly recebimentosService: RecebimentosService) {}

    @UseGuards(AuthGuard('jwt'))
    @Get('/pendentes') // Rota GET /recebimentos/pendentes
    async findPending(@Request() req) {
        const userId = req.user.sub; // Pega o ID do usuário logado
        // TODO: Decidir se o userId é necessário para filtrar a busca no service
        return this.recebimentosService.findPending(userId); 
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id') // Rota PATCH /recebimentos/{id_do_historico_compra}
    async updateStatus(
        @Param('id', ParseIntPipe) historicoCompraId: number, // Pega o ID da URL
        @Request() req,
        @Body() updateRecebimentoDto: UpdateRecebimentoDto, // Pega os dados validados do corpo
    ) {
        const userId = req.user.sub; // Pega o ID do usuário que está fazendo a ação
        return this.recebimentosService.updateStatus(userId, historicoCompraId, updateRecebimentoDto);
    }
}
