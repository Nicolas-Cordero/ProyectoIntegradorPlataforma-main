import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { BeneficioEstudianteService } from './beneficio-estudiante.service';
import { CreateBeneficioEstudianteDto } from './dto/create-beneficio-estudiante.dto';
import { UpdateBeneficioEstudianteDto } from './dto/update-beneficio-estudiante.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRol } from '@prisma/client';

@Controller('beneficios/estudiantes')
@Roles(UserRol.ADMIN, UserRol.TUTOR, UserRol.VISITA)
export class BeneficioEstudianteController {
  constructor(private readonly beneficioEstudianteService: BeneficioEstudianteService) {}


  /**Deberia quedar algo asi.
  GET    /estudiantes/:estudianteId/beneficios
  GET    /estudiantes/:estudianteId/beneficios/:beneficioId
  POST   /estudiantes/:estudianteId/beneficios
  PATCH  /estudiantes/:estudianteId/beneficios/:id   // relación
  DELETE /estudiantes/:estudianteId/beneficios/:id
  */


  @Post(':id_beneficio/:rut_estudiante')
  @Roles(UserRol.ADMIN, UserRol.TUTOR)
  create(@Body() createBeneficioEstudianteDto: CreateBeneficioEstudianteDto) {
    return this.beneficioEstudianteService.createAsociation(createBeneficioEstudianteDto);
  }

  @Get()
  findAll() {
    return this.beneficioEstudianteService.findAllAsociations();
  }

  @Get(':id_beneficio')
  findEstudiantesByBeneficio(@Param('id_beneficio', ParseIntPipe) codigo_beneficio: number) {
    return this.beneficioEstudianteService.findEstudiantesByBeneficio(codigo_beneficio);
  }

  @Get('rut/:rut_estudiante')
  findBeneficiosByEstudiante(@Param('rut_estudiante') rut_estudiante: string) {
    return this.beneficioEstudianteService.findBeneficiosByEstudiante(rut_estudiante);
  }

  @Get(':id_beneficio/:rut_estudiante')
  findOneAsociation(
    @Param('id_beneficio', ParseIntPipe) codigo_beneficio: number,
    @Param('rut_estudiante') rut_estudiante: string) {
    return this.beneficioEstudianteService.findOneAsociation(codigo_beneficio, rut_estudiante);
  }

  @Patch(':id_beneficio/:rut_estudiante')
  @Roles(UserRol.ADMIN, UserRol.TUTOR)
  update(
    @Param('id_beneficio', ParseIntPipe) codigo_beneficio: number,
    @Param('rut_estudiante') rut_estudiante: string,
    @Body() updateBeneficioEstudianteDto: UpdateBeneficioEstudianteDto) {
      return this.beneficioEstudianteService.update(codigo_beneficio, rut_estudiante, updateBeneficioEstudianteDto)
  }

  @Delete(':id_beneficio/:rut_estudiante')
  @Roles(UserRol.ADMIN, UserRol.TUTOR)
  remove(
    @Param('id_beneficio', ParseIntPipe) codigo_beneficio: number,
    @Param('rut_estudiante') rut_estudiante: string,
    
  ) {
    return this.beneficioEstudianteService.remove(codigo_beneficio, rut_estudiante);
  }

}
