import { Module } from '@nestjs/common';
import { BeneficioEstudianteService } from './beneficio-estudiante.service';
import { BeneficioEstudianteController } from './beneficio-estudiante.controller';
import { BeneficioEstudianteRepository } from './beneficio-estudiante.repository';

@Module({
  controllers: [BeneficioEstudianteController],
  providers: [
    BeneficioEstudianteService,
    BeneficioEstudianteRepository
  ],
})
export class BeneficioEstudianteModule {}
