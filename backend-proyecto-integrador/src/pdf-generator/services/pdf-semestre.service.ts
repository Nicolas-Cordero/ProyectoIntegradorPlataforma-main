import { Injectable, NotFoundException } from '@nestjs/common';
import type { Content } from 'pdfmake';
import { IPdfGenerator } from '../interfaces';
import { CreatePdfSemestreDto } from '../dto';
import { InformeBuilder } from '../builders/pdf-layout.builder';
import { PdfPrinterProvider } from '../providers/pdf-printer.provider';
import { PrismaService } from '../../prisma/prisma.service';
import { EstadoRamo } from '@prisma/client';

type CodigoSemUI = '1' | '2' | 'INVIERNO' | 'VERANO';

const BACKEND_TO_UI: Record<string, CodigoSemUI> = {
  PRIMER_SEMESTRE: '1',
  SEGUNDO_SEMESTRE: '2',
  INVIERNO: 'INVIERNO',
  VERANO: 'VERANO',
};

const ORDEN_SEMESTRE: Record<CodigoSemUI, number> = {
  '1': 0,
  INVIERNO: 1,
  '2': 2,
  VERANO: 3,
};

function semLabel(tipo: string, codigo: CodigoSemUI, year: number): string {
  if (tipo === 'REGULAR') {
    return `${codigo === '1' ? 'Primer' : 'Segundo'} semestre ${year}`;
  }
  return `Recuperativo de ${codigo === 'INVIERNO' ? 'invierno' : 'verano'} ${year}`;
}

interface RamoUI {
  nombre: string;
  estado: EstadoRamo;
  nota_final: number | null;
  intento: number;
  comentario: string;
}

interface SemestreUI {
  semestre_id: number;
  year: number;
  codigo: CodigoSemUI;
  tipo: string;
  ramos: RamoUI[];
}

