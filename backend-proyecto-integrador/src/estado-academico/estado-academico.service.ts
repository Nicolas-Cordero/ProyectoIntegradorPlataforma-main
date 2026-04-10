import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoAcademico } from './entities/estado-academico.entity';
import { CreateEstadoAcademicoDto, UpdateEstadoAcademicoDto } from './dto';

@Injectable()
export class EstadoAcademicoService {
  constructor(
    @InjectRepository(EstadoAcademico)
    private readonly estadoAcademicoRepository: Repository<EstadoAcademico>,
  ) {}

  async create(createDto: CreateEstadoAcademicoDto): Promise<EstadoAcademico> {
    // Verificar si ya existe estado para este estudiante
    const existe = await this.estadoAcademicoRepository.findOne({
      where: { estudiante_id: createDto.estudiante_id },
    });

    if (existe) {
      throw new ConflictException('Ya existe estado académico para este estudiante');
    }

    const estado = this.estadoAcademicoRepository.create(createDto);
    return await this.estadoAcademicoRepository.save(estado);
  }

  async findAll(): Promise<EstadoAcademico[]> {
    return await this.estadoAcademicoRepository.find({
      relations: ['estudiante'],
    });
  }

  async findOne(id: string): Promise<EstadoAcademico> {
    const estado = await this.estadoAcademicoRepository.findOne({
      where: { id_estado_academico: id },
      relations: ['estudiante'],
    });

    if (!estado) {
      throw new NotFoundException(`Estado académico con ID ${id} no encontrado`);
    }

    return estado;
  }

  async findByEstudiante(estudianteId: string): Promise<EstadoAcademico> {
    const estado = await this.estadoAcademicoRepository.findOne({
      where: { estudiante_id: estudianteId },
      relations: ['estudiante'],
    });

    if (!estado) {
      throw new NotFoundException(`No se encontró estado académico para el estudiante`);
    }

    return estado;
  }

  async findByStatus(status: string): Promise<EstadoAcademico[]> {
    return await this.estadoAcademicoRepository.find({
      where: { status: status as any },
      relations: ['estudiante'],
    });
  }

  async findByGeneracion(generacion: string): Promise<EstadoAcademico[]> {
    return await this.estadoAcademicoRepository.find({
      where: { generacion },
      relations: ['estudiante'],
    });
  }

  async update(id: string, updateDto: UpdateEstadoAcademicoDto): Promise<EstadoAcademico> {
    const estado = await this.findOne(id);
    Object.assign(estado, updateDto);
    return await this.estadoAcademicoRepository.save(estado);
  }

  async upsertByEstudiante(estudianteId: string, updateDto: UpdateEstadoAcademicoDto): Promise<EstadoAcademico> {
    // Intentar encontrar estado existente
    let estado = await this.estadoAcademicoRepository.findOne({
      where: { estudiante_id: estudianteId },
    });

    if (estado) {
      // Si existe, actualizar
      Object.assign(estado, updateDto);
      return await this.estadoAcademicoRepository.save(estado);
    } else {
      // Si no existe, crear nuevo
      const nuevoEstado = this.estadoAcademicoRepository.create({
        estudiante_id: estudianteId,
        ...updateDto,
      });
      return await this.estadoAcademicoRepository.save(nuevoEstado);
    }
  }

  async remove(id: string): Promise<void> {
    const estado = await this.findOne(id);
    await this.estadoAcademicoRepository.remove(estado);
  }
}
