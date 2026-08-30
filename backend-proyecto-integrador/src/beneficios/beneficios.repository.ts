import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { beneficio, Prisma } from '@prisma/client';
import { CreateBeneficioDto, UpdateBeneficioDto } from './dto';

@Injectable()
export class BeneficiosRepository {
  constructor(private readonly prisma: PrismaService) {}

  //beneficios

  async createBeneficio(
    createBeneficioDto: CreateBeneficioDto,
  ): Promise<beneficio> {
    try {
      return await this.prisma.beneficio.create({
        data: createBeneficioDto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Ya existe un beneficio con el nombre "${createBeneficioDto.nombre}"`,
        );
      }
      throw error;
    }
  }

  async findAllBeneficios(): Promise<beneficio[]> {
    return this.prisma.beneficio.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async findByCode(codigo: number): Promise<beneficio | null> {
    return this.prisma.beneficio.findUnique({
      where: {
        codigo_beneficio: codigo,
      },
    });
  }

  async findByName(nombre: string): Promise<beneficio | null> {
    return this.prisma.beneficio.findUnique({
      where: {
        nombre: nombre,
      },
    });
  }

  async updateBeneficioByID(
    id: number,
    updateBeneficioDto: UpdateBeneficioDto,
  ): Promise<beneficio> {
    try {
      return await this.prisma.beneficio.update({
        where: {
          codigo_beneficio: id,
        },
        data: updateBeneficioDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025')
          throw new NotFoundException(`Beneficio ${id} no encontrado`);
        if (error.code === 'P2002')
          throw new ConflictException(
            `Ya existe un beneficio con el nombre "${updateBeneficioDto.nombre}"`,
          );
      }
      throw error;
    }
  }
}
