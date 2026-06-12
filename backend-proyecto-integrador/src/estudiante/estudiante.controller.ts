import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRol } from '@prisma/client';

@Controller('estudiante')
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

  @Post()
  @Roles(UserRol.ADMIN)
  create(@Body() createEstudianteDto: CreateEstudianteDto) {
    return this.estudianteService.create(createEstudianteDto);
  }

  @Get()
  @Roles(UserRol.ADMIN, UserRol.TUTOR, UserRol.VISITA)
  findAll() {
    return this.estudianteService.findAll();
  }


  @Get('generacion/:generacion_id')
  @Roles(UserRol.ADMIN, UserRol.TUTOR, UserRol.VISITA)
  findByGeneracion(@Param('generacion_id', ParseIntPipe) generacion_id: number) {
    return this.estudianteService.findByGeneracion(generacion_id);
  }

// Revisar las de abajo
  @Get(':rut_estudiante/simple')
  @Roles(UserRol.ADMIN, UserRol.TUTOR, UserRol.VISITA)
  findOne(@Param('rut_estudiante') rut_estudiante: string) {
    return this.estudianteService.findOneSimple(rut_estudiante);
  }

  @Get(':rut_estudiante/complete')
  @Roles(UserRol.ADMIN, UserRol.TUTOR, UserRol.VISITA)
  findOneComplete(@Param('rut_estudiante') rut_estudiante: string) {
    return this.estudianteService.findOneComplete(rut_estudiante);
  }

  @Patch(':rut_estudiante')
  @Roles(UserRol.ADMIN, UserRol.TUTOR)
  update(@Param('rut_estudiante') rut_estudiante: string, @Body() updateEstudianteDto: UpdateEstudianteDto) {
    return this.estudianteService.update(rut_estudiante, updateEstudianteDto);
  }

  @Delete(':id')
  @Roles(UserRol.ADMIN)
  remove(@Param('id') id: string) {
    return this.estudianteService.remove(id);
  }


  // @Get('estadisticas')
  // findStadistics(){
  //   return this.estudianteService.findStadistics();
  // }
}
