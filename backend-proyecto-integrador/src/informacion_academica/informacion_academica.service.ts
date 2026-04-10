import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInformacionAcademicaDto } from './dto/create-informacion_academica.dto';
import { UpdateInformacionAcademicaDto } from './dto/update-informacion_academica.dto';
import { InformacionAcademica } from './entities/informacion_academica.entity';
import { Estudiante } from '../estudiante/entities/estudiante.entity';

@Injectable()
export class InformacionAcademicaService {
  constructor(
    @InjectRepository(InformacionAcademica)
    private readonly informacionAcademicaRepository: Repository<InformacionAcademica>,
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,
  ) {}

  async create(createInformacionAcademicaDto: CreateInformacionAcademicaDto): Promise<InformacionAcademica> {
    // Verificar que el estudiante existe
    const estudiante = await this.estudianteRepository.findOne({
      where: { id_estudiante: createInformacionAcademicaDto.id_estudiante }
    });
    
    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${createInformacionAcademicaDto.id_estudiante} no encontrado`);
    }

    const informacionAcademica = this.informacionAcademicaRepository.create({
      ...createInformacionAcademicaDto,
      estudiante,
    });
    
    return await this.informacionAcademicaRepository.save(informacionAcademica);
  }

  async findAll(): Promise<InformacionAcademica[]> {
    return await this.informacionAcademicaRepository.find({
      relations: ['estudiante'],
    });
  }

  async findOne(id: string): Promise<InformacionAcademica> {
    const informacionAcademica = await this.informacionAcademicaRepository.findOne({
      where: { id_info_academico: id },
      relations: ['estudiante'],
    });
    
    if (!informacionAcademica) {
      throw new NotFoundException(`Información académica con ID ${id} no encontrada`);
    }
    
    return informacionAcademica;
  }

  async findByEstudiante(idEstudiante: string): Promise<InformacionAcademica> {
    const informacionAcademica = await this.informacionAcademicaRepository.findOne({
      where: { estudiante: { id_estudiante: idEstudiante } },
      relations: ['estudiante'],
    });
    
    if (!informacionAcademica) {
      throw new NotFoundException(`Información académica para estudiante ${idEstudiante} no encontrada`);
    }
    
    return informacionAcademica;
  }

  async upsertByEstudiante(idEstudiante: string, dto: CreateInformacionAcademicaDto | UpdateInformacionAcademicaDto) {
    const estudiante = await this.estudianteRepository.findOne({ where: { id_estudiante: idEstudiante } });
    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${idEstudiante} no encontrado`);
    }

    const existente = await this.informacionAcademicaRepository.findOne({
      where: { estudiante: { id_estudiante: idEstudiante } },
      relations: ['estudiante'],
    });

    if (existente) {
      Object.assign(existente, dto);
      return await this.informacionAcademicaRepository.save(existente);
    }

    const informacionAcademica = this.informacionAcademicaRepository.create({
      ...dto,
      estudiante,
    });

    return await this.informacionAcademicaRepository.save(informacionAcademica);
  }

  async update(id: string, updateInformacionAcademicaDto: UpdateInformacionAcademicaDto): Promise<InformacionAcademica> {
    const informacionAcademica = await this.findOne(id);
    
    Object.assign(informacionAcademica, updateInformacionAcademicaDto);
    
    return await this.informacionAcademicaRepository.save(informacionAcademica);
  }

  async updatePromedio(id: string, nivel: '1' | '2' | '3' | '4', promedio: number): Promise<InformacionAcademica> {
    const informacionAcademica = await this.findOne(id);
    
    const campo = `promedio_${nivel}` as keyof InformacionAcademica;
    (informacionAcademica as any)[campo] = promedio;
    
    return await this.informacionAcademicaRepository.save(informacionAcademica);
  }

  // === MÉTODOS DE ENSAYOS PAES ELIMINADOS ===
  // Los ensayos PAES ahora se gestionan mediante el módulo informacion-admision/ensayo-paes
  // Usar EnsayoPaesService en su lugar

  async remove(id: string): Promise<void> {
    const informacionAcademica = await this.findOne(id);
    await this.informacionAcademicaRepository.remove(informacionAcademica);
  }
}
