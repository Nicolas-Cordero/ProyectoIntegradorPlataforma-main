import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { EstadoEstudiante, historial_estado_carrera } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HistorialEstadoCarreraRepository {
  constructor(private readonly prisma: PrismaService) {}

  async registrar(data: {
    codigo_carrera: number;
    estado_anterior: EstadoEstudiante | null;
    estado_nuevo: EstadoEstudiante;
    rut_usuario: string;
  }): Promise<historial_estado_carrera> {
    try {
      return await this.prisma.historial_estado_carrera.create({ data });
    } catch (error) {
      throw new InternalServerErrorException('No se pudo registrar el historial de estado');
    }
  }

  async cambiarEstado(
    codigo_carrera: number,
    estado_nuevo: EstadoEstudiante,
    rut_usuario: string,
  ): Promise<historial_estado_carrera> {
    return this.prisma.$transaction(async (tx) => {
      const carrera = await tx.carrera.findUnique({ where: { codigo_carrera } });
      if (!carrera) throw new NotFoundException(`Carrera ${codigo_carrera} no encontrada`);

      const historial = await tx.historial_estado_carrera.create({
        data: {
          codigo_carrera,
          estado_anterior: carrera.estado,
          estado_nuevo,
          rut_usuario,
        },
      });

      await tx.carrera.update({
        where: { codigo_carrera },
        data: { estado: estado_nuevo },
      });

      const carreras = await tx.carrera.findMany({
        where: { rut_estudiante: carrera.rut_estudiante },
      });
      const hayAlgunaActiva = carreras.some(
        (c) => (c.codigo_carrera === codigo_carrera ? estado_nuevo : c.estado) === EstadoEstudiante.ACTIVO,
      );
      await tx.usuario.updateMany({
        where: { rut_usuario: carrera.rut_estudiante },
        data: { activo: hayAlgunaActiva },
      });

      return historial;
    });
  }

  async findByCarrera(codigo_carrera: number) {
    return this.prisma.historial_estado_carrera.findMany({
      where: { codigo_carrera },
      orderBy: { created_at: 'asc' },
      include: {
        usuario: { select: { nombre: true, apellido: true } },
      },
    });
  }
}
