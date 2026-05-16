import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';

@Controller('estudiante')
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

  @Post()
  create(@Body() createEstudianteDto: CreateEstudianteDto) {
    return this.estudianteService.create(createEstudianteDto);
  }

  @Get()
  findAll() {
    return this.estudianteService.findAll();
  }


  @Get('generaciones/:generation')
  findByGeneration(@Param('generation') generation: string) {
    return this.estudianteService.findByGeneration(generation);
  }

  @Get('generaciones/')
  findAllGenerations() {
    return this.estudianteService.findSortedByGeneration();
  }

// Revisar las de abajo
  @Get(':rut_estudiante/simple')
  findOne(@Param('rut_estudiante') rut_estudiante: string) {
    return this.estudianteService.findOneSimple(rut_estudiante);
  }

  @Get(':rut_estudiante/complete')
  findOneComplete(@Param('rut_estudiante') rut_estudiante: string) {
    return this.estudianteService.findOneComplete(rut_estudiante);
  }

  @Patch(':rut_estudiante')
  update(@Param('rut_estudiante') rut_estudiante: string, @Body() updateEstudianteDto: UpdateEstudianteDto) {
    return this.estudianteService.update(rut_estudiante, updateEstudianteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estudianteService.remove(id);
  }


  // @Get('estadisticas')
  // findStadistics(){
  //   return this.estudianteService.findStadistics();
  // }
}
