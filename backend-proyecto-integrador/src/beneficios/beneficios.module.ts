import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeneficiosService } from './beneficios.service';
import { BeneficiosController } from './beneficios.controller';
import { Beneficio } from './entities/beneficio.entity';
import { BeneficioEstudiante } from './entities/beneficio-estudiante.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Beneficio, BeneficioEstudiante])],
  controllers: [BeneficiosController],
  providers: [BeneficiosService],
  exports: [BeneficiosService],
})
export class BeneficiosModule {}
