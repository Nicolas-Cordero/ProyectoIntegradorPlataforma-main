import { Controller, Get, Param } from '@nestjs/common';
import { AlertasService } from './alertas.service';

@Controller('alertas')
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
