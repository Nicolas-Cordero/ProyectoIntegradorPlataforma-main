import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { UniversidadService } from './universidad.service';
import { CreateUniversidadDto } from './dto/create-universidad.dto';
import { UpdateUniversidadDto } from './dto/update-universidad.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRol } from '@prisma/client';

@Controller('universidad')
export class UniversidadController {
  constructor(private readonly universidadService: UniversidadService) {}

  @Post()
  @Roles(UserRol.ADMIN)
  create(@Body() createUniversidadDto: CreateUniversidadDto) {
    return this.universidadService.create(createUniversidadDto);
  }

  @Get()
  findAll() {
    return this.universidadService.findAll();
  }

  @Get(':id_universidad')
  findOne(@Param('id_universidad', ParseIntPipe) id_universidad: number) {
    return this.universidadService.findOne(id_universidad);
  }

  @Get('comuna/:comuna')
  findByComuna(@Param('comuna') comuna: string) {
    return this.universidadService.findByComuna(comuna);
  }

  @Get('estudiante/:rut_estudiante')
  findByEstudiante(@Param('rut_estudiante') rut_estudiante: string) {
    return this.universidadService.findByEstudiante(rut_estudiante);
  }

  @Patch(':id_universidad')
  @Roles(UserRol.ADMIN)
  update(@Param('id_universidad', ParseIntPipe) id_universidad: number, @Body() updateUniversidadDto: UpdateUniversidadDto) {
    return this.universidadService.update(id_universidad, updateUniversidadDto);
  }

  @Delete(':id_universidad')
  @Roles(UserRol.ADMIN)
  remove(@Param('id_universidad', ParseIntPipe) id_universidad: number) {
    return this.universidadService.remove(id_universidad);
  }
}
