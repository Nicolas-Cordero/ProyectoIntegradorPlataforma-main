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
import { GeneracionesService } from './generaciones.service';
import { CreateGeneracionDto } from './dto/create-generacion.dto';
import { UpdateGeneracionDto } from './dto/update-generacion.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRol } from '@prisma/client';

@Controller('generacion')
@Roles(UserRol.ADMIN, UserRol.TUTOR, UserRol.VISITA)
export class GeneracionesController {
  constructor(private readonly generacionesService: GeneracionesService) {}

  @Get()
  getAll() {
    return this.generacionesService.getAll();
  }

  @Get('año/:año')
  getByAño(@Param('año', ParseIntPipe) año: number) {
    return this.generacionesService.getByAño(año);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.generacionesService.getById(id);
  }

  @Post()
  @Roles(UserRol.ADMIN, UserRol.TUTOR)
  create(@Body() createGeneracionDto: CreateGeneracionDto) {
    return this.generacionesService.create(createGeneracionDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGeneracionDto: UpdateGeneracionDto,
  ) {
    return this.generacionesService.update(id, updateGeneracionDto);
  }

  @Delete(':id')
  @Roles(UserRol.ADMIN)
  remove() {
    return this.generacionesService.remove();
  }
}
