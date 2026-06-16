import { Module } from '@nestjs/common';
import { AcuerdoService } from './acuerdo.service';
import { AcuerdoController } from './acuerdo.controller';
import { AcuerdoRepository } from './acuerdo.repository';

@Module({
  controllers: [AcuerdoController],
  providers: [AcuerdoService, AcuerdoRepository],
  exports: [AcuerdoService],
})
export class AcuerdoModule {}
