// src/products/products.controller.ts

import { Controller, Get, UseGuards, Request, Body, Put, Param,ParseIntPipe} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('') 
  async getProducts(@Request() req) {
    const userId = req.user.sub;

    return this.productsService.getProducts(userId);
  }

  // TODO implementar criação de produto 
  @UseGuards(AuthGuard('jwt'))
  @Put('/new') 
  async addProduct(@Request() req, @Body() productData) {
    const userId = req.user.sub;
    return this.productsService.addProduct(userId, productData);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id') 
  async modifyProduct(
    @Param('id', ParseIntPipe) productId: number, 
    @Request() req,
    @Body() updateProductDto: UpdateProductDto,// Idealmente, crie um DTO (Data Transfer Object) para productData
  ) {
    const userId = req.user.sub;
    
    // 3. Passe o ID do produto para o seu serviço
    return this.productsService.modifyProduct(userId, productId, updateProductDto);
  }
}