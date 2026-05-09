import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LiceoService } from './liceo.service';
import { CreateLiceoDto } from './dto/create-liceo.dto';
import { UpdateLiceoDto } from './dto/update-liceo.dto';

@Controller('liceo')
export class LiceoController {
  constructor(private readonly liceoService: LiceoService) {}

  @Post()
  create(@Body() createLiceoDto: CreateLiceoDto) {
    return this.liceoService.create(createLiceoDto);
  }

  @Get()
  findAll() {
    return this.liceoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.liceoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLiceoDto: UpdateLiceoDto) {
    return this.liceoService.update(+id, updateLiceoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.liceoService.remove(+id);
  }
}
