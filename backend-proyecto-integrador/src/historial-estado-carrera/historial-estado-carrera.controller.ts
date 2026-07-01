import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { UserRol } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/auth.interfaces';
import { CreateHistorialEstadoCarreraDto } from './dto';
import { HistorialEstadoCarreraService } from './historial-estado-carrera.service';

@Controller('historial-estado-carrera')
export class HistorialEstadoCarreraController {
  constructor(private readonly service: HistorialEstadoCarreraService) {}

  @Post()
  @Roles(UserRol.ADMIN, UserRol.TUTOR)
  cambiarEstado(
    @Body() dto: CreateHistorialEstadoCarreraDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.cambiarEstado(dto, user.rut_usuario);
  }

  @Get('carrera/:codigo_carrera')
  @Roles(UserRol.ADMIN, UserRol.TUTOR, UserRol.VISITA, UserRol.ESTUDIANTE)
  findByCarrera(@Param('codigo_carrera', ParseIntPipe) codigo_carrera: number) {
    return this.service.findByCarrera(codigo_carrera);
  }

  @Get('carrera/:codigo_carrera/semestres-suspendidos')
  @Roles(UserRol.ADMIN, UserRol.TUTOR, UserRol.VISITA, UserRol.ESTUDIANTE)
  async getSemestresSupendidos(@Param('codigo_carrera', ParseIntPipe) codigo_carrera: number) {
    const count = await this.service.getSemestresSupendidos(codigo_carrera);
    return { semestres_suspendidos: count };
  }
}
