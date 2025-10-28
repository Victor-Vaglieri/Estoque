import { Controller, Get, UseGuards, Request, Res, Header } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';
// --- CORREÇÃO AQUI: Usar 'import type' ---
import { type Response } from 'express'; // Importa apenas o tipo Response

@Controller('relatorios')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    @UseGuards(AuthGuard('jwt'))
    @Get('overview')
    async getOverview(@Request() req) {
        const userId = req.user.sub;
        return this.reportsService.getOverview(userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('stock-value')
    async getStockValueData(@Request() req) {
        const userId = req.user.sub;
        return this.reportsService.getStockValueData(userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('purchase-history')
    async getPurchaseHistoryData(@Request() req) {
        const userId = req.user.sub;
        return this.reportsService.getPurchaseHistoryData(userId);
    }

    // --- Endpoints para XLSX ---

    @UseGuards(AuthGuard('jwt'))
    @Get('inventario/xlsx')
    @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    @Header('Content-Disposition', `attachment; filename="inventario_${new Date().toISOString().split('T')[0]}.xlsx"`)
    // Usa o tipo Response importado com 'import type'
    async downloadInventoryXlsx(@Request() req, @Res() res: Response) { 
        const userId = req.user.sub;
        try {
            const buffer = await this.reportsService.generateInventoryXlsx(userId);
            res.send(buffer); 
        } catch (error) {
             res.status(error.status || 500).json({
                 message: error.message || 'Erro interno ao gerar o relatório.',
                 statusCode: error.status || 500,
             });
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('compras/xlsx')
    @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    @Header('Content-Disposition', `attachment; filename="historico_compras_${new Date().toISOString().split('T')[0]}.xlsx"`)
     // Usa o tipo Response importado com 'import type'
    async downloadComprasXlsx(@Request() req, @Res() res: Response) {
        const userId = req.user.sub;
         try {
            const buffer = await this.reportsService.generateComprasXlsx(userId);
            res.send(buffer);
        } catch (error) {
             res.status(error.status || 500).json({
                 message: error.message || 'Erro interno ao gerar o relatório.',
                 statusCode: error.status || 500,
             });
        }
    }
}

