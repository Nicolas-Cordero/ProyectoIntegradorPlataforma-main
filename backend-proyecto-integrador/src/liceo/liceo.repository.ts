import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLiceoDto, UpdateLiceoDto } from './dto';
import { liceo } from '@prisma/client';

@Injectable()
export class LiceoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLiceoDto: CreateLiceoDto): Promise<liceo> {
    return this.prisma.liceo.create({
      data: createLiceoDto,
    });
  }

  async update(rbd: string, udpateLiceoDto: UpdateLiceoDto): Promise<liceo> {
    return this.prisma.liceo.update({
      where: {
        rbd: rbd,
      },
      data: udpateLiceoDto,
    });
  }

  async findAll(): Promise<liceo[]> {
    return this.prisma.liceo.findMany();
  }

  async findOne(rbd: string): Promise<liceo | null> {
    return this.prisma.liceo.findUnique({
      where: {
        rbd: rbd,
      },
    });
  }

  async findByComuna(comuna: string): Promise<liceo[]> {
    return this.prisma.liceo.findMany({
      where: {
        comuna: comuna,
      },
    });
  }

  //sera necesario usar un enum para especialidad?
  async findByEspecialidad(especialidad: string): Promise<liceo[]> {
    return this.prisma.liceo.findMany({
      where: {
        especialidad: especialidad,
      },
    });
  }
}
