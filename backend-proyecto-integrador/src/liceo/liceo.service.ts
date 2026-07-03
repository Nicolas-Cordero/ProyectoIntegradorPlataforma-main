import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateLiceoDto, UpdateLiceoDto } from './dto';
import { LiceoRepository } from './liceo.repository';
import { liceo } from '@prisma/client';

@Injectable()
export class LiceoService {
  constructor(private readonly liceoRepo: LiceoRepository) {}

  create(createLiceoDto: CreateLiceoDto): Promise<liceo> {
    return this.liceoRepo.create(createLiceoDto);
  }

  findAll(): Promise<liceo[]> {
    return this.liceoRepo.findAll();
  }

  async findOne(rbd_liceo: string): Promise<liceo> {
    const liceo = await this.liceoRepo.findOne(rbd_liceo);
    if (!liceo) {
      throw new Error(`Liceo con RBD ${rbd_liceo} no encontrado`);
    }
    return liceo;
  }

  update(rbd_liceo: string, updateLiceoDto: UpdateLiceoDto) {
    return this.liceoRepo.update(rbd_liceo, updateLiceoDto);
  }

  // Un liceo es referenciado por potencialmente muchos estudiantes; no se
  // puede eliminar bajo ninguna circunstancia, para evitar que un borrado
  // accidental arrastre estudiantes completos vía cascada.
  remove(): never {
    throw new ForbiddenException('Los liceos no se pueden eliminar.');
  }
}
