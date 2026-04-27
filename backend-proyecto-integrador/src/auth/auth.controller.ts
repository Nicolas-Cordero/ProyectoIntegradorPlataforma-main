import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/create-auth.dto';
import {
  RequestPasswordResetDto,
  VerifyResetCodeDto,
  ResetPasswordDto,
} from './dto/password-reset.dto';
import {
  AuthResponseDto,
  TokensResponseDto,
  LogoutResponseDto,
  ValidateTokenResponseDto,
  UserResponseDto,
} from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './interfaces/auth.interfaces';




@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}




  /**
   * Registra un nuevo usuario
   * @param registerDto Datos del usuario a registrar
   * @returns Usuario creado con tokens JWT
   * LISTO
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }


  

  /**
   * Inicia sesión con credenciales
   * @param loginDto Credenciales del usuario
   * @returns Usuario autenticado con tokens JWT
   * LISTO
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }



  /**
   * Refresca el token de acceso
   * @param  RefreshTokenDto token de refresco
   * @returns TokensResponseDto token de acceso regenerado
   * LISTO
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokensResponseDto> {
    return this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
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
  async logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<LogoutResponseDto> {
    return this.authService.logout(refreshTokenDto.refreshToken);
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
