import { Injectable } from '@nestjs/common';
import { comuna } from '@prisma/client';
import { ComunaRepository } from './comuna.repository';

// Catálogo fijo (se carga por migración/seed): solo lectura.
@Injectable()
export class ComunaService {
  constructor(private readonly comunaRepo: ComunaRepository) {}

  findAll(): Promise<comuna[]> {
    return this.comunaRepo.findAll();
  }
}
