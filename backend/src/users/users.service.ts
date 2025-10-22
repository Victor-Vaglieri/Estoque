import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsuariosDbService } from 'src/prisma/usuarios-db.service'; // Ajuste o caminho para o seu serviço Prisma
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: UsuariosDbService) {}

  /**
   * Atualiza o login (nome de usuário) do usuário.
   */
  async updateLogin(userId: number, newLogin: string) {
    try {
      await this.prisma.usuario.update({
        where: { id: userId },
        data: { login: newLogin },
      });
      return { message: 'Login atualizado com sucesso' };
    } catch (error) {
      // Trata caso o login já exista (exemplo de código de erro do Prisma)
      if (error.code === 'P2002') {
        throw new UnauthorizedException('Este login já está em uso.');
      }
      throw error;
    }
  }

  /**
   * Atualiza a senha do usuário após verificar a senha atual.
   */
  async updatePassword(userId: number, dto: UpdatePasswordDto) {
    // 1. Encontrar o usuário no banco de dados
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    // 2. Comparar a senha atual enviada com a senha hashada no banco
    //    !! Assumindo que seu campo de senha no schema.prisma se chama 'passwordHash' ou 'senha' !!
    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.senha, // <-- AJUSTE AQUI se o nome do campo for diferente (ex: user.senha)
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('A senha atual está incorreta.');
    }

    // 3. Hashar a nova senha
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10); // 10 é o custo (salt rounds)

    // 4. Salvar a nova senha no banco
    await this.prisma.usuario.update({
      where: { id: userId },
      data: {
        senha: newPasswordHash, // <-- AJUSTE AQUI também
      },
    });

    return { message: 'Senha atualizada com sucesso' };
  }
}
