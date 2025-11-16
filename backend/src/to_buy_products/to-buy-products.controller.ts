import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ComprasService } from './to-buy-products.service';
import { RegisterPurchaseDto, ProductToBuy } from './dto/compras.dto';


type AuthUser = {
  id: number;
  lojaId: number;
};

@UseGuards(AuthGuard('jwt'))
@Controller('compras') 
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  
  @Get('lista')
  async getShoppingList(@Req() req): Promise<Record<string, ProductToBuy[]>> {
    const authUser = req.user as AuthUser;
    if (!authUser?.lojaId) {
      throw new ForbiddenException('Usuário não associado a uma loja.');
    }
    return this.comprasService.findAllToBuy(authUser.lojaId);
  }

  
  @Post('registrar')
  registerPurchase(@Body() dto: RegisterPurchaseDto, @Req() req) {
    const authUser = req.user as AuthUser;
    if (!authUser?.lojaId) {
      throw new ForbiddenException('Usuário não associado a uma loja.');
    }
    return this.comprasService.registerPurchase(dto, authUser);
  }
}