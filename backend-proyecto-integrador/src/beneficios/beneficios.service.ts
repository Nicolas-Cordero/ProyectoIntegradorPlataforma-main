import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Beneficio } from './entities/beneficio.entity';
import { BeneficioEstudiante } from './entities/beneficio-estudiante.entity';
import {
  CreateBeneficioDto,
  UpdateBeneficioDto,
  CreateBeneficioEstudianteDto,
  UpdateBeneficioEstudianteDto,
} from './dto';

@Injectable()
export class BeneficiosService {
  constructor(
    @InjectRepository(Beneficio)
    private readonly beneficioRepository: Repository<Beneficio>,
    @InjectRepository(BeneficioEstudiante)
    private readonly beneficioEstudianteRepository: Repository<BeneficioEstudiante>,
  ) {}

  // === BENEFICIO (Catálogo) ===

  async createBeneficio(createDto: CreateBeneficioDto): Promise<Beneficio> {
    const existeNombre = await this.beneficioRepository.findOne({
      where: { nombre: createDto.nombre },
    });

    if (existeNombre) {
      throw new ConflictException('Ya existe un beneficio con ese nombre');
    }

    const existeCodigo = await this.beneficioRepository.findOne({
      where: { codigo: createDto.codigo },
    });

    if (existeCodigo) {
      throw new ConflictException('Ya existe un beneficio con ese código');
    }

    const beneficio = this.beneficioRepository.create(createDto);
    return await this.beneficioRepository.save(beneficio);
  }

  async findAllBeneficios(): Promise<Beneficio[]> {
    return await this.beneficioRepository.find();
  }

  async findBeneficio(id: string): Promise<Beneficio> {
    const beneficio = await this.beneficioRepository.findOne({ where: { id_beneficio: id } });

    if (!beneficio) {
      throw new NotFoundException(`Beneficio con ID ${id} no encontrado`);
    }

    return beneficio;
  }

  async findBeneficiosActivos(): Promise<Beneficio[]> {
    return await this.beneficioRepository.find({
      where: { activo: true },
    });
  }

  async updateBeneficio(id: string, updateDto: UpdateBeneficioDto): Promise<Beneficio> {
    const beneficio = await this.findBeneficio(id);
    Object.assign(beneficio, updateDto);
    return await this.beneficioRepository.save(beneficio);
  }

  async removeBeneficio(id: string): Promise<void> {
    const beneficio = await this.findBeneficio(id);
    await this.beneficioRepository.remove(beneficio);
  }

  // === BENEFICIO ESTUDIANTE ===

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
}
