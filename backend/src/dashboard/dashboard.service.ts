// src/dashboard/dashboard.service.ts

import { Injectable } from '@nestjs/common';
// 1. Importe o serviço correto que existe no seu módulo Prisma
import { EstoqueDbService } from '../prisma/estoque-db.service';
import { Prisma } from '@prisma/estoque-client'; // Importe o Prisma para ter acesso ao `Prisma.sql` se precisar 

@Injectable()
export class DashboardService {
    // 2. Peça pela injeção do EstoqueDbService.
    //    (Opcional, mas recomendado: renomeie a variável para clareza)
    constructor(private estoqueDb: EstoqueDbService) { }

    async getDashboardStats(userId: number) {
        // 1. 
        const query = Prisma.sql`
                SELECT COUNT(*) as count 
                FROM "Produto" 
                WHERE "quantidadeMin" < "quantidadeNec"
            `;

        const result: [{ count: bigint }] = await this.estoqueDb.$queryRaw(query);
        const quantidade_itens_abaixo_min = Number(result[0].count);

        // 2.
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // 2. Use essa data na sua consulta Prisma
        const quantidade_saida = await this.estoqueDb.saida.count({
            where: {
                responsavelId: userId,
                // Adicione esta condição para filtrar por data
                data: {
                    gte: sevenDaysAgo, // gte = Greater Than or Equal To (maior ou igual a)
                },
            },
        });

        // 3.
        const historico_compra_pendente = await this.estoqueDb.historicoCompra.count({
            where: {
                confirmadoEntrada: { in: ["PENDENTE", "FALTANTE"] }
            }
        });


        // 4.
        const ultimo_produto_chego = await this.estoqueDb.entrada.findFirst({
            orderBy: {
                data: 'desc',
            }, include: {
                produto: true,
            }
        });

        const nome_ultimo_produto_chego = ultimo_produto_chego?.produto.nome;
        return {
            quantidade_itens_abaixo_min,
            quantidade_saida,
            historico_compra_pendente,
            nome_ultimo_produto_chego,
        };
    }
}