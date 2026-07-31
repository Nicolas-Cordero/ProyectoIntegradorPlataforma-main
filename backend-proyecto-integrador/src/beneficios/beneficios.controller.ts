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
import { CreateBeneficioDto, UpdateBeneficioDto } from './dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRol } from '@prisma/client';

@Controller('beneficios')
@Roles(UserRol.ADMIN, UserRol.TUTOR, UserRol.VISITA)
export class BeneficiosController {
  constructor(private readonly beneficiosService: BeneficiosService) {}

  // === CATÁLOGO DE BENEFICIOS ===
  // Lectura (GET) abierta a los tres roles, igual que en BeneficioEstudianteController
  // — un TUTOR ya puede asignar beneficios y necesita ver el catálogo para elegir uno.
  // Escritura (crear/editar/eliminar el catálogo en sí) sigue restringida a ADMIN.

  //metodo  para crear nuevos beneficios.
  @Post()
  @Roles(UserRol.ADMIN)
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
  @Roles(UserRol.ADMIN)
  updateBeneficio(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBeneficioDto,
  ) {
    return this.beneficiosService.updateBeneficio(id, updateDto);
  }

  //lo remueve
  @Delete(':id')
  @Roles(UserRol.ADMIN)
  removeBeneficio() {
    return this.beneficiosService.removeBeneficio();
  }
}
