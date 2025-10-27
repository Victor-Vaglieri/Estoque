import { Controller, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InventarioService } from './inventory.service';
import { UpdateInventarioDto } from './dto/update-inventario.dto';

@Controller('inventario') // Rota base /inventario
export class InventarioController {
    constructor(private readonly inventarioService: InventarioService) {}

    @UseGuards(AuthGuard('jwt'))
    @Patch('update') // Rota PATCH /inventario/update
    async updateInventario(
        @Request() req,
        @Body() updateInventarioDto: UpdateInventarioDto, // Recebe o DTO validado
    ) {
        const userId = req.user.sub; // Pega o ID do usuário logado
        return this.inventarioService.updateQuantities(userId, updateInventarioDto);
    }
}
