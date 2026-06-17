import { Injectable } from '@nestjs/common';
import { refresh_token } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    rut_usuario: string;
    token_hash: string;
    token_id: string;
    expires_at: Date;
  }): Promise<refresh_token> {
    return this.prisma.refresh_token.create({ data });
  }

  findByHash(token_hash: string): Promise<refresh_token | null> {
    return this.prisma.refresh_token.findUnique({ where: { token_hash } });
  }

  async revokeByHash(token_hash: string): Promise<void> {
    await this.prisma.refresh_token.updateMany({
      where: { token_hash },
      data: { revoked: true },
    });
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.refresh_token.deleteMany({
      where: { expires_at: { lt: new Date() } },
    });
  }

  async deleteAll(): Promise<void> {
    await this.prisma.refresh_token.deleteMany({});
  }
}
