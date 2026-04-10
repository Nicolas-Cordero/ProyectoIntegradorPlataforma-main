import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { LoginDto, RegisterDto } from './dto/create-auth.dto';
import { AuthResponseDto, TokensResponseDto, LogoutResponseDto } from './dto/auth-response.dto';
import { TokenService } from './services/token.service';
import { EmailService } from './services/email.service';
import { AUTH_MESSAGES } from './constants/auth.constants';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
  ) {}


  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {

    const existingUsername = await this.usersRepository.findOne({
      where: { username: registerDto.username },
    });
    if (existingUsername) {
      throw new ConflictException(AUTH_MESSAGES.USERNAME_ALREADY_EXISTS);
    }

    const existingEmail = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingEmail) {
      throw new ConflictException(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = this.usersRepository.create({
      username: registerDto.username,
      email: registerDto.email,
      password: hashedPassword,
      nombre: registerDto.nombre,
      apellido: registerDto.apellido,
      rol: registerDto.rol || UserRole.VISITA,
      activo: true,
    });

    const savedUser = await this.usersRepository.save(newUser);

    await this.updateLastLogin(savedUser.id);

    const tokens = await this.tokenService.generateTokens(savedUser);

    return {
      ...tokens,
      user: {
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
        nombre: savedUser.nombre,
        apellido: savedUser.apellido,
        rol: savedUser.rol,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateCredentials(loginDto);
    await this.updateLastLogin(user.id);
    const tokens = await this.tokenService.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
      },
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<TokensResponseDto> {
    try {
      const payload = this.tokenService.verifyRefreshToken(refreshToken);
      const storedToken = this.tokenService.getStoredRefreshToken(refreshToken);

      this.validateStoredToken(storedToken, payload);

      const user = await this.findActiveUser(payload.sub);

      this.tokenService.invalidateRefreshToken(refreshToken);

      return this.tokenService.generateTokens(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(AUTH_MESSAGES.EXPIRED_REFRESH_TOKEN);
    }
  }

  async logout(refreshToken: string): Promise<LogoutResponseDto> {
    this.tokenService.invalidateRefreshToken(refreshToken);
    return { message: AUTH_MESSAGES.LOGOUT_SUCCESS };
  }

  cleanExpiredTokens(): void {
    this.tokenService.cleanExpiredTokens();
  }

  // Private helper methods
  private async validateCredentials(loginDto: LoginDto): Promise<User> {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({
      where: { email },
    });

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

  private async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      ultimo_login: new Date(),
    });
  }

  private async findActiveUser(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId, activo: true },
    });

    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }

  private validateStoredToken(
    storedToken: { userId: string; tokenId: string } | undefined,
    payload: { sub: string; tokenId: string },
  ): void {
    if (
      !storedToken ||
      storedToken.userId !== payload.sub ||
      storedToken.tokenId !== payload.tokenId
    ) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MÉTODOS DE RECUPERACIÓN DE CONTRASEÑA
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Genera un código aleatorio de 6 dígitos
   * @returns Código de 6 dígitos
   */
  private generateResetCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Solicita recuperación de contraseña
   * Genera un código y lo envía por email
   * @param email Email del usuario
   */
  async requestPasswordReset(email: string): Promise<void> {
    // Buscar usuario por email
    const user = await this.usersRepository.findOne({ 
      where: { email } 
    });

    // Por seguridad, no revelamos si el email existe o no
    // Siempre retornamos éxito para evitar enumeración de usuarios
    if (!user) {
      // Simulamos un delay para que no se pueda distinguir
      await new Promise(resolve => setTimeout(resolve, 1000));
      return;
    }

    // Verificar que el usuario esté activo
    if (!user.activo) {
      // Tampoco revelamos que el usuario está inactivo
      await new Promise(resolve => setTimeout(resolve, 1000));
      return;
    }

    // Generar código de 6 dígitos
    const resetCode = this.generateResetCode();

    // Calcular fecha de expiración (15 minutos por defecto)
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 15);

    // Guardar código y fecha de expiración en la base de datos
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = expirationDate;
    await this.usersRepository.save(user);

    // Enviar email con el código
    try {
      await this.emailService.sendPasswordResetEmail(email, resetCode);
    } catch (error) {
      // Si falla el envío del email, limpiar el código
      user.resetPasswordCode = null;
      user.resetPasswordExpires = null;
      await this.usersRepository.save(user);
      
      throw new BadRequestException(
        'No se pudo enviar el email de recuperación. ' +
        'Por favor, verifica tu dirección de email e intenta nuevamente.'
      );
    }
  }

  /**
   * Verifica si un código de recuperación es válido
   * @param email Email del usuario
   * @param code Código de verificación
   * @returns true si el código es válido, false en caso contrario
   */
  async verifyResetCode(email: string, code: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ 
      where: { email } 
    });

    // Si no existe el usuario o no tiene código, retornar false
    if (!user || !user.resetPasswordCode || !user.resetPasswordExpires) {
      return false;
    }

    // Verificar si el código expiró
    const now = new Date();
    if (now > user.resetPasswordExpires) {
      // Limpiar código expirado
      user.resetPasswordCode = null;
      user.resetPasswordExpires = null;
      await this.usersRepository.save(user);
      return false;
    }

    // Verificar si el código coincide
    const isValid = user.resetPasswordCode === code;

    return isValid;
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
    // Buscar usuario
    const user = await this.usersRepository.findOne({ 
      where: { email } 
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que el usuario esté activo
    if (!user.activo) {
      throw new BadRequestException('El usuario no está activo');
    }

    // Verificar que exista un código de reset
    if (!user.resetPasswordCode || !user.resetPasswordExpires) {
      throw new BadRequestException(
        'No hay una solicitud de recuperación de contraseña activa. ' +
        'Por favor, solicita un nuevo código.'
      );
    }

    // Verificar si el código expiró
    const now = new Date();
    if (now > user.resetPasswordExpires) {
      // Limpiar código expirado
      user.resetPasswordCode = null;
      user.resetPasswordExpires = null;
      await this.usersRepository.save(user);
      
      throw new BadRequestException(
        'El código de recuperación ha expirado. ' +
        'Por favor, solicita un nuevo código.'
      );
    }

    // Verificar si el código coincide
    if (user.resetPasswordCode !== code) {
      throw new BadRequestException(
        'El código de verificación es inválido'
      );
    }

    // Validar que la nueva contraseña no sea igual a la anterior
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException(
        'La nueva contraseña no puede ser igual a la anterior'
      );
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña y limpiar código de reset
    user.password = hashedPassword;
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    
    // Invalidar refresh tokens existentes por seguridad
    user.refreshToken = null;
    
    await this.usersRepository.save(user);

    // Enviar email de notificación (opcional, no falla si hay error)
    try {
      await this.emailService.sendPasswordChangedNotification(email);
    } catch (error) {
      // Log el error pero no fallar el proceso
      console.error('Error al enviar notificación de cambio de contraseña:', error);
    }
  }
}
