import { Module } from '@nestjs/common';
import { AlertasService } from './alertas.service';
import { AlertaEntrevistaService } from './alerta-entrevista.service';
import { AlertaNotasService } from './alerta-notas.service';
import { AlertaAcuerdoService } from './alerta-acuerdo.service';
import { AlertasController } from './alertas.controller';
import { AlertasRepository } from './alertas.repository';

@Module({
  controllers: [AlertasController],
  providers: [
    AlertasService,
    AlertaEntrevistaService,
    AlertaNotasService,
    AlertaAcuerdoService,
    AlertasRepository,
  ],
})
export class AlertasModule {}
