import { Controller, Get, Patch, Param, Body, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RecebimentosService } from './recive.service';
import { UpdateRecebimentoDto } from './dto/update-recebimento.dto';

@Controller('recebimentos') 
export class RecebimentosController {
    constructor(private readonly recebimentosService: RecebimentosService) {}

    @UseGuards(AuthGuard('jwt'))
    @Get('/pendentes') 
    async findPending(@Request() req) {
        const userId = req.user;
        return this.recebimentosService.findPending(userId); 
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id') 
    async updateStatus(
        @Param('id', ParseIntPipe) historicoCompraId: number, 
        @Request() req,
        @Body() updateRecebimentoDto: UpdateRecebimentoDto,
    ) {
        const userId = req.user;
        return this.recebimentosService.updateStatus(userId, historicoCompraId, updateRecebimentoDto);
    }
}
