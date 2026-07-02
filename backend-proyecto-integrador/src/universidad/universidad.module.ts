import { Module } from '@nestjs/common';
import { UniversidadService } from './universidad.service';
import { UniversidadController } from './universidad.controller';
import { UniversidadRepository } from './universidad.repository';

@Module({
  controllers: [UniversidadController],
  providers: [UniversidadService, UniversidadRepository],
})
export class UniversidadModule {}
