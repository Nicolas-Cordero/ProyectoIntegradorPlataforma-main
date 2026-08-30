import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { beneficio_estudiante, Prisma } from '@prisma/client';
import { UpdateBeneficioEstudianteDto } from './dto';

@Injectable()
export class BeneficioEstudianteRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Traduce los errores conocidos de Prisma a excepciones HTTP. Sin esto, una
   * asignación duplicada o un RUT inexistente salen como 500 en vez de 409/404.
   */
  private traducirError(
    error: unknown,
    codigo_beneficio: number,
    rut_estudiante: string,
  ): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002': // violación de llave única / primaria
          return new ConflictException(
            `El estudiante ${rut_estudiante} ya tiene asignado el beneficio ${codigo_beneficio}`,
          );
        case 'P2003': // violación de llave foránea
          return new NotFoundException(
            `No existe el estudiante ${rut_estudiante} o el beneficio ${codigo_beneficio}`,
          );
        case 'P2025': // el registro a actualizar/eliminar no existe
          return new NotFoundException(
            `El estudiante ${rut_estudiante} no tiene asignado el beneficio ${codigo_beneficio}`,
          );
      }
    }
    return error instanceof Error ? error : new Error(String(error));
  }

  async createAssociation(
    data: Prisma.beneficio_estudianteUncheckedCreateInput,
  ): Promise<beneficio_estudiante> {
    try {
      return await this.prisma.beneficio_estudiante.create({ data });
    } catch (error) {
      throw this.traducirError(
        error,
        data.codigo_beneficio,
        data.rut_estudiante,
      );
    }
  }

  async updateAssociation(
    codigo_beneficio: number,
    rut_estudiante: string,
    updateBeneficioEstudianteDto: UpdateBeneficioEstudianteDto,
  ): Promise<beneficio_estudiante> {
    try {
      return await this.prisma.beneficio_estudiante.update({
        where: {
          codigo_beneficio_rut_estudiante: { codigo_beneficio, rut_estudiante },
        },
        data: updateBeneficioEstudianteDto,
      });
    } catch (error) {
      throw this.traducirError(error, codigo_beneficio, rut_estudiante);
    }
  }

  async deleteAssociation(
    codigo_beneficio: number,
    rut_estudiante: string,
  ): Promise<beneficio_estudiante> {
    try {
      return await this.prisma.beneficio_estudiante.delete({
        where: {
          codigo_beneficio_rut_estudiante: { codigo_beneficio, rut_estudiante },
        },
      });
    } catch (error) {
      throw this.traducirError(error, codigo_beneficio, rut_estudiante);
    }
  }

  /**
   * Asignaciones de un estudiante, con el beneficio del catálogo incluido.
   *
   * Devuelve las filas de `beneficio_estudiante` (con `estado` e `inicio`), NO
   * filas del catálogo: son los datos de la asignación los que el cliente
   * necesita. El `include` evita que tenga que pedir el catálogo aparte.
   */
  async findAllAssociationsByEstudiante(rut_estudiante: string) {
    return this.prisma.beneficio_estudiante.findMany({
      where: { rut_estudiante },
      include: { beneficio: true },
      orderBy: { inicio: 'desc' },
    });
  }

  /** Asignaciones de un beneficio, con el estudiante incluido. */
  async findAllAssociationsByBeneficio(codigo_beneficio: number) {
    return this.prisma.beneficio_estudiante.findMany({
      where: { codigo_beneficio },
      include: { estudiante: true },
      orderBy: { inicio: 'desc' },
    });
  }

  async findOneAssociation(
    codigo_beneficio: number,
    rut_estudiante: string,
  ): Promise<beneficio_estudiante | null> {
    return this.prisma.beneficio_estudiante.findUnique({
      where: {
        codigo_beneficio_rut_estudiante: { codigo_beneficio, rut_estudiante },
      },
    });
  }

  async findAllAssociations(): Promise<beneficio_estudiante[]> {
    return this.prisma.beneficio_estudiante.findMany({
      orderBy: { inicio: 'desc' },
    });
  }
}
