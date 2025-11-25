import {
    Controller,
    Get,
    UseGuards,
    Req,
    ForbiddenException,
    Res,
    Query,
    StreamableFile,
    BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RelatoriosService } from './reports.service';
import type { Response } from 'express';
import { Funcao } from '@prisma/usuarios-client';
import { StockValueByLoja, PurchaseHistory } from './dto/relatorios.dto';


type AuthUser = {
    id: number;
    lojaId: number;
    funcoes: Funcao[];
};

@UseGuards(AuthGuard('jwt'))
@Controller('relatorios')
export class RelatoriosController {
    constructor(private readonly relatoriosService: RelatoriosService) { }


    private checkGestor(user: AuthUser) {
        if (!user.funcoes.includes(Funcao.GESTOR)) {
            throw new ForbiddenException('Acesso negado. Apenas Gestores.');
        }
    }


    @Get('overview')
    getOverview(@Req() req) {
        const authUser = req.user as AuthUser;
        if (!authUser?.lojaId) {
            throw new ForbiddenException('Usuário não associado a uma loja.');
        }

        return this.relatoriosService.getOverview(authUser.lojaId);
    }


    @Get('stock-value-by-loja')
    getStockValueByLoja(@Req() req): Promise<StockValueByLoja[]> {
        this.checkGestor(req.user as AuthUser);
        return this.relatoriosService.getStockValueByLoja();
    }


    @Get('purchase-history')
    getPurchaseHistory(@Req() req): Promise<PurchaseHistory[]> {
        this.checkGestor(req.user as AuthUser);
        return this.relatoriosService.getPurchaseHistory();
    }

    @Get('export/controle')
    async exportControle(
        @Req() req,
        @Res({ passthrough: true }) res: Response,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        this.checkGestor(req.user as AuthUser);
        if (!startDate || !endDate) {
            throw new BadRequestException('Data de início e fim são obrigatórias.');
        }

        const fileBuffer = await this.relatoriosService.exportControle(
            new Date(startDate),
            new Date(endDate),
        );

        const fileName = `controle_${startDate}_a_${endDate}.xlsx`;
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${fileName}"`,
        );
        return new StreamableFile(fileBuffer);
    }


    @Get('export/fornecedores')
    async exportFornecedores(
        @Req() req,
        @Res({ passthrough: true }) res: Response,
    ) {
        this.checkGestor(req.user as AuthUser);

        const fileBuffer = await this.relatoriosService.exportFornecedores();
        const fileName = `estoque_por_fornecedor_${new Date().toISOString().split('T')[0]}.xlsx`;

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${fileName}"`,
        );
        return new StreamableFile(fileBuffer);
    }

    @Get('debug-db')
    async debugDatabase() {
        // Busca TUDO sem filtro de data para ver se existe algo
        const tudo = await this.relatoriosService['controleDb'].costuraRegistro.findMany({
            take: 5,
        });

        return {
            mensagem: "Teste de conexão direta",
            quantidade: tudo.length,
            amostra: tudo.map(item => ({
                id: item.id,
                cliente: item.nome_cliente,
                data_recebimento: item.data_recebimento, // Vamos ver como isso sai
                tipo_data: typeof item.data_recebimento
            }))
        };
    }
}