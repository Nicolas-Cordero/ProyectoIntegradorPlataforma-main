import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { usuario } from '@prisma/client'
import { randomUUID } from 'crypto';
import { JwtPayload, JwtRefreshPayload, StoredRefreshToken } from '../interfaces/auth.interfaces';
import { TokensResponseDto } from '../dto/auth-response.dto';



//TODO: revisar este script
//TODO: refactorizar magic strings

const CLEAN_EXPIRED_TOKENS_INTERVAL_MS = 60 * 60 * 1000; // 1 hora

@Injectable()
export class TokenService implements OnModuleInit, OnModuleDestroy {


  // En producción, migrar a Redis o base de datos!!!!!
  private readonly refreshTokens = new Map<string, StoredRefreshToken>();
  private cleanupInterval?: NodeJS.Timeout;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit(): void {
    this.cleanupInterval = setInterval(
      () => this.cleanExpiredTokens(),
      CLEAN_EXPIRED_TOKENS_INTERVAL_MS,
    );
  }

  onModuleDestroy(): void {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
  }




  async generateTokens(user: usuario): Promise<TokensResponseDto> {
    const tokenId = randomUUID();

    const accessPayload: JwtPayload = {
      sub: user.rut_usuario,
      rol: user.rol,
    };

    const refreshPayload: JwtRefreshPayload = {
      ...accessPayload,
      tokenId,
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.get<string>('jwt.access.secret')!,
      expiresIn: this.configService.get<string>('jwt.access.expiresIn') as unknown as JwtSignOptions['expiresIn'],
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>('jwt.refresh.secret')!,
      expiresIn: this.configService.get<string>('jwt.refresh.expiresIn') as unknown as JwtSignOptions['expiresIn'],
    });

    // Almacenar el refresh token
    this.storeRefreshToken(refreshToken, user.rut_usuario, tokenId);

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
