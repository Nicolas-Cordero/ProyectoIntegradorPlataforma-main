import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { beneficio } from '@prisma/client';
import { CreateBeneficioDto, UpdateBeneficioDto } from './dto';
import { BeneficiosRepository } from './beneficios.repository';

@Injectable()
export class BeneficiosService {
  constructor(private readonly beneficioRepo: BeneficiosRepository) {}

  // === BENEFICIO (Catálogo) ===

  async createBeneficio(createDto: CreateBeneficioDto): Promise<beneficio> {
    const existeNombre = await this.beneficioRepo.findByName(createDto.nombre);
    if (existeNombre)
      throw new ConflictException('Ya existe un beneficio con ese nombre');
    return this.beneficioRepo.createBeneficio(createDto);
  }

  async findAllBeneficios(): Promise<beneficio[]> {
    return await this.beneficioRepo.findAllBeneficios();
  }

  async findBeneficioById(id: number): Promise<beneficio> {
    const beneficio = await this.beneficioRepo.findByCode(id);

    if (!beneficio) {
      throw new NotFoundException(`Beneficio con ID ${id} no encontrado`);
    }

    return beneficio;
  }

  async updateBeneficio(
    id: number,
    updateDto: UpdateBeneficioDto,
  ): Promise<beneficio> {
    return await this.beneficioRepo.updateBeneficioByID(id, updateDto);
  }

  // Un tipo de beneficio del catálogo es referenciado por beneficio_estudiante,
  // registro histórico real de ayuda financiera recibida por estudiantes. No
  // se puede eliminar bajo ninguna circunstancia.
  removeBeneficio(): never {
    throw new ForbiddenException(
      'Los beneficios del catálogo no se pueden eliminar.',
    );
  }
}
