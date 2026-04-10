import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InformacionContacto } from './entities/informacion-contacto.entity';
import { CreateInformacionContactoDto, UpdateInformacionContactoDto } from './dto';

@Injectable()
export class InformacionContactoService {
  constructor(
    @InjectRepository(InformacionContacto)
    private readonly informacionContactoRepository: Repository<InformacionContacto>,
  ) {}

  async create(createDto: CreateInformacionContactoDto): Promise<InformacionContacto> {
    // Verificar si ya existe contacto para este estudiante
    const existe = await this.informacionContactoRepository.findOne({
      where: { estudiante_id: createDto.estudiante_id },
    });

    if (existe) {
      throw new ConflictException('Ya existe información de contacto para este estudiante');
    }

    // Verificar que el email no esté duplicado
    const emailExiste = await this.informacionContactoRepository.findOne({
      where: { email: createDto.email },
    });

    if (emailExiste) {
      throw new ConflictException('El email ya está registrado');
    }

    const contacto = this.informacionContactoRepository.create(createDto);
    return await this.informacionContactoRepository.save(contacto);
  }

  async findAll(): Promise<InformacionContacto[]> {
    return await this.informacionContactoRepository.find({
      relations: ['estudiante'],
    });
  }

  async findOne(id: string): Promise<InformacionContacto> {
    const contacto = await this.informacionContactoRepository.findOne({
      where: { id_informacion_contacto: id },
      relations: ['estudiante'],
    });

    if (!contacto) {
      throw new NotFoundException(`Información de contacto con ID ${id} no encontrada`);
    }

    return contacto;
  }

  async findByEstudiante(estudianteId: string): Promise<InformacionContacto> {
    const contacto = await this.informacionContactoRepository.findOne({
      where: { estudiante_id: estudianteId },
      relations: ['estudiante'],
    });

    if (!contacto) {
      throw new NotFoundException(`No se encontró información de contacto para el estudiante`);
    }

    return contacto;
  }

  async upsertByEstudiante(
    estudianteId: string,
    updateDto: UpdateInformacionContactoDto,
  ): Promise<InformacionContacto> {
    // Buscar si ya existe información de contacto para este estudiante
    let contacto = await this.informacionContactoRepository.findOne({
      where: { estudiante_id: estudianteId },
    });

    if (contacto) {
      // Si existe, actualizar
      // Verificar email duplicado si se está cambiando
      if (updateDto.email && updateDto.email !== contacto.email) {
        const emailExiste = await this.informacionContactoRepository.findOne({
          where: { email: updateDto.email },
        });

        if (emailExiste && emailExiste.id_informacion_contacto !== contacto.id_informacion_contacto) {
          throw new ConflictException('El email ya está registrado');
        }
      }

      Object.assign(contacto, updateDto);
      return await this.informacionContactoRepository.save(contacto);
    } else {
      // Si no existe, crear nuevo
      const createDto: CreateInformacionContactoDto = {
        estudiante_id: estudianteId,
        ...updateDto,
      };

      // Verificar email duplicado
      if (createDto.email) {
        const emailExiste = await this.informacionContactoRepository.findOne({
          where: { email: createDto.email },
        });

        if (emailExiste) {
          throw new ConflictException('El email ya está registrado');
        }
      }

      contacto = this.informacionContactoRepository.create(createDto);
      return await this.informacionContactoRepository.save(contacto);
    }
  }

  async update(id: string, updateDto: UpdateInformacionContactoDto): Promise<InformacionContacto> {
    const contacto = await this.findOne(id);

    // Si se está actualizando el email, verificar que no esté duplicado
    if (updateDto.email && updateDto.email !== contacto.email) {
      const emailExiste = await this.informacionContactoRepository.findOne({
        where: { email: updateDto.email },
      });

      if (emailExiste) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    Object.assign(contacto, updateDto);
    return await this.informacionContactoRepository.save(contacto);
  }

  async remove(id: string): Promise<void> {
    const contacto = await this.findOne(id);
    await this.informacionContactoRepository.remove(contacto);
  }
}
