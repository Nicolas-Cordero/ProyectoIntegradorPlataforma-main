import { Injectable } from '@nestjs/common';
import type { Content } from 'pdfmake';
import { IPdfGenerator } from '../interfaces';
import { CreatePdfSemestreDto } from '../dto';
import { InformeBuilder } from '../builders/pdf-layout.builder';
import { PdfPrinterProvider } from '../providers/pdf-printer.provider';

function semLabel(tipo: string, codigo: string, year: number): string {
  if (tipo === 'REGULAR') {
    return `${year} — ${codigo === '1' ? 'Primer semestre' : 'Segundo semestre'}`;
  }
  return `${year} — Rec. ${codigo === 'INVIERNO' ? 'Invierno' : 'Verano'}`;
}

@Injectable()
export class PdfSemestreGenerator implements IPdfGenerator<CreatePdfSemestreDto> {

  constructor(private readonly printer: PdfPrinterProvider) {}

  async pdfGenerate(dto: CreatePdfSemestreDto): Promise<Buffer> {
    const { nombreEstudiante, rutEstudiante, carrera, semestre, ramos, resumen } = dto;

    const etiquetaSem = semLabel(semestre.tipo, semestre.codigo, semestre.year);
    const estadoSem   = semestre.abierto ? 'En curso' : 'Cerrado';

    const headers = ['Ramo', 'Nota final', ...(semestre.abierto ? [] : ['Estado'])];
    const widths: (string | number)[] = ['*', 70, ...(semestre.abierto ? [] : [90])];
    const filas = ramos.map(r => [
      r.intento > 1 ? `${r.nombre} (${r.intento}° intento)` : r.nombre,
      r.nota_final !== null ? r.nota_final.toFixed(1) : '—',
      ...(semestre.abierto ? [] : [r.estado]),
    ]);

    const content: Content[] = [
      InformeBuilder.headerBuilder('Informe Semestral'),
      InformeBuilder.paragrafBuilder(
        `Estudiante: ${nombreEstudiante}   ·   RUT: ${rutEstudiante}   ·   Carrera: ${carrera.nombre}`,
      ),
      InformeBuilder.paragrafBuilder(
        `Semestre: ${etiquetaSem}   ·   Estado: ${estadoSem}`,
      ),
      InformeBuilder.tableBuilder(headers, filas, widths),
    ];

    if (!semestre.abierto) {
      const promedioStr = resumen.promedio !== null ? resumen.promedio.toFixed(1) : '—';
      content.push(
        InformeBuilder.paragrafBuilder(
          `Aprobados: ${resumen.aprobados}   ·   Reprobados: ${resumen.reprobados}   ·   Eliminados: ${resumen.eliminados}   ·   Promedio: ${promedioStr}`,
        ),
      );
    }

    const docDefinition = {
      content,
      footer: () => InformeBuilder.footerBuilder(),
      styles: InformeBuilder.styles,
    };

    return this.printer.createPdf(docDefinition);
  }
}
