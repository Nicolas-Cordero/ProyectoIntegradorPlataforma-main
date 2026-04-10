import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PeriodoAcademico } from './entities/periodo-academico.entity';
import { PeriodoAcademicoEstudiante } from './entities/periodo-academico-estudiante.entity';
import {
  CreatePeriodoAcademicoDto,
  UpdatePeriodoAcademicoDto,
  CreatePeriodoAcademicoEstudianteDto,
  UpdatePeriodoAcademicoEstudianteDto,
} from './dto';

@Injectable()
export class PeriodoAcademicoService {
  constructor(
    @InjectRepository(PeriodoAcademico)
    private readonly periodoRepository: Repository<PeriodoAcademico>,
    @InjectRepository(PeriodoAcademicoEstudiante)
    private readonly periodoEstudianteRepository: Repository<PeriodoAcademicoEstudiante>,
  ) {}

  // === PERIODO ACADÉMICO ===

  async createPeriodo(createDto: CreatePeriodoAcademicoDto): Promise<PeriodoAcademico> {
    const existePeriodo = await this.periodoRepository.findOne({
      where: {
        año: createDto.año,
        semestre: createDto.semestre,
      },
    });

    if (existePeriodo) {
      throw new ConflictException(`Ya existe el período ${createDto.año}-${createDto.semestre}`);
    }

    // Si se marca como actual, desmarcar otros
    if (createDto.es_actual) {
      await this.periodoRepository.update({ es_actual: true }, { es_actual: false });
    }

    const periodo = this.periodoRepository.create(createDto);
    return await this.periodoRepository.save(periodo);
  }

  async findAllPeriodos(): Promise<PeriodoAcademico[]> {
    return await this.periodoRepository.find({
      order: { año: 'DESC', semestre: 'DESC' },
    });
  }

  async findPeriodo(id: string): Promise<PeriodoAcademico> {
    const periodo = await this.periodoRepository.findOne({ where: { id_periodo_academico: id } });

    if (!periodo) {
      throw new NotFoundException(`Período académico con ID ${id} no encontrado`);
    }

    return periodo;
  }

  async findPeriodoActual(): Promise<PeriodoAcademico> {
    const periodo = await this.periodoRepository.findOne({
      where: { es_actual: true },
    });

    if (!periodo) {
      throw new NotFoundException('No hay un período académico marcado como actual');
    }

    return periodo;
  }

  async findByAñoSemestre(año: string | number, semestre: string | number): Promise<PeriodoAcademico> {
    const añoNum = typeof año === 'string' ? parseInt(año, 10) : año;
    const semestreNum = typeof semestre === 'string' ? parseInt(semestre, 10) : semestre;
    
    const periodo = await this.periodoRepository.findOne({
      where: { año: añoNum, semestre: semestreNum },
    });

    if (!periodo) {
      throw new NotFoundException(`Período ${año}-${semestre} no encontrado`);
    }

    return periodo;
  }

  async updatePeriodo(id: string, updateDto: UpdatePeriodoAcademicoDto): Promise<PeriodoAcademico> {
    const periodo = await this.findPeriodo(id);

    // Si se marca como actual, desmarcar otros
    if (updateDto.es_actual) {
      await this.periodoRepository.update({ es_actual: true }, { es_actual: false });
    }

    Object.assign(periodo, updateDto);
    return await this.periodoRepository.save(periodo);
  }

  async removePeriodo(id: string): Promise<void> {
    const periodo = await this.findPeriodo(id);
    await this.periodoRepository.remove(periodo);
  }

  // === PERIODO ACADÉMICO ESTUDIANTE ===

  async create(createDto: CreatePeriodoAcademicoEstudianteDto): Promise<PeriodoAcademicoEstudiante> {
    const existeRegistro = await this.periodoEstudianteRepository.findOne({
      where: {
        estudiante_id: createDto.estudiante_id,
        periodo_academico_id: createDto.periodo_academico_id,
      },
    });

    if (existeRegistro) {
      throw new ConflictException('El estudiante ya tiene registro para este período académico');
    }

    const periodoEstudiante = this.periodoEstudianteRepository.create(createDto);
    return await this.periodoEstudianteRepository.save(periodoEstudiante);
  }

  async findAll(): Promise<PeriodoAcademicoEstudiante[]> {
    return await this.periodoEstudianteRepository.find({
      relations: ['estudiante', 'periodo_academico', 'institucion'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PeriodoAcademicoEstudiante> {
    const periodoEstudiante = await this.periodoEstudianteRepository.findOne({
      where: { id_periodo_academico_estudiante: id },
      relations: ['estudiante', 'periodo_academico', 'institucion'],
    });

    if (!periodoEstudiante) {
      throw new NotFoundException(`Registro con ID ${id} no encontrado`);
    }

    return periodoEstudiante;
  }

  async findByEstudiante(estudianteId: string): Promise<PeriodoAcademicoEstudiante[]> {
    return await this.periodoEstudianteRepository.find({
      where: { estudiante_id: estudianteId },
      relations: ['periodo_academico', 'institucion'],
      order: {
        periodo_academico: { año: 'DESC', semestre: 'DESC' },
      },
    });
  }

  async findByPeriodo(periodoId: string): Promise<PeriodoAcademicoEstudiante[]> {
    return await this.periodoEstudianteRepository.find({
      where: { periodo_academico_id: periodoId },
      relations: ['estudiante', 'institucion'],
    });
  }

  async update(id: string, updateDto: UpdatePeriodoAcademicoEstudianteDto): Promise<PeriodoAcademicoEstudiante> {
    const periodoEstudiante = await this.findOne(id);
    Object.assign(periodoEstudiante, updateDto);
    return await this.periodoEstudianteRepository.save(periodoEstudiante);
  }

  async remove(id: string): Promise<void> {
    const periodoEstudiante = await this.findOne(id);
    await this.periodoEstudianteRepository.remove(periodoEstudiante);
  }
}
