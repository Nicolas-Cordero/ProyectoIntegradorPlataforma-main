import {
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

  async removeBeneficio(id: number): Promise<beneficio> {
    //al remover un beneficio no se estan eliminando las asociaciones a ese beneficio
    return this.beneficioRepo.deleteBeneficioByID(id);
  }

  // === BENEFICIO ESTUDIANTE ===
  //Estos metodos deben pasar a un modulo de relacion
  /*
  async create(createDto: CreateBeneficioEstudianteDto): Promise<BeneficioEstudiante> {
    const beneficioEstudiante = this.beneficioEstudianteRepository.create(createDto);
    return await this.beneficioEstudianteRepository.save(beneficioEstudiante);
  }

  async findAll(): Promise<BeneficioEstudiante[]> {
    return await this.beneficioEstudianteRepository.find({
      relations: ['estudiante', 'beneficio'],
      order: { año_inicio: 'DESC' },
    });
  }

  async findOne(id: string): Promise<BeneficioEstudiante> {
    const beneficioEstudiante = await this.beneficioEstudianteRepository.findOne({
      where: { id_beneficio_estudiante: id },
      relations: ['estudiante', 'beneficio'],
    });

    if (!beneficioEstudiante) {
      throw new NotFoundException(`Beneficio de estudiante con ID ${id} no encontrado`);
    }

    return beneficioEstudiante;
  }

  async findByEstudiante(estudianteId: string): Promise<BeneficioEstudiante[]> {
    return await this.beneficioEstudianteRepository.find({
      where: { estudiante_id: estudianteId },
      relations: ['estudiante', 'beneficio'],
      order: { año_inicio: 'DESC' },
    });
  }

  async findActivos(): Promise<BeneficioEstudiante[]> {
    return await this.beneficioEstudianteRepository.find({
      where: { activo: true },
      relations: ['estudiante', 'beneficio'],
      order: { año_inicio: 'DESC' },
    });
  }

  async update(id: string, updateDto: UpdateBeneficioEstudianteDto): Promise<BeneficioEstudiante> {
    const beneficioEstudiante = await this.findOne(id);
    Object.assign(beneficioEstudiante, updateDto);
    return await this.beneficioEstudianteRepository.save(beneficioEstudiante);
  }

  async remove(id: string): Promise<void> {
    const beneficioEstudiante = await this.findOne(id);
    await this.beneficioEstudianteRepository.remove(beneficioEstudiante);
  }
*/
}
