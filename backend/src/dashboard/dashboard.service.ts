// src/dashboard/dashboard.service.ts

import { Injectable } from '@nestjs/common';
import { EstoqueDbService } from '../prisma/estoque-db.service';
import { Prisma } from '@prisma/estoque-client';

@Injectable()
export class DashboardService {
    constructor(private estoqueDb: EstoqueDbService) { }

    async getDashboardStats(userId: number) {
        const quantidade_itens_abaixo_min = await this.estoqueDb.produto.count({
        where: {
            quantidadeEst: {
                lt: this.estoqueDb.produto.fields.quantidadeMin 
            }
        }
    });
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const quantidade_saida = await this.estoqueDb.saida.count({
            where: {
                responsavelId: userId,
                data: {
                    gte: sevenDaysAgo,
                },
            },
        });

        const historico_compra_pendente = await this.estoqueDb.historicoCompra.count({
            where: {
                confirmadoEntrada: { in: ["PENDENTE", "FALTANTE"] }
            }
        });


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