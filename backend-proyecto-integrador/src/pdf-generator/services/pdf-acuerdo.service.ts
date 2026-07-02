import { Injectable } from '@nestjs/common';
import type { Content } from 'pdfmake';
import { IPdfGenerator } from '../interfaces';
import { CreatePdfAcuerdoDto } from '../dto';
import { InformeBuilder } from '../builders/pdf-layout.builder';
import { PdfPrinterProvider } from '../providers/pdf-printer.provider';

@Injectable()
export class PdfAcuerdoGenerator implements IPdfGenerator<CreatePdfAcuerdoDto> {
  constructor(private readonly printer: PdfPrinterProvider) {}

  async pdfGenerate(dto: CreatePdfAcuerdoDto): Promise<Buffer> {
    const { titulo, subtitulo, abstract: resumen, topicos, version } = dto;

    const seccionesTopicos: Content[] = topicos.flatMap((topico) => [
      {
        text: topico.nombre,
        style: 'header',
        margin: [0, 16, 0, 6] as [number, number, number, number],
      },
      ...topico.puntos.map<Content>((punto) => ({
        text: `• ${punto}`,
        style: 'parrafo',
        margin: [8, 0, 0, 4] as [number, number, number, number],
      })),
    ]);

    const docDefinition = {
      content: [
        InformeBuilder.headerBuilder('Acuerdo de Compromiso'),
        {
          stack: [
            {
              text: titulo,
              fontSize: 18,
              bold: true,
              margin: [0, 0, 0, 4] as [number, number, number, number],
            },
            {
              text: subtitulo,
              fontSize: 12,
              color: 'gray',
              margin: [0, 0, 0, 2] as [number, number, number, number],
            },
            {
              text: `Versión: ${version}`,
              fontSize: 9,
              color: 'gray',
              italics: true,
            },
          ],
          margin: [0, 0, 0, 16] as [number, number, number, number],
        },
        {
          text: 'Resumen',
          style: 'header',
          margin: [0, 0, 0, 6] as [number, number, number, number],
        },
        InformeBuilder.paragrafBuilder(resumen),
        ...seccionesTopicos,
      ],
      footer: () => InformeBuilder.footerBuilder(),
      styles: InformeBuilder.styles,
    };

    return this.printer.createPdf(docDefinition);
  }
}
