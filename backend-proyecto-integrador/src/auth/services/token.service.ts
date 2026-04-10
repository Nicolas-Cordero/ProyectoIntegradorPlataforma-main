import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../users/entities/user.entity';
import { randomUUID } from 'crypto';
import { JwtPayload, JwtRefreshPayload, StoredRefreshToken } from '../interfaces/auth.interfaces';
import { TokensResponseDto } from '../dto/auth-response.dto';

@Injectable()
export class TokenService {
  // En producción, migrar a Redis o base de datos
  private readonly refreshTokens = new Map<string, StoredRefreshToken>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(user: User): Promise<TokensResponseDto> {
    const tokenId = randomUUID();

    const accessPayload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      rol: user.rol,
    };

    const refreshPayload: JwtRefreshPayload = {
      ...accessPayload,
      tokenId,
    };

    const accessToken = this.jwtService.sign(accessPayload as any, {
      secret: this.configService.get<string>('jwt.access.secret'),
      expiresIn: this.configService.get<string>('jwt.access.expiresIn'),
    } as any);

    const refreshToken = this.jwtService.sign(refreshPayload as any, {
      secret: this.configService.get<string>('jwt.refresh.secret'),
      expiresIn: this.configService.get<string>('jwt.refresh.expiresIn'),
    } as any);

    // Almacenar el refresh token
    this.storeRefreshToken(refreshToken, user.id, tokenId);

    return { accessToken, refreshToken };
  }

  verifyRefreshToken(token: string): JwtRefreshPayload {
    return this.jwtService.verify<JwtRefreshPayload>(token, {
      secret: this.configService.get<string>('jwt.refresh.secret'),
    });
  }

  storeRefreshToken(token: string, userId: string, tokenId: string): void {
    this.refreshTokens.set(token, { userId, tokenId });
  }

  getStoredRefreshToken(token: string): StoredRefreshToken | undefined {
    return this.refreshTokens.get(token);
  }

  invalidateRefreshToken(token: string): void {
    this.refreshTokens.delete(token);
  }

  cleanExpiredTokens(): void {
    for (const [token] of this.refreshTokens.entries()) {
      try {
        this.verifyRefreshToken(token);
      } catch {
        this.refreshTokens.delete(token);
      }
    }
  }

  //Para testing
  clearAllTokens(): void {
    this.refreshTokens.clear();
  }
}
