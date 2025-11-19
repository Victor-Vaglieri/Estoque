import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { AlertasDbService } from '../prisma/alertas-db.service';
import { Prisma, Importancia, Alertas } from '@prisma/alertas-client';
import { CreateAlertaDto } from './dto/create-alerta.dto';
import { UpdateAlertaDto } from './dto/update-alerta.dto';
import { Funcao } from '@prisma/usuarios-client';

type AuthUser = {
  id: number;
  lojaId: number;
  nome: string;
  funcoes: Funcao[];
};

interface CreateAlertaSistemaDto {
  titulo: string;
  descricao: string;
  importancia: Importancia;
  lojaId: number;
  criadorId: number;
  criadorNome: string;
}

@Injectable()
export class WarningsService {
  constructor(private prisma: AlertasDbService) { }


  async findAll(authUser: AuthUser): Promise<Alertas[]> {
    return this.prisma.alertas.findMany({
      where: {
        concluido: false,
        OR: [
          { lojaId: authUser.lojaId },
          { destinatarios: { some: { userId: authUser.id } } },
        ],
      },
      orderBy: [{ importancia: 'desc' }, { createdAt: 'desc' }],
    });
  }


  async findOne(authUser: AuthUser, id: number): Promise<Alertas> {
    const alerta = await this.prisma.alertas.findUnique({
      where: { id: id },
      include: {
        destinatarios: {
          select: { userId: true },
        },
      },
    });

    if (!alerta) {
      throw new NotFoundException(`Alerta com ID ${id} não encontrado.`);
    }


    const isDaLoja = alerta.lojaId === authUser.lojaId;


    const isDestinatario = alerta.destinatarios.some(
      (d) => d.userId === authUser.id,
    );


    if (!isDaLoja && !isDestinatario) {
      throw new ForbiddenException('Você não tem permissão para ver este alerta.');
    }

    delete (alerta as any).destinatarios;
    return alerta;
  }


  async create(
    authUser: AuthUser,
    createAlertaDto: CreateAlertaDto,
  ): Promise<Alertas> {
    // 1. Separa o array de IDs do resto dos dados
    const { destinatarios, ...restDto } = createAlertaDto;

    return this.prisma.alertas.create({
      data: {
        ...restDto,
        concluido: false,
        criadorId: authUser.id,
        criadorNome: authUser.nome,
        lojaId: authUser.lojaId,
        // 2. Formata corretamente para o Prisma criar os relacionamentos
        destinatarios: {
          create: destinatarios && destinatarios.length > 0
            ? destinatarios.map((userId) => ({ userId }))
            : [],
        },
      },
    });
  }

  async update(
    authUser: AuthUser,
    id: number,
    updateAlertaDto: UpdateAlertaDto,
  ): Promise<Alertas> {
    const alerta = await this.findOne(authUser, id);

    if (alerta.criadorId !== authUser.id) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar este alerta (somente o criador).',
      );
    }

    let finishedAt: Date | null = alerta.finishedAt;
    if (updateAlertaDto.concluido === true && !alerta.concluido) {
      finishedAt = new Date();
    } else if (updateAlertaDto.concluido === false && alerta.concluido) {
      finishedAt = null;
    }

    // 1. Separa destinatarios para tratar separadamente
    const { destinatarios, ...restDto } = updateAlertaDto;

    // Monta o objeto de update do relacionamento APENAS se destinatarios foi enviado
    let destinatariosUpdateOps: any = {};

    if (destinatarios !== undefined) {
      // Se enviou uma lista (vazia ou cheia), removemos os antigos e criamos os novos
      destinatariosUpdateOps = {
        deleteMany: {}, // Apaga todos os vínculos anteriores deste alerta
        create: destinatarios.map((userId) => ({ userId })), // Cria os novos
      };
    }

    try {
      return await this.prisma.alertas.update({
        where: { id: id },
        data: {
          ...restDto,
          finishedAt: finishedAt,
          // 2. Aplica a lógica de atualização dos destinatários se necessário
          ...(destinatarios !== undefined && {
            destinatarios: destinatariosUpdateOps,
          }),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Alerta com ID ${id} não encontrado.`);
      }
      throw error;
    }
  }


  async remove(authUser: AuthUser, id: number): Promise<Alertas> {

    const alerta = await this.findOne(authUser, id);


    const isGestor = authUser.funcoes.includes(Funcao.GESTOR);


    const isCriador = alerta.criadorId === authUser.id;


    if (!isGestor && !isCriador) {
      throw new ForbiddenException(
        'Você não tem permissão para remover este alerta (somente o criador ou gestor).',
      );
    }


    try {
      return await this.prisma.alertas.delete({
        where: { id: id },
      });
    } catch (error) {

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Alerta com ID ${id} não encontrado.`);
      }
      throw error;
    }

  }




  async createAlertaSistema(
    dto: CreateAlertaSistemaDto,
  ): Promise<Alertas> {
    return this.prisma.alertas.create({
      data: {
        titulo: dto.titulo,
        descricao: dto.descricao,
        importancia: dto.importancia,
        lojaId: dto.lojaId,
        criadorId: dto.criadorId,
        criadorNome: dto.criadorNome,
        concluido: false,
      },
    });
  }


  async associarAlertaAUsuarios(
    alertaId: number,
    userIds: number[],
  ): Promise<Prisma.BatchPayload> {
    const dataToCreate = userIds.map((userId) => ({
      alertaId: alertaId,
      userId: userId,
    }));



    try {
      return await this.prisma.alertaDestinatario.createMany({
        data: dataToCreate,
      });
    } catch (error) {



      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        console.log('Ignorando duplicatas ao associar alerta (P2002).');

        return { count: 0 };
      }

      throw error;
    }
  }
}