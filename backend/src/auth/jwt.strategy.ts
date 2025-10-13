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

  // Esta função é chamada pelo Passport após ele validar o token com a secret
  async validate(payload: { sub: number; username: string; funcoes: string[] }) {
    // Aqui você pode fazer uma verificação extra, como ver se o usuário ainda existe
    const user = await this.usuariosDb.usuario.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário do token não encontrado.');
    }

    // O que for retornado aqui será injetado no objeto 'req.user' nos seus controllers
    return { sub: payload.sub, login: payload.username, funcoes: payload.funcoes };
  }
}