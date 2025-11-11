
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(AuthGuard('jwt')) 
  @Get('stats')
  async getStats(@Request() req) {
    const userId = req.user.sub;
    return this.dashboardService.getDashboardStats(userId);
  }
}