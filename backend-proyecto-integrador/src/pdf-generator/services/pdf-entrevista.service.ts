import { Injectable, NotFoundException } from '@nestjs/common';
import type { Content } from 'pdfmake';
import { IPdfGenerator } from '../interfaces';
import { CreatePdfEntrevistaDto } from '../dto';
import { InformeBuilder } from '../builders/pdf-layout.builder';
import { PdfPrinterProvider } from '../providers/pdf-printer.provider';
import { PrismaService } from '../../prisma/prisma.service';

function formatDuracion(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}min ${sec}s`;
  if (m > 0) return `${m}min ${sec}s`;
  return `${sec}s`;
}

@Injectable()
export class PdfEntrevistaGenerator
  implements IPdfGenerator<CreatePdfEntrevistaDto>
{
  constructor(
    private readonly printer: PdfPrinterProvider,
    private readonly prisma: PrismaService,
  ) {}

  async pdfGenerate(dto: CreatePdfEntrevistaDto): Promise<Buffer> {
    const entrevista = await this.prisma.entrevista.findUnique({
      where: { id: dto.id_entrevista },
      include: {
        entrevistador: { select: { nombre: true, apellido: true } },
        comentario: true,
        estudiante: {
          select: {
            nombre: true,
            apellido: true,
            rut_estudiante: true,
            generacion_rel: { select: { año: true } },
            carreras: {
              select: {
                nombre: true,
                universidad: { select: { nombre: true } },
              },
            },
          },
        },
      },
    });

    if (!entrevista) {
      throw new NotFoundException(
        `Entrevista ${dto.id_entrevista} no encontrada`,
      );
    }

    const { estudiante, entrevistador, comentario } = entrevista;
    const nombreCompleto = `${estudiante.nombre} ${estudiante.apellido}`;

    const fechaHora = new Date(entrevista.fecha_hora).toLocaleDateString(
      'es-CL',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    );

    const carrerasTexto =
      estudiante.carreras.length > 0
        ? estudiante.carreras
            .map((c) => `${c.nombre} (${c.universidad.nombre})`)
            .join(', ')
        : '—';

    const infoEntrevista: Content = {
      columns: [
        {
          width: '*',
          stack: [
            { text: 'Entrevistador', bold: true, fontSize: 10, color: 'gray' },
            {
              text: `${entrevistador.nombre} ${entrevistador.apellido}`,
              fontSize: 11,
              margin: [0, 2, 0, 0] as [number, number, number, number],
            },
          ],
        },
        {
          width: '*',
          stack: [
            {
              text: 'Fecha de la entrevista',
              bold: true,
              fontSize: 10,
              color: 'gray',
              alignment: 'right',
            },
            {
              text: fechaHora,
              fontSize: 11,
              alignment: 'right',
              margin: [0, 2, 0, 8] as [number, number, number, number],
            },
            {
              text: 'Duración',
              bold: true,
              fontSize: 10,
              color: 'gray',
              alignment: 'right',
            },
            {
              text: formatDuracion(entrevista.duracion_s),
              fontSize: 11,
              alignment: 'right',
              margin: [0, 2, 0, 0] as [number, number, number, number],
            },
          ],
        },
      ],
      columnGap: 24,
      margin: [0, 4, 0, 18] as [number, number, number, number],
    };

    const seccionComentarios: Content[] = comentario
      ? [
          {
            text: 'Comentario de la entrevista',
            style: 'header',
            margin: [0, 16, 0, 8] as [number, number, number, number],
          },
          InformeBuilder.paragrafBuilder(comentario.texto),
        ]
      : [
          {
            text: 'Sin comentario registrado en esta entrevista.',
            style: 'parrafo',
            margin: [0, 12, 0, 0] as [number, number, number, number],
          },
        ];

    const docDefinition = {
      content: [
        InformeBuilder.headerBuilder('Informe de Entrevista'),

        infoEntrevista,

        InformeBuilder.paragrafBuilder(
          `El presente documento es un informe que resume el contenido de la ` +
            `entrevista de seguimiento realizada a ${nombreCompleto}, en el marco ` +
            `del proceso de acompañamiento de la Fundación Carmen Goudie.`,
        ),

        {
          text: 'Datos del becario',
          style: 'header',
          margin: [0, 8, 0, 6] as [number, number, number, number],
        },
        InformeBuilder.fieldListBuilder([
          ['Nombre', nombreCompleto],
          ['RUT', estudiante.rut_estudiante],
          ['Generación', String(estudiante.generacion_rel.año)],
          ['Carreras', carrerasTexto],
        ]),

        {
          text: 'Resumen de la entrevista',
          style: 'header',
          margin: [0, 12, 0, 6] as [number, number, number, number],
        },
        InformeBuilder.paragrafBuilder(
          entrevista.resumen ?? 'No se registró un resumen para esta entrevista.',
        ),

        ...seccionComentarios,
      ],
      footer: () => InformeBuilder.footerBuilder(),
      styles: InformeBuilder.styles,
    };

    return this.printer.createPdf(docDefinition);
  }
}
