import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { EstudianteRepository } from './estudiante.repository';
import { estudiante, EstadoEstudiante, Prisma, UserRol } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { rutSinDV } from '../common/rut.util';

@Injectable()
export class EstudianteService {
  constructor(private readonly estudianteRepo: EstudianteRepository) {}

  private derivarEstado(
    carreras: { estado: EstadoEstudiante }[],
  ): EstadoEstudiante {
    if (carreras.length === 0) return EstadoEstudiante.ACTIVO;
    if (carreras.some((c) => c.estado === EstadoEstudiante.ACTIVO))
      return EstadoEstudiante.ACTIVO;
    return carreras[carreras.length - 1].estado;
  }

  // Adjunta el estado agregado (derivarEstado) a cada estudiante de una lista.
  // Necesario en cualquier endpoint que devuelva estudiantes en bloque, ya que
  // `estado` no es una columna de la tabla estudiante sino un campo derivado.
  private enrichConEstado<
    T extends { carreras: { estado: EstadoEstudiante }[] },
  >(estudiantes: T[]): (T & { estado: EstadoEstudiante })[] {
    return estudiantes.map((est) => ({
      ...est,
      estado: this.derivarEstado(est.carreras),
    }));
  }

  async create(createEstudianteDto: CreateEstudianteDto) {
    const existing = await this.estudianteRepo.findEstudianteByRut(
      createEstudianteDto.rut_estudiante,
    );
    if (existing) {
      throw new ConflictException(
        `Ya existe un estudiante con RUT ${createEstudianteDto.rut_estudiante}`,
      );
    }

    const hashedPassword = await bcrypt.hash(
      rutSinDV(createEstudianteDto.rut_estudiante),
      10,
    );
    const usuarioData: Prisma.usuarioUncheckedCreateInput = {
      rut_usuario: createEstudianteDto.rut_estudiante,
      nombre: createEstudianteDto.nombre,
      apellido: createEstudianteDto.apellido,
      email: createEstudianteDto.email,
      telefono: createEstudianteDto.telefono,
      rol: UserRol.ESTUDIANTE,
      password: hashedPassword,
      must_change_password: true,
      activo: true,
    };

    try {
      return await this.estudianteRepo.createWithUser(
        createEstudianteDto,
        usuarioData,
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Ya existe un usuario con ese RUT o email');
      }
      throw error;
    }
  }

  /**
   * Carga masiva transaccional (importación por Excel). O se crean TODOS los
   * estudiantes o ninguno: cualquier fallo dentro de la transacción del
   * repositorio hace rollback completo.
   *
   * Antes de tocar la base se detectan RUT/email repetidos DENTRO del mismo
   * lote (Prisma createMany no los detecta entre sí de forma amigable) y se
   * traducen los errores de Prisma a mensajes entendibles.
   */
  async createMany(dtos: CreateEstudianteDto[]) {
    const rutsVistos = new Set<string>();
    const emailsVistos = new Set<string>();
    for (const dto of dtos) {
      const email = dto.email.toLowerCase();
      if (rutsVistos.has(dto.rut_estudiante)) {
        throw new ConflictException(
          `El RUT ${dto.rut_estudiante} está repetido dentro del archivo`,
        );
      }
      if (emailsVistos.has(email)) {
        throw new ConflictException(
          `El email ${dto.email} está repetido dentro del archivo`,
        );
      }
      rutsVistos.add(dto.rut_estudiante);
      emailsVistos.add(email);
    }

    const usuariosData: Prisma.usuarioUncheckedCreateInput[] =
      await Promise.all(
        dtos.map(async (dto) => ({
          rut_usuario: dto.rut_estudiante,
          nombre: dto.nombre,
          apellido: dto.apellido,
          email: dto.email,
          telefono: dto.telefono,
          rol: UserRol.ESTUDIANTE,
          password: await bcrypt.hash(rutSinDV(dto.rut_estudiante), 10),
          must_change_password: true,
          activo: true,
        })),
      );

    try {
      const creados = await this.estudianteRepo.createManyWithUsers(
        dtos,
        usuariosData,
      );
      return { creados };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Ya existe un estudiante con ese RUT o email en el sistema. No se importó ninguno.',
          );
        }
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Algún RBD de liceo no existe en el sistema. No se importó ninguno.',
          );
        }
      }
      throw error;
    }
  }

  async findAll(soloActivos = false) {
    if (soloActivos) {
      const becarios = await this.estudianteRepo.findBecariosActivos();
      return this.enrichConEstado(becarios);
    }
    const estudiantes = await this.estudianteRepo.findAllEstudiantes();
    return this.enrichConEstado(estudiantes);
  }

  async findByGeneracion(generacion_id: number) {
    const estudiantes =
      await this.estudianteRepo.findEstudianteByGeneracionId(generacion_id);
    return this.enrichConEstado(estudiantes);
  }

  async findOneSimple(rut_estudiante: string) {
    const est =
      await this.estudianteRepo.findEstudianteByRutSimple(rut_estudiante);
    if (!est) {
      throw new NotFoundException(
        `Estudiante con RUT ${rut_estudiante} no encontrado`,
      );
    }
    const estado = this.derivarEstado(est.carreras ?? []);
    return { ...est, estado };
  }

  async findOneComplete(rut_estudiante: string) {
    const est =
      await this.estudianteRepo.findEstudianteByRutComplete(rut_estudiante);
    if (!est) {
      throw new NotFoundException(
        `Estudiante con RUT ${rut_estudiante} no encontrado`,
      );
    }
    const estado = this.derivarEstado(est.carreras ?? []);
    return { ...est, estado };
  }

  async findSortedByGeneracion() {
    const estudiantes = await this.estudianteRepo.findAllEstudiantes();
    const enriquecidos = this.enrichConEstado(estudiantes);
    const resultado: Record<number, typeof enriquecidos> = {};

    for (const est of enriquecidos) {
      if (!resultado[est.generacion_id]) {
        resultado[est.generacion_id] = [];
      }
      resultado[est.generacion_id].push(est);
    }

    return resultado;
  }

  update(
    rut_estudiante: string,
    updateEstudianteDto: UpdateEstudianteDto,
  ): Promise<estudiante> {
    return this.estudianteRepo.updateWithUserSync(
      rut_estudiante,
      updateEstudianteDto,
    );
  }

  remove(rut_estudiante: string): Promise<estudiante> {
    return this.estudianteRepo.removeWithUserDisable(rut_estudiante);
  }
}
