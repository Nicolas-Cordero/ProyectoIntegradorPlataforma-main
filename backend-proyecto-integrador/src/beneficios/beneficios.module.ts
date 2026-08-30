import { Module } from '@nestjs/common';
import { BeneficiosService } from './beneficios.service';
import { BeneficiosController } from './beneficios.controller';
import { BeneficiosRepository } from './beneficios.repository';

@Module({
  controllers: [BeneficiosController],
  providers: [BeneficiosService, BeneficiosRepository],
  exports: [BeneficiosService, BeneficiosRepository],
})
export class BeneficiosModule {}
