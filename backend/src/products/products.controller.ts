import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req, 
  ForbiddenException,
  Patch, 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { UpdateProdutoDto } from './dto/update-product.dto'; 
import { CreateProdutoDto } from './dto/create-product.dto'; 


type AuthUser = {
  id: number;
  lojaId: number;
};

@UseGuards(AuthGuard('jwt')) 
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('fornecedores')
  findAllFornecedores() {
    return this.productsService.findAllFornecedores();
  }
  
  @Get()
  async getProducts(@Req() req) {
    const authUser = req.user as AuthUser;
    console.log('ServiceController - User Loja ID:', authUser.lojaId);
    if (!authUser?.lojaId) {
      throw new ForbiddenException('Usuário não associado a uma loja.');
    }
    return this.productsService.findAll(authUser.lojaId);
  }

  
  @Get('withStock')
  async getProductsWithStock(@Req() req) {
    const authUser = req.user as AuthUser;
    if (!authUser?.lojaId) {
      throw new ForbiddenException('Usuário não associado a uma loja.');
    }
    return this.productsService.findWithStock(authUser.lojaId);
  }

  
  @Post()
  async addProduct(
    @Req() req,
    @Body() createProductDto: CreateProdutoDto,
  ) {
    const authUser = req.user as AuthUser;
    if (!authUser?.lojaId) {
      throw new ForbiddenException('Usuário não associado a uma loja.');
    }
    return this.productsService.create(createProductDto, authUser.lojaId);
  }

  
  @Patch(':id') 
  async modifyProduct(
    @Param('id', ParseIntPipe) productId: number,
    @Req() req,
    @Body() updateProductDto: UpdateProdutoDto, 
  ) {
    const authUser = req.user as AuthUser;
    if (!authUser?.lojaId) {
      throw new ForbiddenException('Usuário não associado a uma loja.');
    }
    return this.productsService.update(
      productId,
      updateProductDto,
      authUser.lojaId,
    );
  }

  
  
}