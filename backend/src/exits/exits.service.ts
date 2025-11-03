import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException, // Importe isso
} from '@nestjs/common';
import { EstoqueDbService } from '../prisma/estoque-db.service';
import { CreateSaidaDto } from './dto/create-saida.dto';
import { UpdateSaidaDto } from './dto/update-saida.dto';

@Injectable()
export class ExitsService {
  constructor(private estoqueDb: EstoqueDbService) {}

  /**
   * CORREÇÃO: Cria uma nova saída e ATUALIZA o estoque do produto
   * dentro de uma transação segura.
   */
  async create(createSaidaDto: CreateSaidaDto, userId: number) {
    const { produtoId, quantidade } = createSaidaDto;

    // Usamos uma transação para garantir que ambas as operações funcionem
    return this.estoqueDb.$transaction(async (tx) => {
      // 1. Encontra o produto e verifica o estoque
      const produto = await tx.produto.findUnique({
        where: { id: produtoId },
      });

      if (!produto) {
        throw new NotFoundException('Produto não encontrado.');
      }

      // 2. Verifica se há estoque suficiente
      // Usando 'quantidadeEst' (Estoque) em vez de 'quantidadeNec' (Necessária)
      if (produto.quantidadeEst < quantidade) {
        throw new BadRequestException(
          `Estoque insuficiente. Disponível: ${produto.quantidadeEst}`,
        );
      }

      // 3. Atualiza (dá baixa) no estoque do produto
      await tx.produto.update({
        where: { id: produtoId },
        data: {
          // decrementa o estoque pela quantidade da saída
          quantidadeEst: { decrement: quantidade },
        },
      });

      // 4. Cria o registro de Saída
      const data = {
        ...createSaidaDto,
        responsavelId: userId,
      };

      const novaSaida = await tx.saida.create({
        data,
        include: {
          produto: true, // Retorna o produto junto para o frontend
        },
      });

      return novaSaida;
    });
  }

  /**
   * Encontra todas as saídas do usuário logado.
   */
  findAll(userId: number) {
    return this.estoqueDb.saida.findMany({
      where: {
        responsavelId: userId,
      },
      include: {
        produto: true, // Adicionado: O frontend precisa disso
      },
      orderBy: {
        data: 'desc', // Mais recentes primeiro
      },
    });
  }

  /**
   * CORREÇÃO: Atualiza uma saída, verificando a posse e
   * AJUSTANDO o estoque (devolvendo o antigo e tirando o novo).
   */
  async update(id: number, updateSaidaDto: UpdateSaidaDto, userId: number) {
    // Usamos uma transação para segurança
    return this.estoqueDb.$transaction(async (tx) => {
      // 1. Busca a saída original
      const saidaOriginal = await tx.saida.findUnique({
        where: { id },
      });

      if (!saidaOriginal) {
        throw new NotFoundException('Registro de saída não encontrado.');
      }

      // 2. ADICIONADO: Verifica a posse
      if (saidaOriginal.responsavelId !== userId) {
        throw new ForbiddenException(
          'Você não tem permissão para editar este registro.',
        );
      }

      // 3. Lógica de ajuste de estoque (se a quantidade mudou)
      const novaQuantidade = updateSaidaDto.quantidade;

      if (
        novaQuantidade &&
        novaQuantidade !== saidaOriginal.quantidade
      ) {
        // Encontra o produto
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

        // Verifica se o estoque pode cobrir a diferença
        if (produto.quantidadeEst < diferencaEstoque) {
          throw new BadRequestException(
            `Estoque insuficiente para esta alteração. Disponível: ${produto.quantidadeEst}`,
          );
        }

        // Atualiza o estoque do produto com a diferença
        await tx.produto.update({
          where: { id: saidaOriginal.produtoId },
          data: {
            quantidadeEst: { decrement: diferencaEstoque },
          },
        });
      }

      // 4. Se tudo estiver OK, atualiza a saída
      return tx.saida.update({
        where: { id },
        data: updateSaidaDto,
        include: {
          produto: true, // Retorna o dado atualizado com o produto
        },
      });
    });
  }
}