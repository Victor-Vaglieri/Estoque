// src/auth/auth.service.ts

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

  async login(login: string, pass: string): Promise<{ token: string }> {
    const user = await this.usuariosDb.usuario.findUnique({
      where: { login },
    });

    if (!user) {
      throw new UnauthorizedException('Login ou senha inválidos.');
    }
    const isPasswordMatching = await bcrypt.compare(pass, user.senha);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Login ou senha inválidos.');
    }

    const funcoes = await this.usuariosDb.usuarioFuncao.findMany({
      where: { usuarioId: user.id },
      select: { funcao: true },
    }).then(results => results.map(r => r.funcao as string));
    const payload = { sub: user.id, username: user.login, funcoes: funcoes };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }
}