import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { EstoqueDbService } from '../prisma/estoque-db.service'; 
import { CreateSaidaDto } from './dto/create-saida.dto';
import { UpdateSaidaDto } from './dto/update-saida.dto';


type AuthUser = {
  id: number;
  lojaId: number;
  
};

@Injectable()
export class ExitsService {
  constructor(private estoqueDb: EstoqueDbService) {} 

  
  async create(createSaidaDto: CreateSaidaDto, authUser: AuthUser) {
    const { produtoId, quantidade } = createSaidaDto;
    const { id: userId, lojaId } = authUser;

    return this.estoqueDb.$transaction(async (tx) => {
      
      const estoqueLoja = await tx.estoqueLoja.findUnique({
        where: {
          produtoId_lojaId: {
            produtoId: produtoId,
            lojaId: lojaId,
          },
        },
      });

      
      if (!estoqueLoja) {
        throw new NotFoundException(
          'Produto não encontrado no estoque desta loja.',
        );
      }

      
      if (estoqueLoja.quantidadeEst < quantidade) {
        throw new BadRequestException(
          `Estoque insuficiente. Disponível nesta loja: ${estoqueLoja.quantidadeEst}`,
        );
      }

      
      await tx.estoqueLoja.update({
        where: {
          produtoId_lojaId: {
            produtoId: produtoId,
            lojaId: lojaId,
          },
        },
        data: {
          quantidadeEst: { decrement: quantidade },
        },
      });

      
      const data = {
        ...createSaidaDto,
        responsavelId: userId,
        lojaId: lojaId, 
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

  
  findAll(authUser: AuthUser) {
    return this.estoqueDb.saida.findMany({
      where: {
        
        lojaId: authUser.lojaId,
      },
      include: {
        produto: true,
      },
      orderBy: {
        data: 'desc',
      },
    });
  }

  
  async update(id: number, updateSaidaDto: UpdateSaidaDto, authUser: AuthUser) {
    return this.estoqueDb.$transaction(async (tx) => {
      
      const saidaOriginal = await tx.saida.findUnique({
        where: { id },
      });

      if (!saidaOriginal) {
        throw new NotFoundException('Registro de saída não encontrado.');
      }

      
      if (saidaOriginal.lojaId !== authUser.lojaId) {
        throw new ForbiddenException(
          'Você não tem permissão para editar este registro.',
        );
      }

      
      const novaQuantidade = updateSaidaDto.quantidade;
      if (
        novaQuantidade &&
        novaQuantidade !== saidaOriginal.quantidade
      ) {
        
        const estoqueLoja = await tx.estoqueLoja.findUnique({
          where: {
            produtoId_lojaId: {
              produtoId: saidaOriginal.produtoId,
              lojaId: authUser.lojaId,
            },
          },
        });

        if (!estoqueLoja) {
          throw new NotFoundException(
            'Estoque deste produto não encontrado na loja.',
          );
        }

        
        const diferencaEstoque =
          novaQuantidade - saidaOriginal.quantidade;

        
        if (estoqueLoja.quantidadeEst < diferencaEstoque) {
          throw new BadRequestException(
            `Estoque insuficiente para esta alteração. Disponível: ${estoqueLoja.quantidadeEst}`,
          );
        }

        
        await tx.estoqueLoja.update({
          where: {
            produtoId_lojaId: {
              produtoId: saidaOriginal.produtoId,
              lojaId: authUser.lojaId,
            },
          },
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