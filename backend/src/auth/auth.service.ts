import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosDbService } from 'src/prisma/usuarios-db.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usuariosDb: UsuariosDbService,
    private jwtService: JwtService,
  ) {}

  async login(login: string, pass: string) {
    const user = await this.usuariosDb.usuario.findUnique({
      where: { login },
      include: { funcoes: true }, 
    });

    if (!user) {
      throw new UnauthorizedException('Login ou senha inválidos.');
    }

    const isPasswordMatching = await bcrypt.compare(pass, user.senha);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Login ou senha inválidos.');
    }

    if (!user.ativo) {
      throw new UnauthorizedException('Usuário inativo.');
    }

    const funcoes = user.funcoes.map((r) => r.funcao);

    const payload = {
      sub: user.id,
      username: user.login,
      nome: user.nome,
      lojaId: user.lojaId,
      funcoes: funcoes,
    };

    
    return {
      token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        nome: user.nome,
        lojaId: user.lojaId,
        funcoes: funcoes,
      }
    };
  }
}