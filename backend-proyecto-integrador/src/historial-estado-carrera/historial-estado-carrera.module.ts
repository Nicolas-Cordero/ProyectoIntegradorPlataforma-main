import { Module } from '@nestjs/common';
import { HistorialEstadoCarreraController } from './historial-estado-carrera.controller';
import { HistorialEstadoCarreraRepository } from './historial-estado-carrera.repository';
import { HistorialEstadoCarreraService } from './historial-estado-carrera.service';

@Module({
  controllers: [HistorialEstadoCarreraController],
  providers: [HistorialEstadoCarreraService, HistorialEstadoCarreraRepository],
  exports: [HistorialEstadoCarreraService],
})
export class HistorialEstadoCarreraModule {}
