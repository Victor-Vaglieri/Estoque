// src/alerts/alerts.controller.ts

import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AlertsService } from './alerts.service';

@Controller('alerts') // Define a rota base como /alerts
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @UseGuards(AuthGuard('jwt')) // Protege esta rota! Só acessa com token válido.
  @Get('') // Rota GET /dashboard
  async getStats(@Request() req) {
    // O 'req.user' é adicionado pelo AuthGuard e contém o payload do token
    const userId = req.user.sub; // 'sub' é o ID do usuário que definimos no payload
    
    // Chama o serviço para buscar os dados, passando o ID do usuário
    return this.alertsService.getAlerts(userId);
  }
}