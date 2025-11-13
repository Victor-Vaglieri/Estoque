import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ExitsService } from './exits.service'; 
import { CreateSaidaDto } from './dto/create-saida.dto';
import { UpdateSaidaDto } from './dto/update-saida.dto';
import { AuthGuard } from '@nestjs/passport'; 


type AuthUser = {
  id: number;
  lojaId: number;
};

@UseGuards(AuthGuard('jwt'))
@Controller('saidas')
export class ExitsController {
  constructor(private readonly saidasService: ExitsService) {} 

  @Post()
  create(@Body() createSaidaDto: CreateSaidaDto, @Req() req) {
    
    const authUser = req.user as AuthUser;
    if (!authUser?.lojaId) {
      throw new ForbiddenException('Usuário não associado a uma loja.');
    }
    return this.saidasService.create(createSaidaDto, authUser);
  }

  @Get()
  findAll(@Req() req) {
    
    const authUser = req.user as AuthUser;
    if (!authUser?.lojaId) {
      throw new ForbiddenException('Usuário não associado a uma loja.');
    }
    return this.saidasService.findAll(authUser);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSaidaDto: UpdateSaidaDto,
    @Req() req,
  ) {
    
    const authUser = req.user as AuthUser;
    if (!authUser?.lojaId) {
      throw new ForbiddenException('Usuário não associado a uma loja.');
    }
    return this.saidasService.update(id, updateSaidaDto, authUser);
  }
}