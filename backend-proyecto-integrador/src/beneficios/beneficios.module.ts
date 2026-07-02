import { Module } from '@nestjs/common';
import { BeneficiosService } from './beneficios.service';
import { BeneficiosController } from './beneficios.controller';
import { BeneficiosRepository } from './beneficios.repository';

@Module({
  imports: [],
  controllers: [BeneficiosController],
  providers: [BeneficiosService, BeneficiosRepository],
  exports: [BeneficiosService],
})
export class BeneficiosModule {}
