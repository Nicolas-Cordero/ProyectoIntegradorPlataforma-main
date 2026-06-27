import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UserRol } from '@prisma/client';
import { randomUUID, createHash } from 'crypto';
import { JwtPayload, JwtRefreshPayload, StoredRefreshToken } from '../interfaces/auth.interfaces';
import { TokensResponseDto } from '../dto/auth-response.dto';
import { RefreshTokenRepository } from './refresh-token.repository';

const CLEAN_EXPIRED_TOKENS_INTERVAL_MS = 60 * 60 * 1000; // 1 hora
const DEFAULT_REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

@Injectable()
export class TokenService implements OnModuleInit, OnModuleDestroy {

  // Los refresh tokens se persisten en la BD (tabla refresh_token), guardando solo
  // su hash. Sobrevive reinicios y permite revocación real (logout / rotación).
  private cleanupInterval?: NodeJS.Timeout;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshRepo: RefreshTokenRepository,
  ) {}

  onModuleInit(): void {
    this.cleanupInterval = setInterval(
      () => { void this.cleanExpiredTokens(); },
      CLEAN_EXPIRED_TOKENS_INTERVAL_MS,
    );
  }

  onModuleDestroy(): void {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
  }




  async generateTokens(user: { rut_usuario: string; rol: UserRol }, client: 'web' | 'mobile' = 'web'): Promise<TokensResponseDto> {
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

    const refreshExpiresIn = client === 'mobile'
      ? this.configService.get<string>('jwt.refresh.expiresInMobile')!
      : this.configService.get<string>('jwt.refresh.expiresIn')!;

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>('jwt.refresh.secret')!,
      expiresIn: refreshExpiresIn as unknown as JwtSignOptions['expiresIn'],
    });

    // Persistir el refresh token (su hash) en la BD
    await this.storeRefreshToken(refreshToken, user.rut_usuario, tokenId);

    return { accessToken, refreshToken };
  }



  verifyRefreshToken(token: string): JwtRefreshPayload {
    return this.jwtService.verify<JwtRefreshPayload>(token, {
      secret: this.configService.get<string>('jwt.refresh.secret'),
    });
  }



  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }



  async storeRefreshToken(token: string, userId: string, tokenId: string): Promise<void> {
    const decoded = this.jwtService.decode(token) as { exp?: number } | null;
    const expiresAt = decoded?.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + DEFAULT_REFRESH_TTL_MS);

    await this.refreshRepo.create({
      rut_usuario: userId,
      token_hash: this.hashToken(token),
      token_id: tokenId,
      expires_at: expiresAt,
    });
  }



  async getStoredRefreshToken(token: string): Promise<StoredRefreshToken | undefined> {
    const row = await this.refreshRepo.findByHash(this.hashToken(token));
    if (!row || row.revoked) return undefined;
    return { userId: row.rut_usuario, tokenId: row.token_id };
  }



  async invalidateRefreshToken(token: string): Promise<void> {
    await this.refreshRepo.revokeByHash(this.hashToken(token));
  }




  async cleanExpiredTokens(): Promise<void> {
    await this.refreshRepo.deleteExpired();
  }

  // Para testing
  async clearAllTokens(): Promise<void> {
    await this.refreshRepo.deleteAll();
  }
}
