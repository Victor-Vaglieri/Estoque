import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PerfisService } from './cadasters.service';
import { AprovarSolicitacaoDto, UpdateUserDto } from './dto/perfis.dto';
import { Funcao } from '@prisma/usuarios-client';

type AuthUser = {
  id?: number;
  sub?: number; 
  lojaId: number;
  funcoes: Funcao[];
};

@UseGuards(AuthGuard('jwt'))
@Controller('perfis')
export class PerfisController {
  constructor(private readonly perfisService: PerfisService) {}

  private checkGestor(user: AuthUser) {
    
    if (!user.funcoes || !user.funcoes.includes(Funcao.GESTOR)) {
      throw new ForbiddenException('Acesso negado. Apenas Gestores.');
    }
  }

  
  private getUserId(user: AuthUser): number {
    const id = user.id || user.sub;
    if (!id) {
      throw new InternalServerErrorException('ID do usuário não encontrado no token.');
    }
    return id;
  }

  @Get('solicitacoes')
  getSolicitacoes(@Req() req) {
    this.checkGestor(req.user);
    return this.perfisService.getSolicitacoes();
  }

  @Get('usuarios')
  getUsuarios(@Req() req) {
    this.checkGestor(req.user);
    return this.perfisService.getUsuarios();
  }

  @Get('confirmados')
  getSolicitacoesConfirmadas(@Req() req) {
    this.checkGestor(req.user);
    return this.perfisService.getSolicitacoesConfirmadas();
  }

  @Get('lojas')
  getLojas(@Req() req) {
    this.checkGestor(req.user);
    return this.perfisService.getLojas();
  }

  @Post('aprovar/:id')
  aprovarSolicitacao(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AprovarSolicitacaoDto,
    @Req() req,
  ) {
    this.checkGestor(req.user);
    
    const adminId = this.getUserId(req.user);
    return this.perfisService.aprovarSolicitacao(adminId, id, dto);
  }

  @Delete('rejeitar/:id')
  rejeitarSolicitacao(@Param('id', ParseIntPipe) id: number, @Req() req) {
    this.checkGestor(req.user);
    return this.perfisService.rejeitarSolicitacao(id);
  }

  @Patch('usuario/:id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @Req() req,
  ) {
    this.checkGestor(req.user);
    return this.perfisService.updateUser(id, dto);
  }

  @Delete('usuario/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number, @Req() req) {
    this.checkGestor(req.user);
    const adminId = this.getUserId(req.user);
    return this.perfisService.deleteUser(adminId, id);
  }
}