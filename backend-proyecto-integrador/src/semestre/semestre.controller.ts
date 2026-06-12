import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { SemestreService } from './semestre.service';
import { CreateSemestreDto } from './dto/create-semestre.dto';
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
