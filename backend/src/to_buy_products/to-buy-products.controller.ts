import { Controller, Get, UseGuards, Request, Body, Post} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ToBuyProductsService } from './to-buy-products.service'; 
import { CreateHistoricBuyDto } from './dto/create-historic-buy.dto';

@Controller('to_buy_products')
export class ToBuyProductsController { 
  constructor(private readonly toBuyProductsService: ToBuyProductsService) {} 

  @UseGuards(AuthGuard('jwt'))
  @Get() // Rota GET /to-buy-products
  async getToBuyProducts(@Request() req) {
    const userId = req.user.sub;
    return this.toBuyProductsService.getList(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post() 
  async addProductBuy(
    @Request() req,
    @Body() createHistoricBuyDto: CreateHistoricBuyDto,
  ) {
    const userId = req.user.sub;
    return this.toBuyProductsService.addBuy(userId, createHistoricBuyDto);
  }
}

