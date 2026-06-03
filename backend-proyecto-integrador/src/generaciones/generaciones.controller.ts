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

@Controller('generacion')
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
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.generacionesService.remove(id);
  }
}
