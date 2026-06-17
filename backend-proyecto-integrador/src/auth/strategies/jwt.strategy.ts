import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
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
      // Acepta el token desde la cookie HTTP-only (web) o desde el header
      // Authorization: Bearer (app móvil).
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.access_token ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.access.secret')!,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {

    const user = await this.userRepo.findByRut(payload.sub);

    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGES.UNAUTHORIZED_USER);
    }

    if (!user.activo) {
      throw new UnauthorizedException(AUTH_MESSAGES.USER_INACTIVE);
    }

    return {
      rut_usuario: user.rut_usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono,
      rol: user.rol,
      activo: user.activo,
      must_change_password: user.must_change_password,
    };
  }
}
