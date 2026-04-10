import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialAcademicoService } from './historial_academico.service';
import { HistorialAcademicoController } from './historial_academico.controller';
import { HistorialAcademico } from './entities/historial_academico.entity';
import { Estudiante } from '../estudiante/entities/estudiante.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HistorialAcademico, Estudiante]),
  ],
  controllers: [HistorialAcademicoController],
  providers: [HistorialAcademicoService],
  exports: [HistorialAcademicoService],
})
export class HistorialAcademicoModule {}
