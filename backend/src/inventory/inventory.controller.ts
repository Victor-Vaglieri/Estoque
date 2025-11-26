import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InventarioService } from './inventory.service';
import { AjusteInventarioDto } from './dto/update-inventario.dto';


type AuthUser = {
  id: number;
  lojaId: number;
};

@UseGuards(AuthGuard('jwt'))
@Controller('inventario') 
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  
  @Get()
  findAll(@Req() req) {
    const authUser = req.user as AuthUser;
    if (!authUser?.lojaId) {
      throw new ForbiddenException('Usuário não associado a uma loja.');
    }
    return this.inventarioService.findAllForInventory(authUser.lojaId);
  }

  
  @Patch('ajuste')
  ajustarEstoque(
    @Body() ajusteInventarioDto: AjusteInventarioDto,
    @Req() req,
  ) {
    const authUser = req.user as AuthUser;
    if (!authUser?.lojaId) {
      throw new ForbiddenException('Usuário não associado a uma loja.');
    }
    return this.inventarioService.ajustarEstoque(
      ajusteInventarioDto.updates,
      authUser.lojaId,
      authUser.id, 
    );
  }
}