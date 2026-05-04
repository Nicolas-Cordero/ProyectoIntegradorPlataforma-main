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
import { BeneficiosService } from './beneficios.service';
import {
  CreateBeneficioDto,
  UpdateBeneficioDto,
} from './dto';



@Controller('beneficios')
export class BeneficiosController {
  constructor(private readonly beneficiosService: BeneficiosService) {}

  // === CATÁLOGO DE BENEFICIOS ===



  //metodo  para crear nuevos beneficios.
  @Post()
  createBeneficio(@Body() createDto: CreateBeneficioDto) {
    return this.beneficiosService.createBeneficio(createDto);
  }



//metodo para obtener todos los beneficios disponibles.
  @Get()
  findAllBeneficios() {
    return this.beneficiosService.findAllBeneficios();
  }





//este metodo si tiene sentido debido a que busca un beneficio segun su id.
  @Get(':id')
  findBeneficio(@Param('id', ParseIntPipe) id: number) {
    return this.beneficiosService.findBeneficioById(id);
  }





//tiene sentido debido a que lo actualiza
  @Patch(':id')
  updateBeneficio(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBeneficioDto,
  ) {
    return this.beneficiosService.updateBeneficio(id, updateDto);
  }




//lo remueve
  @Delete(':id')
  removeBeneficio(@Param('id', ParseIntPipe) id: number) {
    return this.beneficiosService.removeBeneficio(id);
  }

}
