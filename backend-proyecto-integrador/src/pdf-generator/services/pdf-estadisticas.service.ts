import { Injectable } from '@nestjs/common';
import type { Content, Alignment } from 'pdfmake';
import { IPdfGenerator } from '../interfaces';
import { CreatePdfEstadisticasDto } from '../dto';
import { InformeBuilder } from '../builders/pdf-layout.builder';
import { PdfPrinterProvider } from '../providers/pdf-printer.provider';
import { PrismaService } from '../../prisma/prisma.service';
import { EstadoEstudiante, Genero } from '@prisma/client';

const GENERO_LABELS: Record<Genero, string> = {
  MASCULINO: 'Masculino',
  FEMENINO: 'Femenino',
  NO_BINARIO: 'No binario',
};

const ESTADOS_ABANDONO: EstadoEstudiante[] = ['SUSPENDIDO', 'RETIRADO', 'ELIMINADO'];

type Situacion =
  | 'Titulado'
  | 'Egresado (titulación pendiente)'
  | 'Estudiando en educación superior'
  | 'Estudios suspendidos'
  | 'Retirado'
  | 'Cursando enseñanza media'
  | 'No matriculado';

interface HistorialItem {
  estado_nuevo: EstadoEstudiante;
  created_at: Date;
}

interface CarreraItem {
  codigo_carrera: number;
  nombre: string;
  duracion_sem: number;
  anio_ingreso: number;
  estado: EstadoEstudiante;
  universidad: { nombre: string; comuna: string };
  historial_estados: HistorialItem[];
}

interface EstudianteItem {
  rut_estudiante: string;
  nombre: string;
  apellido: string;
  genero: Genero;
  generacion_rel: { año: number };
  liceo: { nombre: string; comuna: string; especialidad: string };
  carreras: CarreraItem[];
}

function pct(n: number, total: number): string {
  return total > 0
    ? `${((n / total) * 100).toFixed(1).replace('.', ',')}%`
    : '—';
}

function ordenarPorIngreso(carreras: CarreraItem[]): CarreraItem[] {
  return [...carreras].sort((a, b) => a.anio_ingreso - b.anio_ingreso);
}

// La carrera "representativa" de un estudiante con más de una es la más
// reciente (mismo criterio que EstudianteService.derivarEstado: la última
// carrera del arreglo manda).
function carreraRepresentativa(carreras: CarreraItem[]): CarreraItem | null {
  if (carreras.length === 0) return null;
  const ordenadas = ordenarPorIngreso(carreras);
  return ordenadas[ordenadas.length - 1];
}

// Ver decisiones-informe-general-becarios.md: sin carreras, se aproxima con
// generacion.año porque el sistema no registra el año escolar (media) actual
// de cada estudiante — es una estimación, no un dato exacto.
function clasificarSituacion(
  est: EstudianteItem,
  añoActual: number,
): Situacion {
  const { carreras } = est;
  if (carreras.some((c) => c.estado === 'TITULADO')) return 'Titulado';
  if (carreras.some((c) => c.estado === 'EGRESADO'))
    return 'Egresado (titulación pendiente)';
  if (carreras.some((c) => c.estado === 'ACTIVO'))
    return 'Estudiando en educación superior';
  if (carreras.some((c) => c.estado === 'SUSPENDIDO'))
    return 'Estudios suspendidos';
  if (carreras.some((c) => c.estado === 'RETIRADO' || c.estado === 'ELIMINADO'))
    return 'Retirado';
  return añoActual - est.generacion_rel.año <= 1
    ? 'Cursando enseñanza media'
    : 'No matriculado';
}

// Ver decisiones-informe-general-becarios.md, regla (a)/(b)/(c): cuenta como
// cambio de carrera (booleano) solo si una carrera fue abandonada
// (SUSPENDIDO/RETIRADO/ELIMINADO) y la siguiente carrera del estudiante
// comenzó después de ese abandono. Dos carreras simultáneas no cuentan.
function tuvoCambioDeCarrera(carreras: CarreraItem[]): boolean {
  const ordenadas = ordenarPorIngreso(carreras);
  for (let i = 0; i < ordenadas.length - 1; i++) {
    const abandono = ordenadas[i].historial_estados.find((h) =>
      ESTADOS_ABANDONO.includes(h.estado_nuevo),
    );
    if (abandono && ordenadas[i + 1].anio_ingreso > abandono.created_at.getFullYear()) {
      return true;
    }
  }
  return false;
}

