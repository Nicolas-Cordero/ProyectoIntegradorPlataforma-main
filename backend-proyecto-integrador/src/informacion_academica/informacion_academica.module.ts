import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InformacionAcademicaService } from './informacion_academica.service';
import { InformacionAcademicaController } from './informacion_academica.controller';
import { InformacionAcademica } from './entities/informacion_academica.entity';
import { Estudiante } from '../estudiante/entities/estudiante.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([InformacionAcademica, Estudiante]),
  ],
  controllers: [InformacionAcademicaController],
  providers: [InformacionAcademicaService],
  exports: [InformacionAcademicaService],
})
export class InformacionAcademicaModule {}
