// src/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuariosDbService } from 'src/prisma/usuarios-db.service'; // Ajuste o caminho se necessário

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usuariosDb: UsuariosDbService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET, // ✅ GARANTIDO que usa o nome padrão
    });
  }

  async validate(payload: { sub: number; username: string; funcoes: string[] }) {
    const user = await this.usuariosDb.usuario.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário do token não encontrado.');
    }

    return { sub: payload.sub, login: payload.username, funcoes: payload.funcoes };
  }
}