// Duración real en semestres: desde anio_ingreso (asumido S1) hasta el
// semestre en que historial_estado_carrera registra el paso a
// TITULADO/EGRESADO. null si la carrera no ha llegado a ese estado.
function duracionRealSemestres(carrera: CarreraItem): number | null {
  const transicion = carrera.historial_estados.find(
    (h) => h.estado_nuevo === 'TITULADO' || h.estado_nuevo === 'EGRESADO',
  );
  if (!transicion) return null;
  const año = transicion.created_at.getFullYear();
  const semestre = transicion.created_at.getMonth() < 6 ? 1 : 2;
  return (año - carrera.anio_ingreso) * 2 + semestre;
}

function agruparConteo<T>(
  items: T[],
  keyFn: (item: T) => string,
): Array<[string, number]> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
}

function tablaDesglose(
  grupos: Array<[string, number]>,
  total: number,
  etiquetaColumna: string,
): Content {
  return InformeBuilder.tableBuilder(
    [etiquetaColumna, 'N°', '%'],
    grupos.map(([label, n]) => [label, String(n), pct(n, total)]),
    ['*', 60, 70],
    ['left', 'right', 'right'] as Alignment[],
  );
}

@Injectable()
export class PdfEstadisticasGenerator
  implements IPdfGenerator<CreatePdfEstadisticasDto>
{
  constructor(
    private readonly printer: PdfPrinterProvider,
    private readonly prisma: PrismaService,
  ) {}

  async pdfGenerate(_dto: CreatePdfEstadisticasDto): Promise<Buffer> {
    const hoy = new Date();
    const añoActual = hoy.getFullYear();
    const inicioAño = new Date(añoActual, 0, 1);

    const estudiantes = (await this.prisma.estudiante.findMany({
      select: {
        rut_estudiante: true,
        nombre: true,
        apellido: true,
        genero: true,
        generacion_rel: { select: { año: true } },
        liceo: { select: { nombre: true, comuna: true, especialidad: true } },
        carreras: {
          select: {
            codigo_carrera: true,
            nombre: true,
            duracion_sem: true,
            anio_ingreso: true,
            estado: true,
            universidad: { select: { nombre: true, comuna: true } },
            historial_estados: {
              orderBy: { created_at: 'asc' },
              select: { estado_nuevo: true, created_at: true },
            },
          },
        },
      },
    })) as unknown as EstudianteItem[];

    const totalHistorico = estudiantes.length;
    const situaciones = new Map<string, Situacion>();
    for (const est of estudiantes) {
      situaciones.set(est.rut_estudiante, clasificarSituacion(est, añoActual));
    }

    let n = 1;
    const content: Content[] = [
      InformeBuilder.headerBuilder('Informe General de Becarios'),

      InformeBuilder.paragrafBuilder(
        'El presente documento entrega una fotografía general y actualizada de ' +
          'la comunidad de becarios de la Fundación Carmen Goudie: quiénes la ' +
          'componen, de dónde provienen, en qué etapa de sus estudios se ' +
          'encuentran, y qué ha ocurrido con ellos desde el comienzo del año en ' +
          'curso. Los datos se calculan en el momento en que se genera este ' +
          'informe, por lo que reflejan siempre el estado más reciente del ' +
          'sistema.',
      ),
    ];

    // ── II.I Estadísticas generales ─────────────────────────────────────────

    content.push({
      text: 'Estadísticas generales de becarias y becarios',
      style: 'header',
      margin: [0, 10, 0, 6] as [number, number, number, number],
    });

    content.push(
      InformeBuilder.paragrafBuilder(
        `Desde su creación, la Fundación ha becado a un total de ${totalHistorico} ` +
          `estudiantes. La Tabla ${n} a continuación muestra cuántos becarios ` +
          `ingresaron cada año (su "generación"), junto con el acumulado y el ` +
          `porcentaje que representa cada generación sobre el total histórico.`,
      ),
    );
    const porGeneracion = agruparConteo(estudiantes, (e) =>
      String(e.generacion_rel.año),
    ).sort(([a], [b]) => Number(a) - Number(b));
    let acumulado = 0;
    const filasGeneracion = porGeneracion.map(([año, cnt]) => {
      acumulado += cnt;
      return [
        año,
        String(cnt),
        String(acumulado),
        pct(acumulado, totalHistorico),
      ];
    });
    content.push(
      InformeBuilder.tableCaption(n, 'Becarios según año de ingreso (generación)'),
      InformeBuilder.tableBuilder(
        ['Generación', 'N°', 'N° acumulado', '% acumulado'],
        filasGeneracion,
        ['*', 55, 90, 85],
        ['left', 'right', 'right', 'right'] as Alignment[],
      ),
    );
    n++;

    content.push(
      InformeBuilder.paragrafBuilder(
        `La Tabla ${n} muestra la composición de género de la comunidad de ` +
          `becarios, según las categorías que el sistema permite registrar hoy.`,
        14,
      ),
    );
    content.push(
      InformeBuilder.tableCaption(n, 'Becarios según género'),
      tablaDesglose(
        agruparConteo(estudiantes, (e) => GENERO_LABELS[e.genero]),
        totalHistorico,
        'Género',
      ),
    );
    n++;

    content.push(
      InformeBuilder.paragrafBuilder(
        `La Tabla ${n} indica de qué liceos de origen provienen los becarios, ` +
          `lo que permite ver qué establecimientos aportan más estudiantes al ` +
          `programa.`,
        14,
      ),
    );
    content.push(
      InformeBuilder.tableCaption(n, 'Becarios según liceo de origen'),
      tablaDesglose(
        agruparConteo(estudiantes, (e) => e.liceo.nombre),
        totalHistorico,
        'Liceo',
      ),
    );
    n++;

    content.push(
      InformeBuilder.paragrafBuilder(
        `La Tabla ${n} agrupa a los becarios según la comuna del liceo del que ` +
          `provienen, para ver desde qué zonas llega el programa.`,
        14,
      ),
    );
    content.push(
      InformeBuilder.tableCaption(n, 'Becarios según comuna del liceo de origen'),
      tablaDesglose(
        agruparConteo(estudiantes, (e) => e.liceo.comuna),
        totalHistorico,
        'Comuna',
      ),
    );
    n++;

    content.push(
      InformeBuilder.paragrafBuilder(
        `La Tabla ${n} muestra la modalidad de enseñanza media de la que ` +
          `provienen los becarios, tal como está registrada en el sistema para ` +
          `cada liceo.`,
        14,
      ),
    );
    content.push(
      InformeBuilder.tableCaption(n, 'Becarios según modalidad del liceo de origen'),
      tablaDesglose(
        agruparConteo(estudiantes, (e) => e.liceo.especialidad),
        totalHistorico,
        'Modalidad',
      ),
    );
    n++;

    content.push(
      InformeBuilder.paragrafBuilder(
        `La Tabla ${n} resume en qué etapa se encuentra cada becario hoy: si ya ` +
          `se tituló o egresó, si está cursando su carrera, si su beca está ` +
          `suspendida, si se retiró del programa, o si aún no ingresa a la ` +
          `educación superior. Cuando un becario no tiene ninguna carrera ` +
          `registrada, se estima si todavía cursa enseñanza media o si no se ` +
          `matriculó, usando el año en que se unió a la Fundación como ` +
          `referencia (el sistema no registra el curso escolar de cada ` +
          `estudiante, por lo que esta distinción puntual es una aproximación).`,
        14,
      ),
    );
    content.push(
      InformeBuilder.tableCaption(n, 'Becarios según situación académica actual'),
      tablaDesglose(
        agruparConteo(estudiantes, (e) => situaciones.get(e.rut_estudiante)!),
        totalHistorico,
        'Situación académica',
      ),
    );
    n++;

    // ── II.II Caracterización en estudios superiores ────────────────────────

    const enEducacionSuperior = estudiantes.filter((e) => {
      const s = situaciones.get(e.rut_estudiante)!;
      return e.carreras.length > 0 && s !== 'Retirado';
    });
    const totalSuperior = enEducacionSuperior.length;

    content.push({
      text: 'Becarias y becarios en estudios superiores',
      style: 'header',
      margin: [0, 16, 0, 6] as [number, number, number, number],
    });
    content.push(
      InformeBuilder.paragrafBuilder(
        `Esta sección describe a los ${totalSuperior} becarios que en algún ` +
          `momento ingresaron a la educación superior y no se han retirado del ` +
          `programa (excluye a quienes aún cursan enseñanza media, a quienes no ` +
          `se han matriculado, y a los becarios retirados).`,
      ),
    );

    content.push(
      InformeBuilder.paragrafBuilder(
        `La Tabla ${n} muestra en qué carreras están o estuvieron matriculados ` +
          `estos becarios.`,
        14,
      ),
    );
    content.push(
      InformeBuilder.tableCaption(n, 'Becarios según carrera'),
      tablaDesglose(
        agruparConteo(
          enEducacionSuperior,
          (e) => carreraRepresentativa(e.carreras)!.nombre,
        ),
        totalSuperior,
        'Carrera',
      ),
    );
    n++;

    content.push(
      InformeBuilder.paragrafBuilder(
        `La Tabla ${n} muestra en qué institución de educación superior estudian ` +
          `estos becarios.`,
        14,
      ),
    );
    content.push(
      InformeBuilder.tableCaption(n, 'Becarios según institución de educación superior'),
      tablaDesglose(
        agruparConteo(
          enEducacionSuperior,
          (e) => carreraRepresentativa(e.carreras)!.universidad.nombre,
        ),
        totalSuperior,
        'Institución',
      ),
    );
    n++;

    content.push(
      InformeBuilder.paragrafBuilder(
        `La Tabla ${n} muestra en qué ciudad (comuna de la institución) estudian ` +
          `estos becarios.`,
        14,
      ),
    );
    content.push(
      InformeBuilder.tableCaption(n, 'Becarios según ciudad de estudio'),
      tablaDesglose(
        agruparConteo(
          enEducacionSuperior,
          (e) => carreraRepresentativa(e.carreras)!.universidad.comuna,
        ),
        totalSuperior,
        'Ciudad',
      ),
    );
    n++;

    const conCambio = enEducacionSuperior.filter((e) =>
      tuvoCambioDeCarrera(e.carreras),
    ).length;
    content.push(
      InformeBuilder.paragrafBuilder(
        `La Tabla ${n} indica cuántos becarios abandonaron una carrera ` +
          `(suspendida, retirada o eliminada) y luego comenzaron otra distinta, ` +
          `es decir, cambiaron de carrera durante su trayectoria.`,
        14,
      ),
    );
    content.push(
      InformeBuilder.tableCaption(n, 'Becarios según cambio de carrera'),
      tablaDesglose(
        [
          ['Con cambio de carrera', conCambio],
          ['Sin cambio de carrera', totalSuperior - conCambio],
        ],
        totalSuperior,
        'Permanencia en carrera',
      ),
    );
    n++;

    // ── II.III Egresados y titulados ─────────────────────────────────────────

    const egresadosTitulados = estudiantes.filter((e) => {
      const s = situaciones.get(e.rut_estudiante)!;
      return s === 'Titulado' || s === 'Egresado (titulación pendiente)';
    });

    content.push({
      text: 'Becarias y becarios egresados y titulados',
      style: 'header',
      margin: [0, 16, 0, 6] as [number, number, number, number],
    });
    content.push(
      InformeBuilder.paragrafBuilder(
        `A la fecha, ${egresadosTitulados.length} becarios han egresado o se ` +
          `han titulado de su carrera. La Tabla ${n} los lista de forma ` +
          `individual, con su liceo de origen, carrera e institución.`,
      ),
    );
    content.push(
      InformeBuilder.tableCaption(n, 'Becarios egresados y titulados'),
      InformeBuilder.tableBuilder(
        ['Apellido', 'Nombre', 'Gen.', 'Liceo', 'Carrera', 'Institución', 'Estado'],
        egresadosTitulados.map((e) => {
          const c = carreraRepresentativa(e.carreras)!;
          return [
            e.apellido,
            e.nombre,
            String(e.generacion_rel.año),
            e.liceo.nombre,
            c.nombre,
            c.universidad.nombre,
            situaciones.get(e.rut_estudiante)! === 'Titulado' ? 'Titulado' : 'Egresado',
          ];
        }),
        [70, 70, 35, '*', '*', 65, 60],
        ['left', 'left', 'center', 'left', 'left', 'left', 'center'] as Alignment[],
      ),
    );
    n++;

    const conDuracion = egresadosTitulados
      .map((e) => {
        const c = carreraRepresentativa(e.carreras)!;
        const real = duracionRealSemestres(c);
        return real !== null ? { e, c, real } : null;
      })
      .filter((x): x is { e: EstudianteItem; c: CarreraItem; real: number } => x !== null);

    if (conDuracion.length > 0) {
      content.push(
        InformeBuilder.paragrafBuilder(
          `La Tabla ${n} compara, para cada becario egresado o titulado, la ` +
            `duración oficial de su carrera con la cantidad real de semestres ` +
            `que le tomó completarla, para dimensionar cuánto se atrasan en ` +
            `promedio los becarios respecto al plan de estudios.`,
          14,
        ),
      );
      const sobreduracionProm =
        conDuracion.reduce((acc, { c, real }) => acc + (real - c.duracion_sem), 0) /
        conDuracion.length;
      content.push(
        InformeBuilder.tableCaption(n, 'Duración nominal, real y sobreduración'),
        InformeBuilder.tableBuilder(
          ['Apellido', 'Nombre', 'Carrera', 'Nominal (sem.)', 'Real (sem.)', 'Sobreduración'],
          conDuracion.map(({ e, c, real }) => [
            e.apellido,
            e.nombre,
            c.nombre,
            String(c.duracion_sem),
            String(real),
            String(real - c.duracion_sem),
          ]),
          [70, 70, '*', 75, 65, 85],
          ['left', 'left', 'left', 'right', 'right', 'right'] as Alignment[],
        ),
        InformeBuilder.paragrafBuilder(
          sobreduracionProm > 0
            ? `En promedio, los becarios egresados o titulados se demoran ` +
                `${sobreduracionProm.toFixed(1).replace('.', ',')} semestres más de lo ` +
                `que dura oficialmente su carrera.`
            : sobreduracionProm < 0
              ? `En promedio, los becarios egresados o titulados completan su ` +
                `carrera ${Math.abs(sobreduracionProm).toFixed(1).replace('.', ',')} ` +
                `semestres antes de lo que dura oficialmente.`
              : `En promedio, los becarios egresados o titulados completan su ` +
                `carrera exactamente en la duración oficial.`,
        ),
      );
      n++;
    }

    content.push(
      InformeBuilder.paragrafBuilder(
        `La Tabla ${n} agrupa a los becarios egresados y titulados según la ` +
          `institución en la que estudiaron.`,
        14,
      ),
    );
    content.push(
      InformeBuilder.tableCaption(n, 'Egresados y titulados según institución'),
      tablaDesglose(
        agruparConteo(
          egresadosTitulados,
          (e) => carreraRepresentativa(e.carreras)!.universidad.nombre,
        ),
        egresadosTitulados.length,
        'Institución',
      ),
    );
    n++;

    // ── II.IV Retirados ───────────────────────────────────────────────────────

    const retirados = estudiantes.filter(
      (e) => situaciones.get(e.rut_estudiante)! === 'Retirado',
    );

    content.push({
      text: 'Becarias y becarios retirados',
      style: 'header',
      margin: [0, 16, 0, 6] as [number, number, number, number],
    });
    content.push(
      InformeBuilder.paragrafBuilder(
        `Desde su creación, ${retirados.length} becarios han abandonado el ` +
          `programa. La Tabla ${n} muestra de qué liceos de origen provienen.`,
      ),
    );
    content.push(
      InformeBuilder.tableCaption(n, 'Becarios retirados según liceo de origen'),
      retirados.length > 0
        ? tablaDesglose(
            agruparConteo(retirados, (e) => e.liceo.nombre),
            retirados.length,
            'Liceo',
          )
        : InformeBuilder.paragrafBuilder('No hay becarios retirados registrados.'),
    );
    n++;

    // ── III. Trayectoria durante el año en curso ────────────────────────────

    content.push({
      text: `Trayectoria durante el año en curso (${añoActual})`,
      style: 'header',
      margin: [0, 16, 0, 6] as [number, number, number, number],
    });
    content.push(
      InformeBuilder.paragrafBuilder(
        `Esta sección resume qué ha pasado, desde el 1 de enero de ${añoActual} ` +
          `hasta la fecha, con los becarios que estudian en la educación ` +
          `superior: cuántos continúan su carrera con normalidad, cuántos ` +
          `egresaron o se titularon, cuántos congelaron sus estudios y cuántos ` +
          `se retiraron. Se recalcula cada vez que se genera este informe, por ` +
          `lo que siempre refleja lo ocurrido desde el inicio del año hasta hoy.`,
      ),
    );

    const universitariosDelAño = estudiantes.filter((e) =>
      e.carreras.some(
        (c) =>
          c.anio_ingreso <= añoActual &&
          (c.estado === 'ACTIVO' ||
            c.historial_estados.some((h) => h.created_at >= inicioAño)),
      ),
    );
    let continuan = 0;
    let egresaronEsteAño = 0;
    let congelaronEsteAño = 0;
    let seRetiraronEsteAño = 0;
    for (const e of universitariosDelAño) {
      const carrera = carreraRepresentativa(e.carreras)!;
      const transicionesDelAño = carrera.historial_estados.filter(
        (h) => h.created_at >= inicioAño,
      );
      const ultima = transicionesDelAño[transicionesDelAño.length - 1];
      if (!ultima) {
        if (carrera.estado === 'ACTIVO') continuan++;
        continue;
      }
      if (ultima.estado_nuevo === 'TITULADO' || ultima.estado_nuevo === 'EGRESADO') {
        egresaronEsteAño++;
      } else if (ultima.estado_nuevo === 'SUSPENDIDO') {
        congelaronEsteAño++;
      } else if (ultima.estado_nuevo === 'RETIRADO' || ultima.estado_nuevo === 'ELIMINADO') {
        seRetiraronEsteAño++;
      } else if (ultima.estado_nuevo === 'ACTIVO') {
        continuan++;
      }
    }
    content.push(
      InformeBuilder.tableCaption(n, `Trayectoria de becarios universitarios en ${añoActual}`),
      tablaDesglose(
        [
          ['Continúan sus estudios con normalidad', continuan],
          ['Egresaron o se titularon', egresaronEsteAño],
          ['Congelaron sus estudios', congelaronEsteAño],
          ['Se retiraron', seRetiraronEsteAño],
        ],
        universitariosDelAño.length,
        'Situación',
      ),
    );
    n++;

    const generacionNueva = Math.max(
      ...estudiantes.map((e) => e.generacion_rel.año),
    );
    const nuevaGeneracion = estudiantes.filter(
      (e) => e.generacion_rel.año === generacionNueva,
    );
    content.push(
      InformeBuilder.paragrafBuilder(
        `La Tabla ${n} muestra de qué liceos y comunas provienen los becarios ` +
          `de la Generación ${generacionNueva}, la más reciente en incorporarse ` +
          `a la Fundación.`,
        14,
      ),
    );
    content.push(
      InformeBuilder.tableCaption(n, `Liceos de origen — Generación ${generacionNueva}`),
      tablaDesglose(
        agruparConteo(nuevaGeneracion, (e) => `${e.liceo.nombre} (${e.liceo.comuna})`),
        nuevaGeneracion.length,
        'Liceo (comuna)',
      ),
    );
    n++;

    const ingresanEsteAño = estudiantes.filter((e) => {
      const primera = ordenarPorIngreso(e.carreras)[0];
      return primera && primera.anio_ingreso === añoActual;
    });
    if (ingresanEsteAño.length > 0) {
      const generacionesIngresantes = agruparConteo(
        ingresanEsteAño,
        (e) => String(e.generacion_rel.año),
      );
      content.push(
        InformeBuilder.paragrafBuilder(
          `La Tabla ${n} muestra cuántos becarios comenzaron su primera carrera ` +
            `universitaria durante ${añoActual}, agrupados por la generación a la ` +
            `que pertenecen (no necesariamente la más nueva: suele ser una ` +
            `generación que ya lleva un tiempo en la Fundación y recién ahora ` +
            `entra a la educación superior).`,
          14,
        ),
      );
      content.push(
        InformeBuilder.tableCaption(n, `Becarios que ingresan a la universidad en ${añoActual}`),
        tablaDesglose(
          generacionesIngresantes,
          ingresanEsteAño.length,
          'Generación',
        ),
      );
      n++;
    }

    // ── Anexo ─────────────────────────────────────────────────────────────────

    content.push({
      text: 'Anexo: listado histórico de becarias y becarios',
      style: 'header',
      margin: [0, 16, 0, 6] as [number, number, number, number],
    });
    content.push(
      InformeBuilder.paragrafBuilder(
        `La Tabla ${n} lista a todos los becarios que ha tenido la Fundación ` +
          `desde su creación, con su generación y su situación académica actual.`,
      ),
    );
    const listado = [...estudiantes].sort(
      (a, b) => a.apellido.localeCompare(b.apellido) || a.nombre.localeCompare(b.nombre),
    );
    content.push(
      InformeBuilder.tableCaption(n, 'Listado histórico de becarios'),
      InformeBuilder.tableBuilder(
        ['Apellido', 'Nombre', 'Generación', 'Situación actual'],
        listado.map((e) => [
          e.apellido,
          e.nombre,
          String(e.generacion_rel.año),
          situaciones.get(e.rut_estudiante)!,
        ]),
        ['*', '*', 75, '*'],
        ['left', 'left', 'center', 'left'] as Alignment[],
      ),
    );

    const docDefinition = {
      content,
      footer: () => InformeBuilder.footerBuilder(),
      styles: InformeBuilder.styles,
    };

    return this.printer.createPdf(docDefinition);
  }
}
