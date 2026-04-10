import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  HttpStatus, 
  HttpCode 
} from '@nestjs/common';
import { FamiliaService } from './familia.service';
import { CreateFamiliaDto } from './dto/create-familia.dto';
import { UpdateFamiliaDto } from './dto/update-familia.dto';

@Controller('familia')
export class FamiliaController {
  constructor(private readonly familiaService: FamiliaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createFamiliaDto: CreateFamiliaDto) {
    return await this.familiaService.create(createFamiliaDto);
  }

  @Get()
  async findAll() {
    return await this.familiaService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.familiaService.findOne(id);
  }

  @Get('estudiante/:estudianteId')
  async findByEstudiante(@Param('estudianteId') estudianteId: string) {
    return await this.familiaService.findByEstudiante(estudianteId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateFamiliaDto: UpdateFamiliaDto) {
    return await this.familiaService.update(id, updateFamiliaDto);
  }

  // === ENDPOINTS DE DESCRIPCIÓN ELIMINADOS ===
  // addDescripcionMadre, addDescripcionPadre, updateDescripcionMadre, deleteDescripcionMadre,
  // updateDescripcionPadre, deleteDescripcionPadre eliminados
  // Los campos fueron migrados a la tabla normalizada 'familiar'
  // Usar los endpoints de FamiliarController para gestionar familiares individuales

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.familiaService.remove(id);
  }
}
