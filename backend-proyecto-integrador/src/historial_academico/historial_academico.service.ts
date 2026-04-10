import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHistorialAcademicoDto } from './dto/create-historial_academico.dto';
import { UpdateHistorialAcademicoDto } from './dto/update-historial_academico.dto';
import { HistorialAcademico } from './entities/historial_academico.entity';
import { Estudiante } from '../estudiante/entities/estudiante.entity';

@Injectable()
export class HistorialAcademicoService {
  constructor(
    @InjectRepository(HistorialAcademico)
    private readonly historialRepository: Repository<HistorialAcademico>,
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,
  ) {}

  async create(createHistorialAcademicoDto: CreateHistorialAcademicoDto): Promise<HistorialAcademico> {
    return this.upsertByEstudianteAndPeriodo(createHistorialAcademicoDto);
  }

  async upsertByEstudianteAndPeriodo(createHistorialAcademicoDto: CreateHistorialAcademicoDto): Promise<HistorialAcademico> {
    // Verificar que el estudiante existe
    const estudiante = await this.estudianteRepository.findOne({
      where: { id_estudiante: createHistorialAcademicoDto.id_estudiante }
    });
    
    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${createHistorialAcademicoDto.id_estudiante} no encontrado`);
    }

    // === CAMPOS año Y semestre ELIMINADOS ===
    // Estos campos fueron migrados a periodo_academico
    // Este método debe ser refactorizado para usar periodo_academico_estudiante_id

    const historial = this.historialRepository.create({
      ...createHistorialAcademicoDto,
      estudiante,
    });
    
    return await this.historialRepository.save(historial);
  }

  async findAll(): Promise<HistorialAcademico[]> {
    return await this.historialRepository.find({
      relations: ['estudiante'],
    });
  }

  async findByEstudiante(idEstudiante: string): Promise<HistorialAcademico[]> {
    return await this.historialRepository.find({
      where: { estudiante: { id_estudiante: idEstudiante } },
      relations: ['estudiante'],
    });
  }

  // === MÉTODOS findBySemestre Y findByEstudianteAndSemestre ELIMINADOS ===
  // Los campos año/semestre fueron migrados a periodo_academico
  // Usar PeriodoAcademicoService para consultas por período

  async findOne(id: string): Promise<HistorialAcademico> {
    const historial = await this.historialRepository.findOne({
      where: { id_historial_academico: id },
      relations: ['estudiante'],
    });
    
    if (!historial) {
      throw new NotFoundException(`Historial académico con ID ${id} no encontrado`);
    }
    
    return historial;
  }

  async update(id: string, updateHistorialAcademicoDto: UpdateHistorialAcademicoDto): Promise<HistorialAcademico> {
    const historial = await this.findOne(id);
    
    Object.assign(historial, updateHistorialAcademicoDto);
    
    return await this.historialRepository.save(historial);
  }

  async addTrayectoria(id: string, nuevaTrayectoria: string): Promise<HistorialAcademico> {
    const historial = await this.findOne(id);
    
    if (!historial.trayectoria_academica) {
      historial.trayectoria_academica = [];
    }
    
    historial.trayectoria_academica.push(nuevaTrayectoria);
    
    return await this.historialRepository.save(historial);
  }

  async updateTrayectoria(id: string, index: number, nuevaTrayectoria: string): Promise<HistorialAcademico> {
    const historial = await this.findOne(id);
    
    if (!historial.trayectoria_academica || index < 0 || index >= historial.trayectoria_academica.length) {
      throw new NotFoundException(`Trayectoria en índice ${index} no encontrada`);
    }
    
    historial.trayectoria_academica[index] = nuevaTrayectoria;
    
    return await this.historialRepository.save(historial);
  }

  async deleteTrayectoria(id: string, index: number): Promise<HistorialAcademico> {
    const historial = await this.findOne(id);
    
    if (!historial.trayectoria_academica || index < 0 || index >= historial.trayectoria_academica.length) {
      throw new NotFoundException(`Trayectoria en índice ${index} no encontrada`);
    }
    
    historial.trayectoria_academica.splice(index, 1);
    
    return await this.historialRepository.save(historial);
  }

  async remove(id: string): Promise<void> {
    const historial = await this.findOne(id);
    await this.historialRepository.remove(historial);
  }
}
