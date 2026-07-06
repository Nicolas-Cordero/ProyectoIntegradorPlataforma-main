import { Injectable, NotFoundException } from '@nestjs/common';
import type { Content } from 'pdfmake';
import { IPdfGenerator } from '../interfaces';
import { CreatePdfAcademicoDto } from '../dto';
import { InformeBuilder } from '../builders/pdf-layout.builder';
import { PdfPrinterProvider } from '../providers/pdf-printer.provider';
import { PrismaService } from '../../prisma/prisma.service';
import { calcularSemestresSupendidosFromHistorial } from '../../historial-estado-carrera/historial-estado-carrera.service';
import { EstadoRamo } from '@prisma/client';

const NOTA_APROBACION = 4;

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

function tipoLabel(tipo: string, codigo: CodigoSemUI): string {
  if (tipo === 'REGULAR') return codigo === '1' ? 'Primer semestre' : 'Segundo semestre';
  return `Rec. ${codigo === 'INVIERNO' ? 'Invierno' : 'Verano'}`;
}

interface RamoUI {
  estado: EstadoRamo;
  nota_final: number | null;
}

interface SemestreUI {
  semestre_id: number;
  year: number;
  codigo: CodigoSemUI;
  tipo: string;
  ramos: RamoUI[];
}

function esCerrado(sem: SemestreUI): boolean {
  return sem.ramos.length > 0 && sem.ramos.every((r) => r.estado !== 'CURSANDO');
}

@Injectable()
export class PdfAcademicoGenerator
  implements IPdfGenerator<CreatePdfAcademicoDto>
{
  constructor(
    private readonly printer: PdfPrinterProvider,
    private readonly prisma: PrismaService,
  ) {}

  async pdfGenerate(dto: CreatePdfAcademicoDto): Promise<Buffer> {
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
      semestresMap
        .get(semestre_id)!
        .ramos.push({ estado: r.estado, nota_final: r.nota_final ? Number(r.nota_final) : null });
    }
    const semestres = Array.from(semestresMap.values()).sort((a, b) =>
      a.year !== b.year
        ? a.year - b.year
        : ORDEN_SEMESTRE[a.codigo] - ORDEN_SEMESTRE[b.codigo],
    );

    const historial = await this.prisma.historial_estado_carrera.findMany({
      where: { codigo_carrera: dto.codigo_carrera },
      orderBy: { created_at: 'asc' },
    });
    const semestresSuspendidos =
      calcularSemestresSupendidosFromHistorial(historial);

    const todosRamos = semestres.flatMap((s) => s.ramos);
    const totalRamos = todosRamos.length;
    const semFinalizados = semestres.filter(esCerrado).length;
    const ramosAprobados = todosRamos.filter((r) => r.estado === 'APROBADO').length;
    const ramosReprobados = todosRamos.filter((r) => r.estado === 'REPROBADO').length;
    const ramosCursando = todosRamos.filter((r) => r.estado === 'CURSANDO').length;
    const ramosEliminados = todosRamos.filter((r) => r.estado === 'ELIMINADO').length;
    const notas = todosRamos
      .map((r) => r.nota_final)
      .filter((n): n is number => n !== null);
    const promedioGeneral =
      notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : null;

    const pct = (n: number) =>
      totalRamos > 0 ? ` (${((n / totalRamos) * 100).toFixed(1).replace('.', ',')}%)` : '';

    const resumenGeneral = InformeBuilder.tableBuilder(
      ['Indicador', 'Valor'],
      [
        ['Semestres finalizados', String(semFinalizados)],
        ['Semestres suspendidos', String(semestresSuspendidos)],
        ['Duración total de la carrera', `${carrera.duracion_sem} semestres`],
        ['Ramos aprobados', `${ramosAprobados}${pct(ramosAprobados)}`],
        ['Ramos reprobados', `${ramosReprobados}${pct(ramosReprobados)}`],
        ['Ramos en curso', `${ramosCursando}${pct(ramosCursando)}`],
        ['Ramos eliminados', `${ramosEliminados}${pct(ramosEliminados)}`],
        [
          'Promedio general',
          promedioGeneral !== null
            ? promedioGeneral.toFixed(2).replace('.', ',')
            : '—',
        ],
      ],
      ['*', '*'],
      ['left', 'right'],
    );

    const detalleSemestral: Content =
      semestres.length > 0
        ? InformeBuilder.tableBuilder(
            ['N°', 'Tipo', 'Año', 'Estado', 'Ramos', 'Aprobados', 'Reprobados', 'Eliminados'],
            semestres.map((sem, idx) => {
              const abierto = sem.ramos.some((r) => r.estado === 'CURSANDO');
              const cerrado = esCerrado(sem);
              const estado = abierto ? 'En curso' : cerrado ? 'Cerrado' : 'Sin ramos';
              return [
                String(idx + 1),
                tipoLabel(sem.tipo, sem.codigo),
                String(sem.year),
                estado,
                String(sem.ramos.length),
                String(sem.ramos.filter((r) => r.estado === 'APROBADO').length),
                String(sem.ramos.filter((r) => r.estado === 'REPROBADO').length),
                String(sem.ramos.filter((r) => r.estado === 'ELIMINADO').length),
              ];
            }),
            [20, '*', 35, 50, 38, 55, 60, 55],
            ['center', 'left', 'center', 'center', 'center', 'center', 'center', 'center'],
          )
        : { text: 'Esta carrera no tiene semestres con ramos registrados.', style: 'parrafo' };

    const docDefinition = {
      content: [
        InformeBuilder.headerBuilder('Informe Desempeño Académico'),

        InformeBuilder.paragrafBuilder(
          `El presente documento entrega un análisis del desempeño académico ` +
            `registrado en el sistema para el becario, incluyendo un resumen general ` +
            `de sus resultados y el detalle de cada semestre cursado. El objetivo de ` +
            `este informe es presentar los resultados académicos del estudiante ` +
            `${nombreCompleto} (RUT ${estudiante.rut_estudiante}) en la carrera ` +
            `${carrera.nombre}.`,
        ),

        InformeBuilder.paragrafBuilder(
          'En la Tabla 1 a continuación se presentan los resultados generales académicos del estudiante.',
        ),
        InformeBuilder.tableCaption(1, 'Resumen académico general'),
        resumenGeneral,

        ...(semestres.length > 0
          ? [
              InformeBuilder.paragrafBuilder(
                'En la Tabla 2 a continuación se presenta el detalle académico de cada semestre cursado por el estudiante.',
                18,
              ),
              InformeBuilder.tableCaption(2, 'Detalle por semestre'),
            ]
          : []),
        detalleSemestral,
      ],
      footer: () => InformeBuilder.footerBuilder(),
      styles: InformeBuilder.styles,
    };

    return this.printer.createPdf(docDefinition);
  }
}
