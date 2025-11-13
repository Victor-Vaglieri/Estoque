import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  NotFoundException,
  BadRequestException,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req, 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ControleService } from './controle.service';
import { LegacyPayloadDto } from './dto/legacy-payload.dto';


type TipoServico = 'costura' | 'tingimento' | 'tapete' | 'mala';

type AuthUser = {
  id: number;
  lojaId: number;
};

@UseGuards(AuthGuard('jwt'))
@Controller('legacy')
export class ControleController {
  constructor(private readonly legacyService: ControleService) {}

  
  private validateTipo(tipo: string): TipoServico {
    const tiposValidos: TipoServico[] = [
      'costura',
      'tingimento',
      'tapete',
      'mala', 
    ];
    if (!tiposValidos.includes(tipo as any)) {
      throw new BadRequestException('Tipo de serviço inválido');
    }
    return tipo as TipoServico;
  }

  @Post(':tipo')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('tipo') tipoParam: string,
    @Body() legacyPayloadDto: LegacyPayloadDto,
    @Req() req, 
  ) {
    const tipo = this.validateTipo(tipoParam);
    const authUser = req.user as AuthUser; 
    
    return this.legacyService.create(tipo, legacyPayloadDto, authUser);
  }

  @Put(':tipo')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('tipo') tipoParam: string,
    @Body() legacyPayloadDto: LegacyPayloadDto,
    @Req() req, 
  ) {
    const tipo = this.validateTipo(tipoParam);
    const authUser = req.user as AuthUser; 
    
    return this.legacyService.update(tipo, legacyPayloadDto, authUser);
  }

  @Get(':tipo')
  async find(
    @Param('tipo') tipoParam: string,
    @Req() req, 
    @Query('rol') rol?: string,
  ) {
    const tipo = this.validateTipo(tipoParam);
    const authUser = req.user as AuthUser; 

    if (rol) {
      const rolNumerico = parseInt(rol, 10);
      if (isNaN(rolNumerico)) {
        throw new BadRequestException('ROL inválido. Deve ser um número.');
      }
      
      const data = await this.legacyService.findByRol(
        tipo,
        rolNumerico,
        authUser,
      );
      if (!data) {
        throw new NotFoundException('Registro não encontrado com este ROL.');
      }
      return data;
    }
    
    return this.legacyService.findAll(tipo, authUser);
  }
}