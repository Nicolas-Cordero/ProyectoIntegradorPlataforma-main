import { Injectable, NotFoundException } from '@nestjs/common';
import { EstadoBeneficio } from '@prisma/client';
import { CreateBeneficioEstudianteDto } from './dto/create-beneficio-estudiante.dto';
import { UpdateBeneficioEstudianteDto } from './dto/update-beneficio-estudiante.dto';
import { BeneficioEstudianteRepository } from './beneficio-estudiante.repository';
import { EstudianteRepository } from '../estudiante';
import { BeneficiosRepository } from '../beneficios';

@Injectable()
export class BeneficioEstudianteService {
  constructor(
    private readonly associationRepo: BeneficioEstudianteRepository,
    private readonly estudianteRepo: EstudianteRepository,
    private readonly beneficioRepo: BeneficiosRepository,
  ) {}

  async createAssociation(dto: CreateBeneficioEstudianteDto) {
    const estudiante = await this.estudianteRepo.findEstudianteByRut(
      dto.rut_estudiante,
    );
    if (!estudiante) {
      throw new NotFoundException(
        `Estudiante ${dto.rut_estudiante} no encontrado`,
      );
    }

    const beneficio = await this.beneficioRepo.findByCode(dto.codigo_beneficio);
    if (!beneficio) {
      throw new NotFoundException(
        `Beneficio ${dto.codigo_beneficio} no encontrado`,
      );
    }

    // `estado` es opcional en el DTO pero obligatorio en la BD: una asignación
    // recién creada arranca en trámite mientras no se diga lo contrario.
    return this.associationRepo.createAssociation({
      rut_estudiante: dto.rut_estudiante,
      codigo_beneficio: dto.codigo_beneficio,
      inicio: dto.inicio,
      estado: dto.estado ?? EstadoBeneficio.EN_TRAMITE,
    });
  }

  findAllAssociations() {
    return this.associationRepo.findAllAssociations();
  }

  /** Asignaciones del beneficio, cada una con su estudiante. */
  findAssociationsByBeneficio(codigo_beneficio: number) {
    return this.associationRepo.findAllAssociationsByBeneficio(
      codigo_beneficio,
    );
  }

  /** Asignaciones del estudiante, cada una con su beneficio del catálogo. */
  findAssociationsByEstudiante(rut_estudiante: string) {
    return this.associationRepo.findAllAssociationsByEstudiante(rut_estudiante);
  }

  async findOneAssociation(codigo_beneficio: number, rut_estudiante: string) {
    const asociacion = await this.associationRepo.findOneAssociation(
      codigo_beneficio,
      rut_estudiante,
    );
    if (!asociacion) {
      throw new NotFoundException(
        `El estudiante ${rut_estudiante} no tiene asignado el beneficio ${codigo_beneficio}`,
      );
    }
    return asociacion;
  }

  update(
    codigo_beneficio: number,
    rut_estudiante: string,
    dto: UpdateBeneficioEstudianteDto,
  ) {
    return this.associationRepo.updateAssociation(
      codigo_beneficio,
      rut_estudiante,
      dto,
    );
  }

  /** Elimina solo la relación: ni el beneficio ni el estudiante se tocan. */
  remove(codigo_beneficio: number, rut_estudiante: string) {
    return this.associationRepo.deleteAssociation(
      codigo_beneficio,
      rut_estudiante,
    );
  }
}
