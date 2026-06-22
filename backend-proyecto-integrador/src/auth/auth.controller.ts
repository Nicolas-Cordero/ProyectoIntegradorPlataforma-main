import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/create-auth.dto';
import {
  RequestPasswordResetDto,
  VerifyResetCodeDto,
  ResetPasswordDto,
} from './dto/password-reset.dto';
import {
  LogoutResponseDto,
  ValidateTokenResponseDto,
  UserResponseDto,
  AuthBodyResponseDto,
} from './dto/auth-response.dto';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { UserRol } from '@prisma/client';
import type { AuthenticatedUser } from './interfaces/auth.interfaces';




@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private get cookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict' as const,
    };
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    // access token: 15 min de expiración coherente con jwt.config.ts
    res.cookie('access_token', accessToken, {
      ...this.cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
    // refresh token: 7 días
    res.cookie('refresh_token', refreshToken, {
      ...this.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }




  /**
   * Registra un nuevo usuario
   * @param registerDto Datos del usuario a registrar
   * @returns Usuario creado con tokens JWT
   * LISTO
   */
  @Post('register')
  @Roles(UserRol.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponseDto> {
    const { accessToken, refreshToken, user } = await this.authService.register(registerDto);
    this.setAuthCookies(res, accessToken, refreshToken);
    return user;
  }


  

  /**
   * Inicia sesión con credenciales
   * @param loginDto Credenciales del usuario
   * @returns Usuario autenticado con tokens JWT
   * LISTO
   */
  @Post('login')
  @Public()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthBodyResponseDto> {
    const { accessToken, refreshToken, user } = await this.authService.login(loginDto);
    this.setAuthCookies(res, accessToken, refreshToken);
    // La web usa la cookie; el móvil usa estos tokens del body.
    return { ...user, accessToken, refreshToken };
  }



  /**
   * Refresca el token de acceso
   * @param  RefreshTokenDto token de refresco
   * @returns TokensResponseDto token de acceso regenerado
   * LISTO
   */
  @Post('refresh')
  @Public()
  @Throttle({ default: { ttl: 60000, limit: 20 } })
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; accessToken: string; refreshToken: string }> {
    // Web: refresh desde cookie. Móvil: refresh desde el body.
    const refreshToken = req.cookies?.refresh_token ?? req.body?.refreshToken;
    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshAccessToken(refreshToken);
    this.setAuthCookies(res, accessToken, newRefreshToken);
    return { message: 'Token renovado', accessToken, refreshToken: newRefreshToken };
  }



  /**
   * Deslogea al usuario
   * @param  RefreshTokenDto token de refresco
   * @returns LogoutResponseDto Respuesta de logout exitoso o no
   * 
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponseDto> {
    const refreshToken = req.cookies?.refresh_token ?? req.body?.refreshToken;
    const result = await this.authService.logout(refreshToken);
    res.clearCookie('access_token', this.cookieOptions);
    res.clearCookie('refresh_token', this.cookieOptions);
    return result;
  }
  




  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: AuthenticatedUser): Promise<UserResponseDto> {
    return {
      rut_usuario: user.rut_usuario,
      email: user.email,
      telefono: user.telefono,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
      activo: user.activo,
      must_change_password: user.must_change_password,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: AuthenticatedUser): Promise<UserResponseDto> {
    return {
      rut_usuario: user.rut_usuario,
      email: user.email,
      telefono: user.telefono,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
      activo: user.activo,
      must_change_password: user.must_change_password,
    };
  }


  @Get('validate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async validateToken(@CurrentUser() user: AuthenticatedUser): Promise<ValidateTokenResponseDto> {
    return {
      valid: true,
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






  
  // ════════════════════════════════════════════════════════════════════════════
  // ENDPOINTS DE RECUPERACIÓN DE CONTRASEÑA
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Solicita recuperación de contraseña
   * Envía un código de 6 dígitos al email del usuario
   * @param dto Email del usuario
   * @returns Mensaje de confirmación
   */
  @Post('forgot-password')
  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() dto: RequestPasswordResetDto,
  ): Promise<{ message: string }> {
    await this.authService.requestPasswordReset(dto.email);
    return {
      message: 'Si el email existe en nuestro sistema, recibirás un código de recuperación',
    };
  }





  /**REVISAR FRONT, EN UNA DE ESAS ES INNECESARIA   <------------------------------------------
   * Verifica si un código de recuperación es válido
   * @param dto Email y código del usuario
   * @returns Indica si el código es válido
   */
  @Post('verify-reset-code')
  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  async verifyResetCode(
    @Body() dto: VerifyResetCodeDto,
  ): Promise<{ valid: boolean }> {
    const valid = await this.authService.verifyResetCode(dto.email, dto.code);
    return { valid };
  }

  /**
   * Restablece la contraseña del usuario
   * @param dto Email, código y nueva contraseña
   * @returns Mensaje de confirmación
   */
  @Post('reset-password')
  @Public()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
    return {
      message: 'Contraseña actualizada exitosamente',
    };
  }
}
