import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CarreraService } from './carrera.service';
import { CreateCarreraDto } from './dto/create-carrera.dto';
import { UpdateCarreraDto } from './dto/update-carrera.dto';

@Controller('carrera')
export class CarreraController {
  constructor(private readonly carreraService: CarreraService) {}

  @Post()
  create(@Body() createCarreraDto: CreateCarreraDto) {
    return this.carreraService.create(createCarreraDto);
  }


  
  //la dejaremos comentada por ahora.
  // @Get()
  // findAll() {
  //   return this.carreraService.findAll();
  // }


  @Get(':estudiante')
  findByEstudiante(@Param('estudiante') rut_estudiante: string) {
    return this.carreraService.findByEstudiante(rut_estudiante);
  }

  @Get(':codigoCarrera')
  findOne(@Param('codigoCarrera', ParseIntPipe) codigo_carrera: number) {
    return this.carreraService.findOne(+codigo_carrera);
  }

  @Patch(':codigoCarrera')
  update(@Param('codigoCarrera', ParseIntPipe) codigo_carrera: number, @Body() updateCarreraDto: UpdateCarreraDto) {
    return this.carreraService.update(codigo_carrera, updateCarreraDto);
  }

  @Delete(':codigoCarrera')
  remove(@Param('codigoCarrera', ParseIntPipe) codigo_carrera: number) {
    return this.carreraService.remove(codigo_carrera);
  }
}
