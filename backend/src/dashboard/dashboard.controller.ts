import {
  Controller,
  Get,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';


type AuthUser = {
  id: number;
  lojaId: number;
};

@UseGuards(AuthGuard('jwt'))
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  
  @Get('stats')
  getStats(@Req() req) {
    const authUser = req.user as AuthUser;
    if (!authUser?.lojaId) {
      throw new ForbiddenException('Usuário não associado a uma loja.');
    }
    return this.dashboardService.getStats(authUser.lojaId);
  }
}