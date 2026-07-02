import { Injectable } from '@nestjs/common';
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

  remove(rbd_liceo: string) {
    //liceo es independiente.
    return this.liceoRepo.remove(rbd_liceo);
  }
}
