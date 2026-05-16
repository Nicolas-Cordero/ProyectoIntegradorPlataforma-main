import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ComentarioService } from './comentario.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { Topico } from '@prisma/client';

@Controller('comentario')
export class ComentarioController {
  constructor(private readonly comentarioService: ComentarioService) {}

  @Post()
  create(@Body() createComentarioDto: CreateComentarioDto) {
    return this.comentarioService.create(createComentarioDto);
  }

  @Get(':entrevista')
  findAllByEntrevista(@Param('entrevista', ParseIntPipe) id_entrevista: number) {
    return this.comentarioService.findAllByEntrevista(id_entrevista);
  }


  @Get()
  findAllByTopico(
    @Query('topico') topico: Topico,
    @Query('estudiante') rut_estudiante: string,
  ) {
    return this.comentarioService.findAllByTopico(topico, rut_estudiante);
  }

  @Get(':estudiante')
  findByEstudiante(@Param('esttudiante') rut_estudiante: string) {
    return this.comentarioService.findAllByEstudiante(rut_estudiante);
  }

  @Get(':comentario')
  findOne(@Param('comentario', ParseIntPipe) id_comentario: number) {
    return this.comentarioService.findOne(id_comentario);
  }

  @Patch(':comentario')
  update(@Param('comentario', ParseIntPipe) id_comentario: number, @Body() updateComentarioDto: UpdateComentarioDto) {
    return this.comentarioService.update(id_comentario, updateComentarioDto);
  }

  @Delete(':comentario')
  remove(@Param('comentario',ParseIntPipe) id_comentario: number) {
    return this.comentarioService.remove(id_comentario);
  }
}
