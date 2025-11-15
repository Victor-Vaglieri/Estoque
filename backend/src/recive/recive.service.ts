import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, EstadoEntrada } from '@prisma/estoque-client';
import { EstoqueDbService } from '../prisma/estoque-db.service';
import { UpdateRecebimentoDto } from './dto/update-recebimento.dto';


type AuthUser = {
  id: number;
  lojaId: number;
  
};

@Injectable()
export class RecebimentosService {
  constructor(private estoqueDb: EstoqueDbService) {}

  
  async findPending(authUser: AuthUser) {
    if (!authUser.lojaId) {
      throw new ForbiddenException('Usuário não associado a uma loja.');
    }

    
    const distribuicoes = await this.estoqueDb.compraDistribuicao.findMany({
      where: {
        lojaId: authUser.lojaId,
        confirmadoEntrada: {
          in: [EstadoEntrada.PENDENTE, EstadoEntrada.FALTANTE],
        },
      },
      include: {
        
        historicoCompra: {
          include: {
            
            produto: {
              select: {
                id: true,
                nome: true,
                unidade: true,
                marca: true,
              },
            },
          },
        },
      },
      orderBy: {
        historicoCompra: { data: 'asc' }, 
      },
    });

    
    return distribuicoes.map((dist) => ({
      id: dist.id, 
      quantidade: dist.quantidade, 
      precoTotal: dist.historicoCompra.precoTotal, 
      data: dist.historicoCompra.data, 
      confirmadoEntrada: dist.confirmadoEntrada, 
      produto: dist.historicoCompra.produto,
    }));
  }

  
  async updateStatus(
    authUser: AuthUser,
    distribuicaoId: number, 
    updateDto: UpdateRecebimentoDto,
  ) {
    const { status: newStatus, precoConfirmado } = updateDto;
    const { id: userId, lojaId } = authUser;

    
    const distribuicaoOriginal = await this.estoqueDb.compraDistribuicao.findUnique({
        where: { id: distribuicaoId },
        include: { historicoCompra: true }, 
      },
    );

    if (!distribuicaoOriginal) {
      throw new NotFoundException(
        `Registro de distribuição com ID ${distribuicaoId} não encontrado.`,
      );
    }

    
    if (distribuicaoOriginal.lojaId !== lojaId) {
      throw new ForbiddenException(
        'Você não tem permissão para confirmar esta entrada.',
      );
    }

    const oldStatus = distribuicaoOriginal.confirmadoEntrada;
    const quantidadeParaLoja = distribuicaoOriginal.quantidade;
    const produtoId = distribuicaoOriginal.historicoCompra.produtoId;
    const fornecedorId = distribuicaoOriginal.historicoCompra.fornecedorId;
    const quantidadeTotalDaCompra = distribuicaoOriginal.historicoCompra.quantidade;

    try {
      const [updatedDistribuicao] = await this.estoqueDb.$transaction(
        async (prismaTx) => {
          
          const updatedDistribuicao = await prismaTx.compraDistribuicao.update({
            where: { id: distribuicaoId },
            data: {
              confirmadoEntrada: newStatus,
              responsavelConfirmacaoId: userId,
              
              
              
            },
          });

          
          if (
            newStatus === EstadoEntrada.CONFIRMADO &&
            oldStatus !== EstadoEntrada.CONFIRMADO
          ) {
            
            await prismaTx.estoqueLoja.upsert({
              where: {
                produtoId_lojaId: {
                  produtoId: produtoId,
                  lojaId: lojaId, 
                },
              },
              update: {
                quantidadeEst: { increment: quantidadeParaLoja },
              },
              create: {
                produtoId: produtoId,
                lojaId: lojaId,
                quantidadeEst: quantidadeParaLoja,
              },
            });

            let precoUnitarioReal = 0;
            if (quantidadeTotalDaCompra > 0) {
              // Preço total da NF dividido pela quantidade total comprada
              precoUnitarioReal = precoConfirmado / quantidadeTotalDaCompra;
            }
            // Preço que esta loja pagou (proporcional)
            const precoPagoParaEstaEntrada = precoUnitarioReal * quantidadeParaLoja;


            
            await prismaTx.entrada.create({
              data: {
                produtoId: produtoId,
                quantidade: quantidadeParaLoja,
                precoPago: precoConfirmado, 
                fornecedorId: fornecedorId,
                responsavelId: userId,
                lojaId: lojaId,
              },
            });

            
            if (quantidadeParaLoja > 0) {
              await prismaTx.historicoPreco.create({
                data: {
                  produtoId: produtoId,
                  preco: precoUnitarioReal,
                  data: new Date(),
                },
              });
            }
          }
          
          else if (
            newStatus !== EstadoEntrada.CONFIRMADO &&
            oldStatus === EstadoEntrada.CONFIRMADO
          ) {
            const estoqueLoja = await prismaTx.estoqueLoja.findUnique({
              where: {
                produtoId_lojaId: {
                  produtoId: produtoId,
                  lojaId: lojaId,
                },
              },
            });

            if (estoqueLoja) {
              await prismaTx.estoqueLoja.update({
                where: { id: estoqueLoja.id },
                data: {
                  quantidadeEst: {
                    decrement: Math.min(
                      estoqueLoja.quantidadeEst,
                      quantidadeParaLoja,
                    ),
                  },
                },
              });
            }

            
            await prismaTx.saida.create({
              data: {
                produtoId: produtoId,
                quantidade: quantidadeParaLoja,
                responsavelId: userId,
                lojaId: lojaId,
                motivo: `Reversão de Recebimento: Status da Distribuição ID ${distribuicaoId} alterado para ${newStatus}.`,
              },
            });
          }

          return [updatedDistribuicao];
        },
      );

      return updatedDistribuicao;
    } catch (error) {
      console.error('Erro ao atualizar recebimento:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Erro ao encontrar registo relacionado durante a transação.`,
          );
        }
      }
      throw new BadRequestException('Não foi possível atualizar o recebimento.');
    }
  }
}