import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { FamiliarService } from './familiar.service';
import {
  CreateFamiliarDto,
  UpdateFamiliarDto,
} from './dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRol } from '@prisma/client';

@Controller('familiar')
@Roles(UserRol.ADMIN, UserRol.TUTOR)
export class FamiliarController {
  constructor(private readonly familiarService: FamiliarService) {}


  @Post()
  create(@Body() createDto: CreateFamiliarDto) {
    return this.familiarService.create(createDto);
  }

  @Get(':id_familiar')
  @Roles(UserRol.ADMIN, UserRol.TUTOR, UserRol.VISITA)
  findOne(@Param('id_familiar', ParseIntPipe) id_familiar: number) {
    return this.familiarService.findOne(id_familiar);
  }

  @Get('estudiante/:rut_estudiante')
  @Roles(UserRol.ADMIN, UserRol.TUTOR, UserRol.VISITA)
  findByEstudiante(@Param('rut_estudiante') rut_estudiante: string) {
    return this.familiarService.findByEstudiante(rut_estudiante);
  }

  @Patch(':id_familiar')
  update(
    @Param('id_familiar', ParseIntPipe) id_familiar: number,
    @Body() updateDto: UpdateFamiliarDto,
  ) {
    return this.familiarService.update(id_familiar, updateDto);
  }

  @Delete(':id_familiar')
  remove(@Param('id_familiar', ParseIntPipe) id_familiar: number) {
    return this.familiarService.remove(id_familiar);
  }
}