@Injectable()
export class PdfSemestreGenerator
  implements IPdfGenerator<CreatePdfSemestreDto>
{
  constructor(
    private readonly printer: PdfPrinterProvider,
    private readonly prisma: PrismaService,
  ) {}

  async pdfGenerate(dto: CreatePdfSemestreDto): Promise<Buffer> {
    const carrera = await this.prisma.carrera.findUnique({
      where: { codigo_carrera: dto.codigo_carrera },
      include: {
        estudiante: {
          select: { nombre: true, apellido: true, rut_estudiante: true },
        },
      },
    });

    if (!carrera) {
      throw new NotFoundException(
        `Carrera ${dto.codigo_carrera} no encontrada`,
      );
    }

    const { estudiante } = carrera;
    const nombreCompleto = `${estudiante.nombre} ${estudiante.apellido}`;

    const ramos = await this.prisma.ramo.findMany({
      where: { codigo_carrera: dto.codigo_carrera },
      include: { semestre: true },
    });

    const semestresMap = new Map<number, SemestreUI>();
    for (const r of ramos) {
      const { semestre_id, year, semestre, tipo } = r.semestre;
      if (!semestresMap.has(semestre_id)) {
        semestresMap.set(semestre_id, {
          semestre_id,
          year,
          codigo: BACKEND_TO_UI[semestre],
          tipo,
          ramos: [],
        });
      }
      semestresMap.get(semestre_id)!.ramos.push({
        nombre: r.nombre,
        estado: r.estado,
        nota_final: r.nota_final ? Number(r.nota_final) : null,
        intento: r.intento,
        comentario: r.comentario,
      });
    }
    const todosSemestres = Array.from(semestresMap.values()).sort((a, b) =>
      a.year !== b.year
        ? a.year - b.year
        : ORDEN_SEMESTRE[a.codigo] - ORDEN_SEMESTRE[b.codigo],
    );

    let semestresARenderizar: SemestreUI[];
    const modoTodos = dto.semestre_id === undefined;

    if (modoTodos) {
      semestresARenderizar = todosSemestres;
    } else {
      const uno = todosSemestres.find((s) => s.semestre_id === dto.semestre_id);
      if (!uno) {
        throw new NotFoundException(
          `El semestre ${dto.semestre_id} no tiene ramos registrados en esta carrera`,
        );
      }
      semestresARenderizar = [uno];
    }

    const titulo = modoTodos
      ? 'Informe Desempeño Semestral'
      : `Informe Desempeño Semestral — ${semLabel(semestresARenderizar[0].tipo, semestresARenderizar[0].codigo, semestresARenderizar[0].year)}`;

    const identificacion = `${nombreCompleto} (RUT ${estudiante.rut_estudiante})`;
    const objetivo = modoTodos
      ? `Presentar los resultados académicos del estudiante ${identificacion} en la ` +
        `carrera ${carrera.nombre} a lo largo de todos los semestres cursados.`
      : `Presentar los resultados académicos del estudiante ${identificacion} en la ` +
        `carrera ${carrera.nombre} durante el ${semLabel(semestresARenderizar[0].tipo, semestresARenderizar[0].codigo, semestresARenderizar[0].year)}.`;

    let numeroTabla = 1;
    const bloquesSemestre: Content[] = semestresARenderizar.flatMap((sem) => {
      const etiqueta = semLabel(sem.tipo, sem.codigo, sem.year);
      const abierto = sem.ramos.some((r) => r.estado === 'CURSANDO');

      const headers = ['Ramo', 'Nota final', ...(abierto ? [] : ['Estado'])];
      const widths: (string | number)[] = ['*', 70, ...(abierto ? [] : [90])];
      const aligns: ('left' | 'center' | 'right')[] = [
        'left',
        'center',
        ...(abierto ? [] : ['center' as const]),
      ];

      const filas = sem.ramos.map((r) => {
        const nombreConIntento =
          r.intento > 1 ? `${r.nombre} (${r.intento}° intento)` : r.nombre;
        const celdaRamo: string | Content = r.comentario.trim()
          ? {
              stack: [
                { text: nombreConIntento, style: 'tableCell' },
                {
                  text: r.comentario,
                  italics: true,
                  fontSize: 8.5,
                  color: '#666666',
                  margin: [0, 2, 0, 0] as [number, number, number, number],
                },
              ],
            }
          : nombreConIntento;

        return [
          celdaRamo,
          r.nota_final !== null ? r.nota_final.toFixed(1).replace('.', ',') : '—',
          ...(abierto ? [] : [r.estado]),
        ];
      });

      const bloque: Content[] = [
        {
          text: etiqueta,
          style: 'header',
          margin: [0, 16, 0, 6] as [number, number, number, number],
        },
        InformeBuilder.paragrafBuilder(
          `En la Tabla ${numeroTabla} a continuación se presentan los ramos cursados ` +
            `por el estudiante durante el ${etiqueta.toLowerCase()}.`,
        ),
        InformeBuilder.tableCaption(numeroTabla, `Ramos cursados — ${etiqueta}`),
        InformeBuilder.tableBuilder(headers, filas, widths, aligns),
      ];
      numeroTabla++;

      if (!abierto) {
        const aprobados = sem.ramos.filter((r) => r.estado === 'APROBADO').length;
        const reprobados = sem.ramos.filter((r) => r.estado === 'REPROBADO').length;
        const eliminados = sem.ramos.filter((r) => r.estado === 'ELIMINADO').length;
        const notas = sem.ramos
          .map((r) => r.nota_final)
          .filter((n): n is number => n !== null);
        const promedio =
          notas.length > 0
            ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1).replace('.', ',')
            : '—';

        bloque.push(
          InformeBuilder.paragrafBuilder(
            `Aprobados: ${aprobados}   ·   Reprobados: ${reprobados}   ·   ` +
              `Eliminados: ${eliminados}   ·   Promedio: ${promedio}`,
          ),
        );
      }

      return bloque;
    });

    const content: Content[] =
      semestresARenderizar.length > 0
        ? bloquesSemestre
        : [
            {
              text: 'Esta carrera no tiene semestres con ramos registrados.',
              style: 'parrafo',
            },
          ];

    const docDefinition = {
      content: [
        InformeBuilder.headerBuilder(titulo),
        InformeBuilder.paragrafBuilder(
          `El presente documento entrega el detalle académico registrado en el ` +
            `sistema para el becario, ramo por ramo. El objetivo de este informe es ${objetivo.charAt(0).toLowerCase() + objetivo.slice(1)}`,
        ),
        ...content,
      ],
      footer: () => InformeBuilder.footerBuilder(),
      styles: InformeBuilder.styles,
    };

    return this.printer.createPdf(docDefinition);
  }
}
