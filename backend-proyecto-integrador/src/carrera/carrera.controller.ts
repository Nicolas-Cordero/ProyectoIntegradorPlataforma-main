import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CarreraService } from './carrera.service';
import { CreateCarreraDto } from './dto/create-carrera.dto';
import { UpdateCarreraDto } from './dto/update-carrera.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRol } from '@prisma/client';

@Controller('carrera')
export class CarreraController {
  constructor(private readonly carreraService: CarreraService) {}

  @Post()
  @Roles(UserRol.ADMIN, UserRol.TUTOR)
  create(@Body() createCarreraDto: CreateCarreraDto) {
    return this.carreraService.create(createCarreraDto);
  }


  
  //la dejaremos comentada por ahora.
  // @Get()
  // findAll() {
  //   return this.carreraService.findAll();
  // }


  @Get('estudiante/:rut')
  findByEstudiante(@Param('rut') rut_estudiante: string) {
    return this.carreraService.findByEstudiante(rut_estudiante);
  }

  @Get(':codigoCarrera')
  findOne(@Param('codigoCarrera', ParseIntPipe) codigo_carrera: number) {
    return this.carreraService.findOne(+codigo_carrera);
  }

  @Patch(':codigoCarrera')
  @Roles(UserRol.ADMIN, UserRol.TUTOR)
  update(@Param('codigoCarrera', ParseIntPipe) codigo_carrera: number, @Body() updateCarreraDto: UpdateCarreraDto) {
    return this.carreraService.update(codigo_carrera, updateCarreraDto);
  }

  @Delete(':codigoCarrera')
  @Roles(UserRol.ADMIN, UserRol.TUTOR)
  remove(@Param('codigoCarrera', ParseIntPipe) codigo_carrera: number) {
    return this.carreraService.remove(codigo_carrera);
  }
}
