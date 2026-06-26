import { Module } from '@nestjs/common';
import { PdfGeneratorService } from './pdf-generator.service';
import { PdfGeneratorController } from './pdf-generator.controller';
import { PdfAcademicoGenerator } from './services/pdf-academico.service';
import { PdfEntrevistaGenerator } from './services/pdf-entrevista.service';
import { PdfEntrevistaResumenGenerator } from './services/pdf-entrevista-resumen.service';
import { PdfSemestreGenerator } from './services/pdf-semestre.service';
import { PdfEstadisticasGenerator } from './services/pdf-estadisticas.service';
import { PdfAcuerdoGenerator } from './services/pdf-acuerdo.service';
import { PdfPrinterProvider } from './providers/pdf-printer.provider';

@Module({
  controllers: [PdfGeneratorController],
  providers: [
    PdfPrinterProvider,
    PdfGeneratorService,
    PdfAcademicoGenerator,
    PdfEntrevistaGenerator,
    PdfEntrevistaResumenGenerator,
    PdfSemestreGenerator,
    PdfEstadisticasGenerator,
    PdfAcuerdoGenerator,
  ],
})
export class PdfGeneratorModule {}
