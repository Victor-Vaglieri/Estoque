import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ControleDbService } from '../prisma/controle-db.service';
import { LegacyPayloadDto } from './dto/legacy-payload.dto';

import { MeioDeContato } from '@prisma/controle-client';


type TipoServico = 'costura' | 'tingimento' | 'tapete' | 'mala';



type AuthUser = {
  id: number;
  lojaId: number;
};

@Injectable()
export class ControleService {
  constructor(private controleDB: ControleDbService) { }
  async findAll(tipo: TipoServico, authUser: AuthUser) {
    const selectFields = {
      id: true,
      rol: true,
      nome_cliente: true,
      data_recebimento: true,
      data_da_entrega: true,
    };


    const whereClause = {
      lojaId: authUser.lojaId,
    };

    switch (tipo) {
      case 'costura':
        return this.controleDB.costuraRegistro.findMany({
          select: selectFields,
          where: whereClause,
          orderBy: { rol: 'desc' },
        });
      case 'tingimento':
        return this.controleDB.tingimentoRegistro.findMany({
          select: selectFields,
          where: whereClause,
          orderBy: { rol: 'desc' },
        });
      case 'tapete':
        return this.controleDB.tapeteRegistro.findMany({
          select: selectFields,
          where: whereClause,
          orderBy: { rol: 'desc' },
        });
      case 'mala':
        return this.controleDB.malaRegistro.findMany({
          select: selectFields,
          where: whereClause,
          orderBy: { rol: 'desc' },
        });
    }
  }


  async findByRol(tipo: TipoServico, rol: number, authUser: AuthUser) {
    let registro;
    switch (tipo) {
      case 'costura':
        registro = await this.controleDB.costuraRegistro.findUnique({
          where: { rol },
          include: { itens: true },
        });
        break;
      case 'tingimento':
        registro = await this.controleDB.tingimentoRegistro.findUnique({
          where: { rol },
          include: { itens: true },
        });
        break;
      case 'tapete':
        registro = await this.controleDB.tapeteRegistro.findUnique({
          where: { rol },
          include: { itens: true },
        });
        break;
      case 'mala':
        registro = await this.controleDB.malaRegistro.findUnique({
          where: { rol },
          include: { itens: true },
        });
        break;
    }

    if (!registro) {
      return null;
    }


    if (registro.lojaId !== authUser.lojaId) {
      throw new ForbiddenException('Acesso negado a este ROL.');
    }

    const { itens, ...fixos } = registro;
    return { fixos, multiplos: itens || [] };
  }


  async create(
    tipo: TipoServico,
    payload: LegacyPayloadDto,
    authUser: AuthUser,
  ) {
    const dadosFixos = this.prepareFixedData(payload.fixos);
    const dadosMultiplos = this.prepareMultipleData(payload.multiplos);

    switch (tipo) {
      case 'costura':
        
        return this.controleDB.costuraRegistro.create({
          data: {
            ...dadosFixos,
            lojaId: authUser.lojaId,
            rol: Number(dadosFixos.rol), 
            itens: {
              create: dadosMultiplos as any,
            },
          } as any,
        });

      case 'tingimento':
        
        return this.controleDB.tingimentoRegistro.create({
          data: {
            ...dadosFixos,
            lojaId: authUser.lojaId,
            rol: Number(dadosFixos.rol),
            itens: {
              create: dadosMultiplos as any,
            }
          } as any,
        });

      case 'tapete':
        
        return this.controleDB.tapeteRegistro.create({
          data: {
            ...dadosFixos,
            lojaId: authUser.lojaId,
            rol: Number(dadosFixos.rol),
            itens: {
              create: dadosMultiplos as any,
            },
          } as any,
        });
      case 'mala':
        
        return this.controleDB.malaRegistro.create({
          data: {
            ...dadosFixos,
            lojaId: authUser.lojaId,
            rol: Number(dadosFixos.rol),
            itens: {
              create: dadosMultiplos as any,
            },
          } as any,
        });
    }
  }



