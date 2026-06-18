import { Injectable } from '@nestjs/common';
import { IPdfGenerator } from '../interfaces';
import { CreatePdfEstadisticasDto } from '../dto';
import { InformeBuilder } from '../builders/pdf-layout.builder';
import { PdfPrinterProvider } from '../providers/pdf-printer.provider';

const fmtPct = (n: number) => `${n.toFixed(1).replace('.', ',')}%`;

@Injectable()
export class PdfEstadisticasGenerator implements IPdfGenerator<CreatePdfEstadisticasDto> {

  constructor(private readonly printer: PdfPrinterProvider) {}

  async pdfGenerate(dto: CreatePdfEstadisticasDto): Promise<Buffer> {
    const { kpis, estadoData, generoData, porGeneracion, cohorteData } = dto;

    const docDefinition = {
      content: [
        InformeBuilder.headerBuilder('Informe de Estadísticas del Programa'),

        { text: 'Indicadores clave', style: 'header', margin: [0, 8, 0, 6] as [number, number, number, number] },
        InformeBuilder.tableBuilder(
          ['Indicador', 'Valor'],
          [
            ['Total histórico',        String(kpis.total)],
            ['En el programa',         `${kpis.activos} (activos + condicionales)`],
            ['Titulados',              String(kpis.titulados)],
            ['Egresados',              String(kpis.egresados)],
            ['Retirados',              String(kpis.retirados)],
            ['Tasa de deserción',      fmtPct(kpis.tasaDesercion)],
            [kpis.nuevosAño ? `Nuevos ${kpis.nuevosAño}` : 'Última generación', String(kpis.nuevos)],
          ],
          ['*', 140],
        ),

        { text: 'Situación académica actual', style: 'header', margin: [0, 16, 0, 6] as [number, number, number, number] },
        InformeBuilder.tableBuilder(
          ['Estado', 'Cantidad', 'Porcentaje'],
          estadoData.map(d => [d.label, String(d.count), fmtPct(d.pct)]),
          ['*', 80, 90],
        ),

        { text: 'Composición por género', style: 'header', margin: [0, 16, 0, 6] as [number, number, number, number] },
        InformeBuilder.tableBuilder(
          ['Género', 'Cantidad', 'Porcentaje'],
          generoData.map(d => [d.label, String(d.count), fmtPct(d.pct)]),
          ['*', 80, 90],
        ),

        { text: 'Becarios por generación de ingreso', style: 'header', margin: [0, 16, 0, 6] as [number, number, number, number] },
        InformeBuilder.tableBuilder(
          ['Generación', 'Cantidad'],
          porGeneracion.map(g => [String(g.año), String(g.count)]),
          [120, '*'],
        ),

        { text: 'Estado actual por cohorte', style: 'header', margin: [0, 16, 0, 6] as [number, number, number, number] },
        InformeBuilder.tableBuilder(
          ['Cohorte', 'Total', ...cohorteData.estados],
          cohorteData.rows.map(r => [
            String(r.año),
            String(r.total),
            ...cohorteData.estados.map(est => String(r.counts[est] ?? 0)),
          ]),
        ),
      ],
      footer: () => InformeBuilder.footerBuilder(),
      styles: InformeBuilder.styles,
    };

    return this.printer.createPdf(docDefinition);
  }
}
