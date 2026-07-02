import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/create-auth.dto';
import {
  AuthResponseDto,
  TokensResponseDto,
  LogoutResponseDto,
} from './dto/auth-response.dto';
import { TokenService } from './services/token.service';
import { AUTH_MESSAGES } from './constants/auth.constants';
import * as bcrypt from 'bcrypt';

import { UsersRepository } from '../users';
import { usuario } from '@prisma/client';
import { RecoveryService } from './services/recovery.service';
import { rutSinDV } from '../common/rut.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userRepo: UsersRepository,
    private readonly recovery: RecoveryService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateCredentials(loginDto);
    await this.updateLastLogin(user.rut_usuario);
    const tokens = await this.tokenService.generateTokens(
      user,
      loginDto.client ?? 'web',
    );

    return {
      ...tokens,
      user: {
        rut_usuario: user.rut_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono,
        rol: user.rol,
        activo: user.activo,
        must_change_password: user.must_change_password,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { rut, nombre, apellido, email, telefono, rol } = registerDto;

    const existingRut = await this.userRepo.findByRut(rut);
    if (existingRut) {
      throw new ConflictException(AUTH_MESSAGES.RUT_ALREADY_EXISTS);
    }

    const existingEmail = await this.userRepo.findByEmail(email);
    if (existingEmail) {
      throw new ConflictException(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    // Contraseña inicial unificada: el RUT sin dígito verificador, con cambio
    // forzado en el primer ingreso (must_change_password).
    const hashedPassword = await bcrypt.hash(rutSinDV(rut), 10);

    const savedUser = await this.userRepo.registerNewUser({
      rut_usuario: rut,
      email: email,
      telefono: telefono,
      password: hashedPassword,
      nombre: nombre,
      apellido: apellido,
      rol: rol,
      must_change_password: true,
    });

    const tokens = await this.tokenService.generateTokens(savedUser);

    return {
      ...tokens,
      user: {
        rut_usuario: savedUser.rut_usuario,
        nombre: savedUser.nombre,
        apellido: savedUser.apellido,
        email: savedUser.email,
        telefono: savedUser.telefono,
        rol: savedUser.rol,
        activo: savedUser.activo,
        must_change_password: savedUser.must_change_password,
      },
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<TokensResponseDto> {
    try {
      const payload = this.tokenService.verifyRefreshToken(refreshToken);
      const storedToken =
        await this.tokenService.getStoredRefreshToken(refreshToken);

      if (!storedToken) {
        // Token revocado, ya rotado o desconocido en la BD.
        throw new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
      }

      this.validateStoredToken(storedToken, payload);

      const user = await this.userRepo.findByRut(payload.sub);

      if (!user) {
        throw new Error('No existe ningun usuario asociado a dicho token');
      }

      await this.tokenService.invalidateRefreshToken(refreshToken);

      return this.tokenService.generateTokens(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(AUTH_MESSAGES.EXPIRED_REFRESH_TOKEN);
    }
  }

  async logout(refreshToken: string): Promise<LogoutResponseDto> {
    if (refreshToken) {
      await this.tokenService.invalidateRefreshToken(refreshToken);
    }
    return { message: AUTH_MESSAGES.LOGOUT_SUCCESS };
  }

  cleanExpiredTokens(): void {
    void this.tokenService.cleanExpiredTokens();
  }

  // Private helper methods
  private async validateCredentials(loginDto: LoginDto): Promise<usuario> {
    const { email, password } = loginDto;

    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    if (!user.activo) {
      throw new UnauthorizedException(AUTH_MESSAGES.USER_INACTIVE);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    return user;
  }

  private async updateLastLogin(rut_usuario: string): Promise<void> {
    await this.userRepo.updateLastLogin(rut_usuario);
    await this.userRepo.addLoginAuditLog(rut_usuario);
  }

  /* PARA QUE SIRVE ESTA FUNCIÓN?
  private async findActiveUser(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId, activo: true },
    });

    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }
*/

  private validateStoredToken(
    storedToken: { userId: string; tokenId: string } | undefined,
    payload: { sub: string; tokenId: string },
  ): void {
    // Si el token existe en el Map pero no coincide → posible replay attack → rechazar.
    // Si no está en el Map (ej. servidor reiniciado) → confiar en la firma del JWT.
    if (
      storedToken &&
      (storedToken.userId !== payload.sub ||
        storedToken.tokenId !== payload.tokenId)
    ) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MÉTODOS DE RECUPERACIÓN DE CONTRASEÑA
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Solicita recuperación de contraseña
   * Genera un código y lo envía por email
   * @param email Email del usuario
   */
  async requestPasswordReset(email: string): Promise<void> {
    await this.recovery.requestPasswordReset(email);
  }

  /**
   * Verifica si un código de recuperación es válido
   * @param email Email del usuario
   * @param code Código de verificación
   * @returns true si el código es válido, false en caso contrario
   */
  async verifyResetCode(email: string, code: string): Promise<boolean> {
    return this.recovery.verifyResetCode(email, code);
  }

  /**
   * Restablece la contraseña del usuario
   * @param email Email del usuario
   * @param code Código de verificación
   * @param newPassword Nueva contraseña
   */
  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    await this.recovery.resetPassword(email, code, newPassword);
  }
}
