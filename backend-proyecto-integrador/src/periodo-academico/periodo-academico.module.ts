import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeriodoAcademicoService } from './periodo-academico.service';
import { PeriodoAcademicoController } from './periodo-academico.controller';
import { PeriodoAcademico } from './entities/periodo-academico.entity';
import { PeriodoAcademicoEstudiante } from './entities/periodo-academico-estudiante.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PeriodoAcademico, PeriodoAcademicoEstudiante])],
  controllers: [PeriodoAcademicoController],
  providers: [PeriodoAcademicoService],
  exports: [PeriodoAcademicoService],
})
export class PeriodoAcademicoModule {}
