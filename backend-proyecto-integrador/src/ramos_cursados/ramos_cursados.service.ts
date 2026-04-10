import { Injectable } from '@nestjs/common';
import { CreateRamosCursadosDto } from './dto/create-ramos_cursado.dto';
import { UpdateRamosCursadosDto } from './dto/update-ramos_cursado.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RamosCursados } from './entities/ramos_cursado.entity';
import { Repository, IsNull } from 'typeorm';

@Injectable()
export class RamosCursadosService {

  constructor(@InjectRepository(RamosCursados) private ramosCursadosRepository: Repository<RamosCursados>) {}

  async create(createRamosCursadosDto: CreateRamosCursadosDto): Promise<RamosCursados> {
    const ramo = this.ramosCursadosRepository.create(createRamosCursadosDto);
    return await this.ramosCursadosRepository.save(ramo);
  }

  async findAll(): Promise<RamosCursados[]> {
    return await this.ramosCursadosRepository.find({
      relations: ['estudiante']
    });
  }

  async findOne(id: string): Promise<RamosCursados | null> {
    return await this.ramosCursadosRepository.findOne({
      where: { id_ramo: id },
      relations: ['estudiante']
    });
  }

  async findByEstudiante(estudianteId: string, filtros?: { periodo_academico_estudiante_id?: string }): Promise<RamosCursados[]> {
    const whereCondition: any = { estudiante: { id_estudiante: estudianteId } };
    
    if (filtros?.periodo_academico_estudiante_id) {
      whereCondition.periodo_academico_estudiante_id = filtros.periodo_academico_estudiante_id;
    }
    
    console.log(`🔍 Buscando ramos para estudiante ${estudianteId} con filtros:`, whereCondition);
    
    return await this.ramosCursadosRepository.find({
      where: whereCondition,
      relations: ['estudiante', 'periodo_academico_estudiante', 'periodo_academico_estudiante.periodo_academico'],
      order: { nombre_ramo: 'ASC' }
    });
  }

  async update(id: string, updateRamosCursadosDto: UpdateRamosCursadosDto): Promise<RamosCursados | null> {
    await this.ramosCursadosRepository.update({ id_ramo: id }, updateRamosCursadosDto);
    return this.findOne(id);
  }

  // === MÉTODO fixSemestres ELIMINADO ===
  // Los campos año/semestre fueron migrados a periodo_academico
  // Usar PeriodoAcademicoService para gestionar períodos académicos

  async remove(id: string): Promise<void> {
    await this.ramosCursadosRepository.delete({ id_ramo: id });
  }
}
