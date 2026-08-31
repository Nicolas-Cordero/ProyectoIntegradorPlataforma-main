import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ComentarioService } from './comentario.service';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { UserRol } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

// POST /comentario deshabilitado intencionalmente: los comentarios se crean
// siempre junto con la entrevista (nested create en POST /entrevistas).
@Controller('comentario')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRol.ADMIN, UserRol.TUTOR)
export class ComentarioController {
  constructor(private readonly comentarioService: ComentarioService) {}

  @Get('entrevista/:id_entrevista')
  findAllByEntrevista(
    @Param('id_entrevista', ParseIntPipe) id_entrevista: number,
  ) {
    return this.comentarioService.findAllByEntrevista(id_entrevista);
  }

  @Get('estudiante/:rut_estudiante')
  findByEstudiante(@Param('rut_estudiante') rut_estudiante: string) {
    return this.comentarioService.findAllByEstudiante(rut_estudiante);
  }

  @Get(':id_comentario')
  findOne(@Param('id_comentario', ParseIntPipe) id_comentario: number) {
    return this.comentarioService.findOne(id_comentario);
  }

  @Patch(':comentario')
  update(
    @Param('comentario', ParseIntPipe) id_comentario: number,
    @Body() updateComentarioDto: UpdateComentarioDto,
  ) {
    return this.comentarioService.update(id_comentario, updateComentarioDto);
  }

  @Delete(':comentario')
  @Roles(UserRol.ADMIN)
  remove(@Param('comentario', ParseIntPipe) id_comentario: number) {
    return this.comentarioService.remove(id_comentario);
  }
}
