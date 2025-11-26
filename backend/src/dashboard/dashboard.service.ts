import { Injectable } from '@nestjs/common';
import { EstoqueDbService } from '../prisma/estoque-db.service';
import { Prisma, EstadoEntrada } from '@prisma/estoque-client';

@Injectable()
export class DashboardService {
  constructor(private estoqueDb: EstoqueDbService) {}

  async getStats(lojaId: number) {
    const rawResult: { count: number }[] = await this.estoqueDb.$queryRaw`
        SELECT COUNT(*)::int as count
        FROM estoque."EstoqueLoja" AS E
        JOIN estoque."Produto" AS P ON E."produtoId" = P."id"
        WHERE E."lojaId" = ${lojaId}
          AND P."ativo" = true
          AND E."quantidadeEst" < P."quantidadeMin"
      `;

    const itensAbaixoMin = Number(rawResult[0]?.count || 0);
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); 
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1); 

    const saidasHoje = await this.estoqueDb.saida.aggregate({
      _sum: {
        quantidade: true,
      },
      where: {
        lojaId: lojaId,
        data: {
          gte: hoje,
          lt: amanha,
        },
      },
    });

    const comprasPendentes = await this.estoqueDb.compraDistribuicao.count({
      where: {
        lojaId: lojaId,
        confirmadoEntrada: {
          in: [EstadoEntrada.PENDENTE, EstadoEntrada.FALTANTE],
        },
      },
    });

    const ultimaEntrada = await this.estoqueDb.entrada.findFirst({
      where: {
        lojaId: lojaId,
      },
      orderBy: {
        data: 'desc',
      },
      include: {
        produto: {
          select: { nome: true },
        },
      },
    });

    return {
      quantidade_itens_abaixo_min: itensAbaixoMin,
      quantidade_saida: saidasHoje._sum.quantidade || 0,
      historico_compra_pendente: comprasPendentes,
      nome_ultimo_produto_chego: ultimaEntrada?.produto.nome || 'Nenhum',
    };
  }
}