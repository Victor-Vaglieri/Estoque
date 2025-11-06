import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsuariosDbService } from '../prisma/usuarios-db.service'; // Ajuste o caminho para o seu serviço Prisma
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: UsuariosDbService) {}

  async updateLogin(userId: number, newLogin: string) {
    try {
      await this.prisma.usuario.update({
        where: { id: userId },
        data: { login: newLogin },
      });
      return { message: 'Login atualizado com sucesso' };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new UnauthorizedException('Este login já está em uso.');
      }
      throw error;
    }
  }

  async updatePassword(userId: number, dto: UpdatePasswordDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.senha,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('A senha atual está incorreta.');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.usuario.update({
      where: { id: userId },
      data: {
        senha: newPasswordHash,
      },
    });

    return { message: 'Senha atualizada com sucesso' };
  }
}
