import { Module } from '@nestjs/common';
import { BeneficioEstudianteService } from './beneficio-estudiante.service';
import { BeneficioEstudianteController } from './beneficio-estudiante.controller';
import { BeneficioEstudianteRepository } from './beneficio-estudiante.repository';
import { BeneficiosRepository } from '../beneficios';
import { EstudianteRepository } from '../estudiante';

@Module({
  controllers: [BeneficioEstudianteController],
  providers: [
    BeneficioEstudianteService,
    BeneficioEstudianteRepository,
    EstudianteRepository,
    BeneficiosRepository
  ],
})
export class BeneficioEstudianteModule {}
