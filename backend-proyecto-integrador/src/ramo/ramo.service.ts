import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRamoDto } from './dto/create-ramo.dto';
import { CreateRamoMeDto } from './dto/create-ramo-me.dto';
import { UpdateRamoDto } from './dto/update-ramo.dto';
import { RamoRepository, RamoConDetalle } from './ramo.repository';
import { EstadoRamo, ramo } from '@prisma/client';
import { NOTA_APROBACION } from '../common';

@Injectable()
export class RamoService {
  constructor(private readonly ramoRepository: RamoRepository) {}

  // El único motivo por el que un ramo está PENDIENTE es no tener nota final
  // (ver el cierre de semestre en SemestreService). En cuanto aparece la nota,
  // el estado deja de ser PENDIENTE obligatoriamente y pasa a derivarse de esa
  // nota, igual que en el cierre. El resto de los estados no se tocan: un
  // ELIMINADO sigue eliminado y un CURSANDO con nota solo se resuelve al cerrar
  // el semestre.
  private resolverPendiente(
    estado: EstadoRamo,
    nota_final: number | null,
  ): EstadoRamo {
    if (estado !== EstadoRamo.PENDIENTE || nota_final === null) {
      return estado;
    }
    return nota_final >= NOTA_APROBACION
      ? EstadoRamo.APROBADO
      : EstadoRamo.REPROBADO;
  }

  private aplicarReglaAlCrear<T extends CreateRamoDto | CreateRamoMeDto>(
    dto: T,
  ): T {
    return {
      ...dto,
      estado: this.resolverPendiente(dto.estado, dto.nota_final ?? null),
    };
  }

  // Un PATCH puede traer solo la nota, así que la regla se evalúa sobre la fila
  // ya mezclada con el DTO y no sobre el DTO suelto.
  private aplicarReglaAlActualizar(
    actual: ramo,
    dto: UpdateRamoDto,
  ): UpdateRamoDto {
    const estado = dto.estado ?? actual.estado;
    const nota_final =
      dto.nota_final !== undefined
        ? (dto.nota_final ?? null)
        : actual.nota_final === null
          ? null
          : Number(actual.nota_final);

    const resuelto = this.resolverPendiente(estado, nota_final);
    return resuelto === estado ? dto : { ...dto, estado: resuelto };
  }

  create(createRamoDto: CreateRamoDto): Promise<ramo> {
    return this.ramoRepository.create(this.aplicarReglaAlCrear(createRamoDto));
  }

  async findOne(id_ramo: number): Promise<ramo> {
    const ramo = await this.ramoRepository.findOne(id_ramo);
    if (!ramo) {
      throw new Error(`Ramo con id ${id_ramo} no encontrado`);
    }
    return ramo;
  }

  async update(id_ramo: number, updateRamoDto: UpdateRamoDto): Promise<ramo> {
    const actual = await this.ramoRepository.findOne(id_ramo);
    if (!actual) {
      throw new NotFoundException(`Ramo con id ${id_ramo} no encontrado`);
    }
    return this.ramoRepository.update(
      id_ramo,
      this.aplicarReglaAlActualizar(actual, updateRamoDto),
    );
  }

  remove(id: number): Promise<ramo> {
    return this.ramoRepository.remove(id);
  }

  findAllByCarrera(codigo_carrera: number): Promise<RamoConDetalle[]> {
    return this.ramoRepository.findAllByCarrera(codigo_carrera);
  }

  // ── Operaciones propias del estudiante (el rut viene del JWT) ─────────────────

  findAllByEstudiante(rut_estudiante: string): Promise<ramo[]> {
    return this.ramoRepository.findAllByEstudiante(rut_estudiante);
  }

  // Fuerza el rut del estudiante autenticado: el body no incluye rut_estudiante.
  createForEstudiante(
    rut_estudiante: string,
    createRamoDto: CreateRamoMeDto,
  ): Promise<ramo> {
    return this.ramoRepository.create({
      ...this.aplicarReglaAlCrear(createRamoDto),
      rut_estudiante,
    });
  }

  // Solo permite modificar un ramo que pertenece al estudiante autenticado.
  async updateOwn(
    id_ramo: number,
    rut_estudiante: string,
    updateRamoDto: UpdateRamoDto,
  ): Promise<ramo> {
    const ramo = await this.ramoRepository.findOne(id_ramo);
    if (!ramo) {
      throw new NotFoundException(`Ramo con id ${id_ramo} no encontrado`);
    }
    if (ramo.rut_estudiante !== rut_estudiante) {
      throw new ForbiddenException(
        'No puedes modificar un ramo que no te pertenece',
      );
    }
    return this.ramoRepository.update(
      id_ramo,
      this.aplicarReglaAlActualizar(ramo, updateRamoDto),
    );
  }
}
