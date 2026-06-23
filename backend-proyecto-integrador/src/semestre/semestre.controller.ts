import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, HttpCode } from '@nestjs/common';
import { SemestreService } from './semestre.service';
import { CreateSemestreDto } from './dto/create-semestre.dto';
import { LinkCarreraDto } from './dto/link-carrera.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRol } from '@prisma/client';

@Controller('semestre')
export class SemestreController {
  constructor(private readonly semestreService: SemestreService) {}

  @Post()
  @Roles(UserRol.ADMIN)
  create(@Body() createSemestreDto: CreateSemestreDto) {
    return this.semestreService.create(createSemestreDto);
  }

  // Rutas con segmentos literales deben declararse ANTES de las parametrizadas.

  @Get('by-carrera/:codigo_carrera')
  @Roles(UserRol.ADMIN, UserRol.TUTOR, UserRol.ESTUDIANTE)
  getByCarrera(@Param('codigo_carrera', ParseIntPipe) codigo_carrera: number) {
    return this.semestreService.getByCarrera(codigo_carrera);
  }

  @Post('link-carrera')
  @Roles(UserRol.ADMIN, UserRol.TUTOR)
  @HttpCode(200)
  linkCarrera(@Body() dto: LinkCarreraDto) {
    return this.semestreService.linkCarrera(dto.semestre_id, dto.codigo_carrera);
  }

  @Delete('unlink-carrera')
  @Roles(UserRol.ADMIN, UserRol.TUTOR)
  @HttpCode(200)
  unlinkCarrera(@Body() dto: LinkCarreraDto) {
    return this.semestreService.unlinkCarrera(dto.semestre_id, dto.codigo_carrera);
  }

  @Get()
  findAll() {
    return this.semestreService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.semestreService.findOne(id);
  }

  @Delete(':id')
  @Roles(UserRol.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.semestreService.remove(id);
  }
}
