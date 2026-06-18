import { Injectable } from '@nestjs/common';
import { IPdfGenerator } from '../interfaces';
import { CreatePdfAcademicoDto } from '../dto';
import { InformeBuilder } from '../builders/pdf-layout.builder';
import { PdfPrinterProvider } from '../providers/pdf-printer.provider';

const ESTADO_LABEL: Record<string, string> = {
  EN_CURSO:  'En curso',
  CERRADO:   'Cerrado',
  SIN_RAMOS: 'Sin ramos',
};

const TIPO_LABEL: Record<string, (codigo: string) => string> = {
  REGULAR:      (c) => c === '1' ? 'Primer semestre' : 'Segundo semestre',
  RECUPERATIVO: (c) => `Rec. ${c === 'INVIERNO' ? 'Invierno' : 'Verano'}`,
};

@Injectable()
export class PdfAcademicoGenerator implements IPdfGenerator<CreatePdfAcademicoDto> {

  constructor(private readonly printer: PdfPrinterProvider) {}

  async pdfGenerate(dto: CreatePdfAcademicoDto): Promise<Buffer> {
    const { nombreEstudiante, rutEstudiante, carrera, resumen, semestres } = dto;

    const pct = (n: number) =>
      resumen.totalRamos > 0
        ? ` (${((n / resumen.totalRamos) * 100).toFixed(1)}%)`
        : '';

    const docDefinition = {
      content: [
        InformeBuilder.headerBuilder('Informe Académico'),
        InformeBuilder.paragrafBuilder(
          `Estudiante: ${nombreEstudiante}   ·   RUT: ${rutEstudiante}   ·   Carrera: ${carrera.nombre}   ·   Duración: ${carrera.duracion_sem} semestres`,
        ),
        { text: 'Resumen general', style: 'header', margin: [0, 8, 0, 6] as [number, number, number, number] },
        InformeBuilder.tableBuilder(
          ['Indicador', 'Valor'],
          [
            ['Semestres finalizados', String(resumen.semFinalizados)],
            ['Duración carrera',      `${carrera.duracion_sem} sem.`],
            ['Ramos aprobados',       `${resumen.ramosAprobados}${pct(resumen.ramosAprobados)}`],
            ['Ramos reprobados',      `${resumen.ramosReprobados}${pct(resumen.ramosReprobados)}`],
            ['Ramos en curso',        `${resumen.ramosCursando}${pct(resumen.ramosCursando)}`],
            ['Ramos eliminados',      `${resumen.ramosEliminados}${pct(resumen.ramosEliminados)}`],
            ['Promedio general',      resumen.promedioGeneral !== null ? resumen.promedioGeneral.toFixed(2) : '—'],
          ],
          ['*', '*'],
        ),
        { text: 'Detalle por semestre', style: 'header', margin: [0, 16, 0, 6] as [number, number, number, number] },
        InformeBuilder.tableBuilder(
          ['N°', 'Tipo', 'Año', 'Estado', 'Ramos', 'Aprobados', 'Reprobados', 'Eliminados'],
          semestres.map((sem, idx) => [
            String(idx + 1),
            TIPO_LABEL[sem.tipo]?.(sem.codigo) ?? sem.tipo,
            String(sem.year),
            ESTADO_LABEL[sem.estado]  ?? sem.estado,
            String(sem.totalRamos),
            String(sem.aprobados),
            String(sem.reprobados),
            String(sem.eliminados),
          ]),
          [20, 110, 40, 65, 45, 65, 65, 65],
        ),
      ],
      footer: () => InformeBuilder.footerBuilder(),
      styles: InformeBuilder.styles,
    };

    return this.printer.createPdf(docDefinition);
  }
}
