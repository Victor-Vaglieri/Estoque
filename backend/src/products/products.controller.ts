// src/products/products.controller.ts

import { Controller, Get, UseGuards, Request, Body, Put, Param,ParseIntPipe,Post} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('') 
  async getProducts(@Request() req) {
    const userId = req.user.sub;

    return this.productsService.getProducts(userId);
  }

  // Endpoint para CRIAR um novo produto
  @UseGuards(AuthGuard('jwt'))
  @Post() // 2. Use o decorador @Post
  async addProduct(
    @Request() req,
    @Body() createProductDto: CreateProductDto, // 3. Use o DTO de criação
  ) {
    const userId = req.user.sub;
    return this.productsService.addProduct(userId, createProductDto);
  }


  @UseGuards(AuthGuard('jwt'))
  @Put(':id') 
  async modifyProduct(
    @Param('id', ParseIntPipe) productId: number, 
    @Request() req,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const userId = req.user.sub;
    
    // 3. Passe o ID do produto para o seu serviço
    return this.productsService.modifyProduct(userId, productId, updateProductDto);
  }
}