import { Controller, Get, Post, Delete, Patch, Param, UseGuards, Request, ParseIntPipe, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PerfisService } from './cadasters.service';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto'; 
import { AprovarSolicitacaoDto } from './dto/aprove-user.dto';

@Controller('perfis')
@UseGuards(AuthGuard('jwt')) 
export class PerfisController {
    constructor(private readonly perfisService: PerfisService) {}

    // --- Rotas para Solicitações de Cadastro ---

    @Get('solicitacoes')
    async getSolicitacoes(@Request() req) {
        const userId = req.user.sub;
        return this.perfisService.getSolicitacoes(userId);
    }

    // --- NOVO ENDPOINT ---
    @Get('confirmados')
    async getSolicitacoesConfirmadas(@Request() req) {
        const userId = req.user.sub;
        return this.perfisService.getSolicitacoesConfirmadas(userId);
    }


    @Post('aprovar/:id')
    async aprovarSolicitacao(
        @Request() req, 
        @Param('id', ParseIntPipe) cadastroId: number,
        @Body() aprovarDto: AprovarSolicitacaoDto 
    ) {
        const userId = req.user.sub; 
        return this.perfisService.aprovarSolicitacao(userId, cadastroId, aprovarDto); 
    }

    @Delete('rejeitar/:id')
    async rejeitarSolicitacao(@Request() req, @Param('id', ParseIntPipe) cadastroId: number) {
        const userId = req.user.sub; 
        return this.perfisService.rejeitarSolicitacao(userId, cadastroId);
    }

    // --- Rotas para Utilizadores Atuais ---

    @Get('usuarios')
    async getUsuarios(@Request() req) {
         const userId = req.user.sub;
         return this.perfisService.getUsuarios(userId);
    }
    
    @Patch('usuario/:id')
    async updateUserRoles(
        @Request() req, 
        @Param('id', ParseIntPipe) targetUserId: number,
        @Body() updateUserRolesDto: UpdateUserRolesDto 
    ) {
        const adminId = req.user.sub;
        return this.perfisService.updateUserRoles(adminId, targetUserId, updateUserRolesDto);
    }
    
    @Delete('usuario/:id')
    async deleteUser(
        @Request() req, 
        @Param('id', ParseIntPipe) targetUserId: number
    ) {
        const adminId = req.user.sub;
        return this.perfisService.deleteUser(adminId, targetUserId);
    }
}

