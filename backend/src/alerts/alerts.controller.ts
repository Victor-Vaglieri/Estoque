// src/alerts/alerts.controller.ts

import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AlertsService } from './alerts.service';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('')
  async getStats(@Request() req) {
    const userId = req.user.sub;
    return this.alertsService.getAlerts(userId);
  }
}