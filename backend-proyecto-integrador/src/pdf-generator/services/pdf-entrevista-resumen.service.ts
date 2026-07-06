import { Injectable } from '@nestjs/common';
import type { Content } from 'pdfmake';
import { IPdfGenerator } from '../interfaces';
import { CreatePdfEntrevistaResumenDto } from '../dto';
import { InformeBuilder } from '../builders/pdf-layout.builder';
import { PdfPrinterProvider } from '../providers/pdf-printer.provider';
import { PrismaService } from '../../prisma/prisma.service';
import { Topico } from '@prisma/client';

const TOPICO_LABELS: Record<Topico, string> = {
  GENERAL: 'General',
  ACADEMICO: 'Académico',
  REL_INTER: 'Relaciones interpersonales',
  SALUD: 'Salud',
  ACTS_EXTRA: 'Actividades extracurriculares',
};

@Injectable()
export class PdfEntrevistaResumenGenerator
  implements IPdfGenerator<CreatePdfEntrevistaResumenDto>
{
  constructor(
    private readonly printer: PdfPrinterProvider,
    private readonly prisma: PrismaService,
  ) {}

  async pdfGenerate(dto: CreatePdfEntrevistaResumenDto): Promise<Buffer> {
    const entrevistas = await this.prisma.entrevista.findMany({
      where: { rut_estudiante: dto.rut_estudiante },
      include: {
        entrevistador: { select: { nombre: true, apellido: true } },
        comentarios: true,
      },
      orderBy: { fecha_hora: 'asc' },
    });

    const totalEntrevistas = entrevistas.length;

    // Conteos por año
    const porAno: Record<number, number> = {};
    for (const e of entrevistas) {
      const yr = new Date(e.fecha_hora).getFullYear();
      porAno[yr] = (porAno[yr] ?? 0) + 1;
    }

    // Conteos de comentarios por tópico (sumando todas las entrevistas)
    const TOPICOS_ORDEN: Topico[] = [
      'GENERAL',
      'ACADEMICO',
      'REL_INTER',
      'SALUD',
      'ACTS_EXTRA',
    ];
    const porTopico: Record<Topico, number> = {
      GENERAL: 0,
      ACADEMICO: 0,
      REL_INTER: 0,
      SALUD: 0,
      ACTS_EXTRA: 0,
    };
    for (const e of entrevistas) {
      for (const c of e.comentarios) {
        porTopico[c.topico]++;
      }
    }

    // Tópico(s) más relevante(s): el/los con mayor cantidad de comentarios
    const totalComentarios = Object.values(porTopico).reduce(
      (a, b) => a + b,
      0,
    );
    let topicoPrincipal: string;
    if (totalComentarios === 0) {
      topicoPrincipal = 'Sin comentarios registrados';
    } else {
      const maxCount = Math.max(...Object.values(porTopico));
      const topicosMasComentados = TOPICOS_ORDEN.filter(
        (t) => porTopico[t] === maxCount,
      ).map((t) => TOPICO_LABELS[t]);
      topicoPrincipal = topicosMasComentados.join(', ');
    }

    // Sección de fechas de celebración: N° - Fecha - Entrevistador
    const fechasSection: Content =
      totalEntrevistas > 0
        ? InformeBuilder.tableBuilder(
            ['N°', 'Fecha', 'Entrevistador'],
            entrevistas.map((e, i) => [
              String(i + 1),
              new Date(e.fecha_hora).toLocaleDateString('es-CL'),
              `${e.entrevistador.nombre} ${e.entrevistador.apellido}`,
            ]),
            [30, '*', '*'],
            ['center', 'left', 'left'],
          )
        : { text: 'Sin entrevistas registradas.', style: 'parrafo' };

    // Sección de resúmenes individuales: "Entrevista n° X - fecha - entrevistador"
    const resumenesContent: Content[] =
      totalEntrevistas === 0
        ? [
            {
              text: 'Sin entrevistas registradas.',
              style: 'parrafo',
            } as Content,
          ]
        : entrevistas.flatMap<Content>((e, i) => [
            {
              text:
                `Entrevista n° ${i + 1} - ` +
                `${new Date(e.fecha_hora).toLocaleDateString('es-CL')} - ` +
                `${e.entrevistador.nombre} ${e.entrevistador.apellido}`,
              bold: true,
              fontSize: 11,
              margin: [0, 6, 0, 2] as [number, number, number, number],
            },
            InformeBuilder.paragrafBuilder(e.resumen ?? '(sin resumen)'),
          ]);

    // Sección de comentarios por tópico
    const comentariosSection: Content =
      totalComentarios > 0
        ? InformeBuilder.tableBuilder(
            ['Tópico', 'N° de comentarios'],
            TOPICOS_ORDEN.map((t) => [TOPICO_LABELS[t], String(porTopico[t])]),
            ['*', 120],
            ['left', 'right'],
          )
        : { text: 'Sin comentarios registrados.', style: 'parrafo' };

    const docDefinition = {
      content: [
        InformeBuilder.headerBuilder('Resumen de Entrevistas'),

        InformeBuilder.paragrafBuilder(
          `En este documento se presenta un resumen ejecutivo de todas las ` +
            `entrevistas realizadas al estudiante ${dto.nombre_estudiante} ` +
            `(RUT ${dto.rut_estudiante}), en el marco del proceso de acompañamiento ` +
            `de la Fundación Carmen Goudie.`,
        ),

        {
          text: 'Resumen general',
          style: 'header',
          margin: [0, 8, 0, 6] as [number, number, number, number],
        },
        InformeBuilder.fieldListBuilder([
          ['Total de entrevistas', String(totalEntrevistas)],
          ['Total de comentarios', String(totalComentarios)],
          ['Tópico más comentado', topicoPrincipal],
        ]),

        {
          text: 'Entrevistas por año',
          style: 'header',
          margin: [0, 16, 0, 6] as [number, number, number, number],
        },
        totalEntrevistas > 0
          ? InformeBuilder.tableBuilder(
              ['Año', 'N° de entrevistas'],
              Object.entries(porAno)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([yr, cnt]) => [yr, String(cnt)]),
              [100, '*'],
              ['left', 'right'],
            )
          : ({ text: 'Sin datos.', style: 'parrafo' } as Content),

        {
          text: 'Fechas de celebración',
          style: 'header',
          margin: [0, 16, 0, 6] as [number, number, number, number],
        },
        fechasSection,

        {
          text: 'Comentarios por tópico',
          style: 'header',
          margin: [0, 16, 0, 6] as [number, number, number, number],
        },
        comentariosSection,

        {
          text: 'Resúmenes de cada entrevista',
          style: 'header',
          margin: [0, 16, 0, 8] as [number, number, number, number],
        },
        ...resumenesContent,
      ],
      footer: () => InformeBuilder.footerBuilder(),
      styles: InformeBuilder.styles,
    };

    return this.printer.createPdf(docDefinition);
  }
}
