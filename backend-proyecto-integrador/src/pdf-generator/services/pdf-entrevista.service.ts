import { Injectable, NotFoundException } from '@nestjs/common';
import type { Content } from 'pdfmake';
import { IPdfGenerator } from '../interfaces';
import { CreatePdfEntrevistaDto } from '../dto';
import { InformeBuilder } from '../builders/pdf-layout.builder';
import { PdfPrinterProvider } from '../providers/pdf-printer.provider';
import { PrismaService } from '../../prisma/prisma.service';
import { Topico } from '@prisma/client';

const TOPICO_LABELS: Record<Topico, string> = {
  GENERAL:    'General',
  ACADEMICO:  'Académico',
  REL_INTER:  'Relaciones interpersonales',
  SALUD:      'Salud',
  ACTS_EXTRA: 'Actividades extracurriculares',
};

function formatSemestre(semestre: string, year: number): string {
  return semestre === 'PRIMER_SEMESTRE'
    ? `1er Semestre ${year}`
    : `2do Semestre ${year}`;
}

function formatDuracion(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}min ${sec}s`;
  if (m > 0) return `${m}min ${sec}s`;
  return `${sec}s`;
}

@Injectable()
export class PdfEntrevistaGenerator implements IPdfGenerator<CreatePdfEntrevistaDto> {

  constructor(
    private readonly printer: PdfPrinterProvider,
    private readonly prisma: PrismaService,
  ) {}

  async pdfGenerate(dto: CreatePdfEntrevistaDto): Promise<Buffer> {
    const entrevista = await this.prisma.entrevista.findUnique({
      where: { id: dto.id_entrevista },
      include: {
        entrevistador: { select: { nombre: true, apellido: true } },
        semestre:      { select: { year: true, semestre: true } },
        comentarios:   { orderBy: { created_at: 'asc' } },
        estudiante:    { select: { nombre: true, apellido: true, rut_estudiante: true } },
      },
    });

    if (!entrevista) {
      throw new NotFoundException(`Entrevista ${dto.id_entrevista} no encontrada`);
    }

    const { estudiante, entrevistador, semestre, comentarios } = entrevista;

    const fechaHora = new Date(entrevista.fecha_hora).toLocaleDateString('es-CL', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    const semestreLabel = semestre
      ? formatSemestre(semestre.semestre, semestre.year)
      : '—';

    const seccionComentarios: Content[] = comentarios.length > 0
      ? [
          { text: 'Comentarios por tópico', style: 'header', margin: [0, 16, 0, 8] as [number, number, number, number] },
          ...comentarios.flatMap<Content>((c) => [
            {
              text: TOPICO_LABELS[c.topico],
              bold: true,
              fontSize: 11,
              margin: [0, 6, 0, 2] as [number, number, number, number],
            },
            InformeBuilder.paragrafBuilder(c.texto),
          ]),
        ]
      : [
          {
            text: 'Sin comentarios registrados en esta entrevista.',
            style: 'parrafo',
            margin: [0, 12, 0, 0] as [number, number, number, number],
          },
        ];

    const docDefinition = {
      content: [
        InformeBuilder.headerBuilder('Informe de Entrevista'),

        { text: 'Datos generales', style: 'header', margin: [0, 8, 0, 6] as [number, number, number, number] },
        InformeBuilder.tableBuilder(
          ['Campo', 'Valor'],
          [
            ['Estudiante',    `${estudiante.nombre} ${estudiante.apellido} (${estudiante.rut_estudiante})`],
            ['Entrevistador', `${entrevistador.nombre} ${entrevistador.apellido}`],
            ['Fecha y hora',  fechaHora],
            ['Semestre',      semestreLabel],
            ['Duración',      formatDuracion(entrevista.duracion_s)],
            ['Resumen',       entrevista.resumen ?? '(sin resumen)'],
          ],
          ['*', '*'],
        ),

        ...seccionComentarios,
      ],
      footer: () => InformeBuilder.footerBuilder(),
      styles: InformeBuilder.styles,
    };

    return this.printer.createPdf(docDefinition);
  }
}
