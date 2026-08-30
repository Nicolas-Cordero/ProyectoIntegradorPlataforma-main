import { Module } from '@nestjs/common';
import { BeneficioEstudianteService } from './beneficio-estudiante.service';
import { BeneficioEstudianteController } from './beneficio-estudiante.controller';
import { BeneficioEstudianteRepository } from './beneficio-estudiante.repository';
import { BeneficiosModule } from '../beneficios';
import { EstudianteModule } from '../estudiante';

@Module({
  // Se importan los módulos dueños de cada repositorio en vez de re-declararlos
  // como providers propios, que creaba una segunda instancia de cada uno.
  imports: [BeneficiosModule, EstudianteModule],
  controllers: [BeneficioEstudianteController],
  providers: [BeneficioEstudianteService, BeneficioEstudianteRepository],
})
export class BeneficioEstudianteModule {}
