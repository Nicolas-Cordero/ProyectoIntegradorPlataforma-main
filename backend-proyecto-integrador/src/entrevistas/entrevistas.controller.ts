import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { EntrevistasService } from './entrevistas.service';
import { CreateEntrevistaDto } from './dto/create-entrevista.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRol } from '@prisma/client';
import { UpdateEntrevistaDto } from './dto';



@Controller('entrevistas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRol.ADMIN, UserRol.TUTOR)
export class EntrevistasController {
  constructor(private readonly entrevistasService: EntrevistasService) {}


  //Creación de una entrevista
  @Post()
  create(
    @Body() createEntrevistaDto: CreateEntrevistaDto,
  ) {
    return this.entrevistasService.create(createEntrevistaDto);
  }



  //Elimina una entrevista
  @Delete(':id_entrevista')
  delete(@Param('id_entrevista', ParseIntPipe) id_entrevista: number) {
    return this.entrevistasService.deleteEntrevista(id_entrevista);
  }


  //Busca todas las entrevistas
  @Get()
  findAll() {
    return this.entrevistasService.findAll();
  }



  //Busca todas las entrevistas
  @Get(':estudiante')
  findAllByEstudiante(@Param('estudiante') rut_estudiante: string) {
    return this.entrevistasService.findAllByEstudiante(rut_estudiante);
  }


  //encuentra una entrevista por id
  @Get(':id_entrevista')
  findOne(@Param('id_entrevista', ParseIntPipe) id_entrevista: number) {
    return this.entrevistasService.findOne(id_entrevista);
  }





  //actualiza una entrevista
  @Patch(':id_entrevista')
  async update(
    @Param('id_entrevista', ParseIntPipe) id_entrevista: number,
    @Body() updateEntrevistaDto: UpdateEntrevistaDto ,
  ) {
    return this.entrevistasService.updateEntrevista(id_entrevista, updateEntrevistaDto);
  }

}
