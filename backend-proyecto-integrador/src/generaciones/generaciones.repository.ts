import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generacion } from '@prisma/client';
import { CreateGeneracionDto } from './dto/create-generacion.dto';
import { UpdateGeneracionDto } from './dto/update-generacion.dto';

@Injectable()
export class GeneracionesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<generacion[]> {
    return this.prisma.generacion.findMany({
      orderBy: { año: 'desc' },
    });
  }

  async findById(id: number): Promise<generacion | null> {
    return this.prisma.generacion.findUnique({
      where: { id },
    });
  }

  async findByAño(año: number): Promise<generacion | null> {
    return this.prisma.generacion.findUnique({
      where: { año },
    });
  }

  async create(data: CreateGeneracionDto): Promise<generacion> {
    try {
      return await this.prisma.generacion.create({ data });
    } catch (error) {
      throw new InternalServerErrorException(`No se pudo crear la generación ${data.año}`);
    }
  }

  async update(id: number, data: UpdateGeneracionDto): Promise<generacion> {
    try {
      return await this.prisma.generacion.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new InternalServerErrorException(`No se pudo actualizar la generación con id ${id}`);
    }
  }

  async delete(id: number): Promise<generacion> {
    try {
      return await this.prisma.generacion.delete({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException(`No se pudo eliminar la generación con id ${id}`);
    }
  }
}
