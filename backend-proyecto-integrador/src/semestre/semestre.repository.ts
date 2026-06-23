import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma, semestre } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSemestreDto } from './dto/create-semestre.dto';

@Injectable()
export class SemestreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSemestreDto: CreateSemestreDto): Promise<semestre> {
    try {
      return await this.prisma.semestre.create({ data: createSemestreDto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(
          `Ya existe un semestre ${createSemestreDto.semestre} para el año ${createSemestreDto.year}.`
        );
      }
      throw new InternalServerErrorException('No se pudo crear el semestre.');
    }
  }

  async findAll(): Promise<semestre[]> {
    return this.prisma.semestre.findMany({ orderBy: [{ year: 'asc' }, { semestre: 'asc' }] });
  }

  async findOne(id: number): Promise<semestre | null> {
    return this.prisma.semestre.findUnique({ where: { semestre_id: id } });
  }

  async findByYearAndCodigo(year: number, semestre: string): Promise<semestre | null> {
    return this.prisma.semestre.findFirst({ where: { year, semestre } });
  }

  async remove(id: number): Promise<semestre> {
    try {
      return await this.prisma.semestre.delete({ where: { semestre_id: id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new ConflictException(`Semestre con id ${id} no encontrado.`);
      }
      throw new InternalServerErrorException(`No se pudo eliminar el semestre ${id}.`);
    }
  }

  async linkCarrera(semestre_id: number, codigo_carrera: number): Promise<void> {
    await this.prisma.semestre_carrera.upsert({
      where: { semestre_id_codigo_carrera: { semestre_id, codigo_carrera } },
      create: { semestre_id, codigo_carrera },
      update: {},
    });
  }

  async getByCarrera(codigo_carrera: number): Promise<semestre[]> {
    const links = await this.prisma.semestre_carrera.findMany({
      where: { codigo_carrera },
      include: { semestre: true },
    });
    return links.map(l => l.semestre);
  }

  async unlinkCarrera(semestre_id: number, codigo_carrera: number): Promise<void> {
    try {
      await this.prisma.semestre_carrera.delete({
        where: { semestre_id_codigo_carrera: { semestre_id, codigo_carrera } },
      });
    } catch (error) {
      // Ignorar si el registro no existe (datos anteriores sin pivot)
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return;
      throw new InternalServerErrorException(`No se pudo desvincular el semestre ${semestre_id}.`);
    }
  }
}
