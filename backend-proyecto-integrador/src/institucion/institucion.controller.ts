import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InstitucionService } from './institucion.service';
import { CreateInstitucionDto } from './dto/create-institucion.dto';
import { UpdateInstitucionDto } from './dto/update-institucion.dto';

@Controller('institucion')
export class InstitucionController {
  constructor(private readonly institucionService: InstitucionService) {}

  @Post()
  create(@Body() createInstitucionDto: CreateInstitucionDto) {
    return this.institucionService.create(createInstitucionDto);
  }

  @Get()
  findAll() {
    return this.institucionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.institucionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInstitucionDto: UpdateInstitucionDto) {
    return this.institucionService.update(id, updateInstitucionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.institucionService.remove(id);
  }
}
