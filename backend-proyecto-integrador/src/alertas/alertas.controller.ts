import { Controller, Get, Param } from '@nestjs/common';
import { AlertasService } from './alertas.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRol } from '@prisma/client';

@Controller('alertas')
@Roles(UserRol.ADMIN, UserRol.TUTOR, UserRol.VISITA)
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  @Get()
  getAllAlertas() {
    return this.alertasService.getAllAlertas();
  }

  @Get('estudiante/:rut')
  getAllAlertasByEstudiante(@Param('rut') rut: string) {
    return this.alertasService.getAllAlertasByEstudiante(rut);
  }

  @Get('generacion/:generacion')
  getAlertasByGeneracion(@Param('generacion') generacion: string) {
    return this.alertasService.getAlertasByGeneracion(generacion);
  }
}
