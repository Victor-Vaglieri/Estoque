import { Injectable, NotFoundException } from '@nestjs/common';
import { ControleDbService } from '../prisma/controle-db.service'
import { LegacyPayloadDto } from './dto/legacy-payload.dto';

type TipoServico = 'costura' | 'tingimento' | 'tapete';

@Injectable()
export class ControleService {
  constructor(private controleDB: ControleDbService) { }

  async findAll(tipo: TipoServico) {
    const selectFields = { // TODO listar melhor isso aqui
      id: true,
      rol: true,
      cliente: true,
      data_de_entrada: true,
      previsao_de_entrega: true,
    };

    switch (tipo) {
      case 'costura':
        return this.controleDB.costuraRegistro.findMany({ select: selectFields });
      case 'tingimento':
        return this.controleDB.tingimentoRegistro.findMany({ select: selectFields });
      case 'tapete':
        return this.controleDB.tapeteRegistro.findMany({ select: selectFields });
    }
  }

  async findByRol(tipo: TipoServico, rol: number) {
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
    }

    if (!registro) {
      return null;
    }

    const { itens, ...fixos } = registro;
    return { fixos, multiplos: itens || [] };
  }


  async create(tipo: TipoServico, payload: LegacyPayloadDto) {
    const dadosFixos = this.prepareFixedData(payload.fixos);
    const dadosMultiplos = this.prepareMultipleData(payload.multiplos);
    const { rol, ...outrosDadosFixos } = dadosFixos;

    switch (tipo) {
      case 'costura':
        return this.controleDB.costuraRegistro.create({
          data: {
            rol: rol as number,
            ...outrosDadosFixos,
            itens: {
              create: dadosMultiplos,
            },
          },
        });

      case 'tingimento':
        return this.controleDB.tingimentoRegistro.create({
          data: {
            rol: rol as number,
            ...outrosDadosFixos,
            itens: {
              create: dadosMultiplos,
            },
          },
        });

      case 'tapete':
        return this.controleDB.tapeteRegistro.create({
          data: {
            rol: rol as number,
            ...outrosDadosFixos,
            itens: {
              create: dadosMultiplos,
            },
          },
        });
    }
  }
  async update(tipo: TipoServico, payload: LegacyPayloadDto) {
    const dadosFixos = this.prepareFixedData(payload.fixos);
    const dadosMultiplos = this.prepareMultipleData(payload.multiplos);

    const rol = dadosFixos.rol;
    if (!rol) {
      throw new NotFoundException('ROL não fornecido para atualização.');
    }

    delete dadosFixos.id;
    delete dadosFixos.createdAt;
    delete dadosFixos.updatedAt;

    return this.controleDB.$transaction(async (tx) => {
      let registroAtualizado;
      let registroId: number;

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
              data: dadosMultiplos.map((item) => ({ ...item, registroId })),
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
              data: dadosMultiplos.map((item) => ({ ...item, registroId })),
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
              data: dadosMultiplos.map((item) => ({ ...item, registroId })),
            });
          }
          break;
      }
      return registroAtualizado;
    });
  }

  private prepareFixedData(fixos: Record<string, any>): Record<string, any> {
    const dadosLimpos = { ...fixos };

    for (const key in dadosLimpos) {
      const value = dadosLimpos[key];

      if (key.includes('data_') || key.includes('previsao_')) {
        dadosLimpos[key] = value ? new Date(value) : null;
      }
      if (key === 'rol' && value) {
        dadosLimpos[key] = parseInt(value, 10);
      }
    }
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