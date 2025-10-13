// src/dashboard/dashboard.controller.ts

import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

@Controller('dashboard') // Define a rota base como /dashboard
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(AuthGuard('jwt')) // Protege esta rota! Só acessa com token válido.
  @Get('stats') // Define a rota completa como GET /dashboard/stats
  async getStats(@Request() req) {
    // O 'req.user' é adicionado pelo AuthGuard e contém o payload do token
    const userId = req.user.sub; // 'sub' é o ID do usuário que definimos no payload
    
    // Chama o serviço para buscar os dados, passando o ID do usuário
    return this.dashboardService.getDashboardStats(userId);
  }
}