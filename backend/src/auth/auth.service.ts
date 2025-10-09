// src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// 1. Importe o serviço correto para o banco de usuários
import { UsuariosDbService } from 'src/prisma/usuarios-db.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    // 2. Injete o serviço específico aqui
    private usuariosDb: UsuariosDbService,
    private jwtService: JwtService,
  ) {}

  async login(login: string, pass: string): Promise<{ access_token: string }> {
    // 3. Use o serviço de usuários para fazer a busca
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

    const payload = { sub: user.id, username: user.login };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}