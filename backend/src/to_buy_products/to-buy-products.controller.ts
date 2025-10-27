import { Controller, Get, UseGuards, Request, Body, Post} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ToBuyProductsService } from './to-buy-products.service'; // Corrigido
import { CreateHistoricBuyDto } from './dto/create-historic-buy.dto';

@Controller('to_buy_products')
export class ToBuyProductsController { // Corrigido
  constructor(private readonly toBuyProductsService: ToBuyProductsService) {} // Corrigido

  @UseGuards(AuthGuard('jwt'))
  @Get() // Rota GET /to-buy-products
  async getToBuyProducts(@Request() req) {
    const userId = req.user.sub;
    return this.toBuyProductsService.getList(userId);
  }

  // Endpoint para CRIAR um novo historico de compra
  @UseGuards(AuthGuard('jwt'))
  @Post() // Rota POST /to-buy-products
  async addProductBuy(
    @Request() req,
    @Body() createHistoricBuyDto: CreateHistoricBuyDto,
  ) {
    const userId = req.user.sub;
    return this.toBuyProductsService.addBuy(userId, createHistoricBuyDto);
  }
}

