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
} from '@nestjs/common';
import { ControleService } from './controle.service';
import { LegacyPayloadDto, TipoParamDto } from './dto/legacy-payload.dto';

@Controller('legacy')
export class ControleController {
  constructor(private readonly legacyService: ControleService) {}

  private validateTipo(tipo: string): 'costura' | 'tingimento' | 'tapete' {
    if (!['costura', 'tingimento', 'tapete'].includes(tipo)) {
      throw new BadRequestException('Tipo de serviço inválido');
    }
    return tipo as 'costura' | 'tingimento' | 'tapete';
  }

  @Post(':tipo')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('tipo') tipoParam: string,
    @Body() legacyPayloadDto: LegacyPayloadDto,
  ) {
    const tipo = this.validateTipo(tipoParam);
    return this.legacyService.create(tipo, legacyPayloadDto);
  }

  @Put(':tipo')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('tipo') tipoParam: string,
    @Body() legacyPayloadDto: LegacyPayloadDto,
  ) {
    const tipo = this.validateTipo(tipoParam);
    return this.legacyService.update(tipo, legacyPayloadDto);
  }

  @Get(':tipo')
  async find(
    @Param('tipo') tipoParam: string,
    @Query('rol') rol?: string,
  ) {
    const tipo = this.validateTipo(tipoParam);

    // Se houver ROL na query (ex: /legacy/costura?rol=123), busca por ROL
    if (rol) {
      const rolNumerico = parseInt(rol, 10);
      if (isNaN(rolNumerico)) {
        throw new BadRequestException('ROL inválido. Deve ser um número.');
      }
      const data = await this.legacyService.findByRol(tipo, rolNumerico);
      if (!data) {
        throw new NotFoundException('Registro não encontrado com este ROL.');
      }
      return data;
    }

    // Se não houver ROL, busca todos (para a tabela)
    return this.legacyService.findAll(tipo);
  }
}