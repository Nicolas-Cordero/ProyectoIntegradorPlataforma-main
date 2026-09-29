import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma, comuna, universidad } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUniversidadDto } from './dto/create-universidad.dto';
import { UpdateUniversidadDto } from './dto/update-universidad.dto';

// Toda universidad se devuelve con su comuna: los consumidores (formulario de
// carrera, perfil, app móvil) muestran el nombre, no el código.
export type UniversidadConComuna = universidad & { comuna: comuna };

const INCLUDE_COMUNA = { comuna: true } as const;

@Injectable()
export class UniversidadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createUniversidadDto: CreateUniversidadDto,
  ): Promise<UniversidadConComuna> {
    try {
      return await this.prisma.universidad.create({
        data: createUniversidadDto,
        include: INCLUDE_COMUNA,
      });
    } catch (error) {
      throw this.traducirError(error);
    }
  }

  async update(
    id_universidad: number,
    updateUniversidadDto: UpdateUniversidadDto,
  ): Promise<UniversidadConComuna> {
    try {
      return await this.prisma.universidad.update({
        where: {
          codigo_universidad: id_universidad,
        },
        data: updateUniversidadDto,
        include: INCLUDE_COMUNA,
      });
    } catch (error) {
      throw this.traducirError(error);
    }
  }

  async findAll(): Promise<UniversidadConComuna[]> {
    return this.prisma.universidad.findMany({ include: INCLUDE_COMUNA });
  }

  async findOne(id_universidad: number): Promise<UniversidadConComuna | null> {
    return this.prisma.universidad.findUnique({
      where: {
        codigo_universidad: id_universidad,
      },
      include: INCLUDE_COMUNA,
    });
  }

  async findByComuna(codigo_comuna: number): Promise<UniversidadConComuna[]> {
    return this.prisma.universidad.findMany({
      where: {
        codigo_comuna,
      },
      include: INCLUDE_COMUNA,
    });
  }

  async findByEstudiante(
    rut_estudiante: string,
  ): Promise<UniversidadConComuna[]> {
    return this.prisma.universidad.findMany({
      where: {
        carreras: {
          some: {
            rut_estudiante: rut_estudiante,
          },
        },
      },
      include: INCLUDE_COMUNA,
    });
  }

  private traducirError(error: unknown): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Red de seguridad: el servicio ya compara nombres normalizados antes
      // de llegar aquí; esto cubre la carrera entre esa consulta y el insert.
      if (error.code === 'P2002') {
        return new ConflictException(
          'Ya existe una institución con ese nombre en esa comuna.',
        );
      }
      if (error.code === 'P2003') {
        return new BadRequestException('La comuna indicada no existe.');
      }
    }
    return error;
  }
}
