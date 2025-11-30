import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuariosDbService } from '../prisma/usuarios-db.service';


const JWT_SECRET = process.env.JWT_SECRET;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usuariosDb: UsuariosDbService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.usuariosDb.usuario.findUnique({
        where: { id: payload.sub } // payload.sub geralmente é o ID do usuário
    });
    if (!user) {
        throw new UnauthorizedException();
    }
    return { 
        id: payload.sub, 
        login: payload.username,
        nome: payload.nome,
        lojaId: payload.lojaId,
        funcoes: payload.funcoes
    };
  }
}