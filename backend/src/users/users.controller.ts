import {
  Controller,
  Patch,
  Body,
  Request,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateLoginDto } from './dto/update-login.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Rota para atualizar o login do usuário autenticado.
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch('me/login')
  async updateLogin(
    @Request() req,
    @Body() updateLoginDto: UpdateLoginDto,
  ) {
    const userId = req.user;
    if (!userId) {
      throw new UnauthorizedException('Usuário não encontrado no token.');
    }
    return this.usersService.updateLogin(req.user.id, updateLoginDto.login);
  }

  /**
   * Rota para atualizar a senha do usuário autenticado.
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch('me/password')
  async updatePassword(
    @Request() req,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    const userId = req.user;
    if (!userId) {
      throw new UnauthorizedException('Usuário não encontrado no token.');
    }
    return this.usersService.updatePassword(req.user.id, updatePasswordDto);
  }
}
