import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UniversidadService } from './universidad.service';
import { CreateUniversidadDto } from './dto/create-universidad.dto';
import { UpdateUniversidadDto } from './dto/update-universidad.dto';

@Controller('universidad')
export class UniversidadController {
  constructor(private readonly universidadService: UniversidadService) {}

  @Post()
  create(@Body() createUniversidadDto: CreateUniversidadDto) {
    return this.universidadService.create(createUniversidadDto);
  }

  @Get()
  findAll() {
    return this.universidadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.universidadService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUniversidadDto: UpdateUniversidadDto) {
    return this.universidadService.update(+id, updateUniversidadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.universidadService.remove(+id);
  }
}
