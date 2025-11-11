import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { EstoqueDbService } from '../prisma/estoque-db.service';
import { CreateSaidaDto } from './dto/create-saida.dto';
import { UpdateSaidaDto } from './dto/update-saida.dto';

@Injectable()
export class ExitsService {
  constructor(private estoqueDb: EstoqueDbService) {}
  async create(createSaidaDto: CreateSaidaDto, userId: number) {
    const { produtoId, quantidade } = createSaidaDto;

    return this.estoqueDb.$transaction(async (tx) => {
      const produto = await tx.produto.findUnique({
        where: { id: produtoId },
      });

      if (!produto) {
        throw new NotFoundException('Produto não encontrado.');
      }

      if (produto.quantidadeEst < quantidade) {
        throw new BadRequestException(
          `Estoque insuficiente. Disponível: ${produto.quantidadeEst}`,
        );
      }

      await tx.produto.update({
        where: { id: produtoId },
        data: {
          quantidadeEst: { decrement: quantidade },
        },
      });

      const data = {
        ...createSaidaDto,
        responsavelId: userId,
      };

      const novaSaida = await tx.saida.create({
        data,
        include: {
          produto: true,
        },
      });

      return novaSaida;
    });
  }

  findAll(userId: number) {
    return this.estoqueDb.saida.findMany({
      where: {
        responsavelId: userId, // TODO adicionar somente a loja que o usuario pertence
      },
      include: {
        produto: true,
      },
      orderBy: {
        data: 'desc',
      },
    });
  }


  async update(id: number, updateSaidaDto: UpdateSaidaDto, userId: number) {
    return this.estoqueDb.$transaction(async (tx) => {
      const saidaOriginal = await tx.saida.findUnique({
        where: { id },
      });

      if (!saidaOriginal) {
        throw new NotFoundException('Registro de saída não encontrado.');
      }

      if (saidaOriginal.responsavelId !== userId) {
        throw new ForbiddenException(
          'Você não tem permissão para editar este registro.',
        );
      }
      const novaQuantidade = updateSaidaDto.quantidade;
      if (
        novaQuantidade &&
        novaQuantidade !== saidaOriginal.quantidade
      ) {
        const produto = await tx.produto.findUnique({
          where: { id: saidaOriginal.produtoId },
        });

        if (!produto) {
          throw new NotFoundException(
            'Produto associado a esta saída não foi encontrado.',
          );
        }

        const diferencaEstoque =
          novaQuantidade - saidaOriginal.quantidade;

        if (produto.quantidadeEst < diferencaEstoque) {
          throw new BadRequestException(
            `Estoque insuficiente para esta alteração. Disponível: ${produto.quantidadeEst}`,
          );
        }

        await tx.produto.update({
          where: { id: saidaOriginal.produtoId },
          data: {
            quantidadeEst: { decrement: diferencaEstoque },
          },
        });
      }

      return tx.saida.update({
        where: { id },
        data: updateSaidaDto,
        include: {
          produto: true,
        },
      });
    });
  }
}