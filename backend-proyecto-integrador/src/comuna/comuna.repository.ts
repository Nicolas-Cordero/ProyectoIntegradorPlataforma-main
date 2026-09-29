import { Injectable } from '@nestjs/common';
import { comuna } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComunaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<comuna[]> {
    return this.prisma.comuna.findMany({ orderBy: { nombre: 'asc' } });
  }

  async findOne(codigo_comuna: number): Promise<comuna | null> {
    return this.prisma.comuna.findUnique({ where: { codigo_comuna } });
  }
}
