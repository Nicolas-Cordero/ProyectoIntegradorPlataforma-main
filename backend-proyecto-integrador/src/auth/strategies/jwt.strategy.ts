import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { usuario } from '@prisma/client';
import { JwtPayload, AuthenticatedUser } from '../interfaces/auth.interfaces';
import { AUTH_MESSAGES } from '../constants/auth.constants';
import { UsersRepository } from '../../users';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userRepo: UsersRepository,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.access.secret')!,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {

    const user = await this.userRepo.findByRut(payload.sub)

    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGES.UNAUTHORIZED_USER);
    }

    return {
      rut_usuario: user.rut_usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono,
      rol: user.rol,
    };
  }
}