  async update(
    tipo: TipoServico,
    payload: LegacyPayloadDto,
    authUser: AuthUser,
  ) {
    const dadosFixos = this.prepareFixedData(payload.fixos);
    const dadosMultiplos = this.prepareMultipleData(payload.multiplos);

    const rol = dadosFixos.rol as number;
    if (!rol) {
      throw new NotFoundException('ROL não fornecido para atualização.');
    }


    delete dadosFixos.id;
    delete dadosFixos.createdAt;
    delete dadosFixos.updatedAt;
    delete dadosFixos.lojaId;

    return this.controleDB.$transaction(async (tx) => {
      let registroAtualizado;
      let registroId: number;


      const registroExistente = await (tx as any)[`${tipo}Registro`].findUnique({
        where: { rol },
        select: { id: true, lojaId: true },
      });

      if (!registroExistente) {
        throw new NotFoundException('ROL não encontrado.');
      }

      if (registroExistente.lojaId !== authUser.lojaId) {
        throw new ForbiddenException('Acesso negado a este ROL.');
      }


      switch (tipo) {
        case 'costura':
          registroAtualizado = await tx.costuraRegistro.update({
            where: { rol },
            data: dadosFixos,
          });
          registroId = registroAtualizado.id;
          await tx.costuraItem.deleteMany({ where: { registroId } });
          if (dadosMultiplos.length > 0) {
            await tx.costuraItem.createMany({
              data: dadosMultiplos.map((item) => ({ ...item, registroId })) as any,
            });
          }
          break;

        case 'tingimento':
          registroAtualizado = await tx.tingimentoRegistro.update({
            where: { rol },
            data: dadosFixos,
          });
          registroId = registroAtualizado.id;
          await tx.tingimentoItem.deleteMany({ where: { registroId } });
          if (dadosMultiplos.length > 0) {
            await tx.tingimentoItem.createMany({
              data: dadosMultiplos.map((item) => ({ ...item, registroId })) as any,
            });
          }
          break;

        case 'tapete':
          registroAtualizado = await tx.tapeteRegistro.update({
            where: { rol },
            data: dadosFixos,
          });
          registroId = registroAtualizado.id;
          await tx.tapeteItem.deleteMany({ where: { registroId } });
          if (dadosMultiplos.length > 0) {
            await tx.tapeteItem.createMany({
              data: dadosMultiplos.map((item) => ({ ...item, registroId })) as any,
            });
          }
          break;
        case 'mala':
          registroAtualizado = await tx.malaRegistro.update({
            where: { rol },
            data: dadosFixos,
          });
          registroId = registroAtualizado.id;
          await tx.malaItem.deleteMany({ where: { registroId } });
          if (dadosMultiplos.length > 0) {
            await tx.malaItem.createMany({
              data: dadosMultiplos.map((item) => ({ ...item, registroId })) as any,
            });
          }
          break;
      }
      return registroAtualizado;
    });
  }


  private mapMeioDeContato(value: string): MeioDeContato | null {
    if (!value) return null;


    const key = value.toUpperCase().trim();


    switch (key) {
      case 'GOOGLE':
        return MeioDeContato.GOOGLE;
      case 'REDE_SOCIAL':
        return MeioDeContato.REDE_SOCIAL;
      case 'AMIGOS':
        return MeioDeContato.AMIGOS;
      case 'LOJA':
        return MeioDeContato.LOJA;
      case 'OUTROS':
        return MeioDeContato.OUTROS;
      default:

        throw new BadRequestException(
          `Valor inválido para Meio de Contato: ${value}`,
        );
    }
  }


  private prepareFixedData(fixos: Record<string, any>): Record<string, any> {
    const dadosLimpos: Record<string, any> = {};


    const dateKeys = [
      'data_recebimento',
      'data_da_entrega',
      'envio_a_washtec',
      'retorno_da_washtec',
      'envio_a_master',
      'retorno_da_master',
    ];

    for (const key in fixos) {
      const value = fixos[key];


      if (key === 'meio_de_contato') {

        dadosLimpos['meio_de_contato_inicial'] = this.mapMeioDeContato(value);
      } else if (dateKeys.includes(key)) {


        dadosLimpos[key] = value ? new Date(value) : null;
      } else if (key === 'rol' && value) {

        dadosLimpos[key] = parseInt(value, 10);
      } else if (value !== undefined && value !== null) {

        dadosLimpos[key] = value;
      }
    }


    delete dadosLimpos.id;
    delete dadosLimpos.createdAt;
    delete dadosLimpos.updatedAt;

    return dadosLimpos;
  }

  private prepareMultipleData(
    multiplos: Record<string, any>[],
  ): Record<string, any>[] {
    return multiplos.map((item) => {
      const itemLimpo = { ...item };
      for (const key in itemLimpo) {
        const value = itemLimpo[key];


        if (
          key.includes('custo') ||
          key.includes('cobrado') ||
          key.includes('valor')
        ) {

          const floatVal = parseFloat(value);
          itemLimpo[key] = isNaN(floatVal) ? null : floatVal;
        }
      }
      delete itemLimpo.id;
      delete itemLimpo.registroId;
      return itemLimpo;
    });
  }
}