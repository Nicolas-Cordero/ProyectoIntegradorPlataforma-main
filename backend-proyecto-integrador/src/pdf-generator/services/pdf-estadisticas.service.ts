import { Injectable } from '@nestjs/common';
import type { Content, Alignment } from 'pdfmake';
import type { ContentTable } from 'pdfmake/interfaces';
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

interface RamoSemestreItem {
  semestre: { year: number; semestre: string; tipo: string };
}

interface CarreraItem {
  codigo_carrera: number;
  nombre: string;
  duracion_sem: number;
  anio_ingreso: number;
  estado: EstadoEstudiante;
  universidad: { nombre: string; comuna: { nombre: string } };
  historial_estados: HistorialItem[];
  ramos: RamoSemestreItem[];
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

// Carrera por la que un estudiante cuenta como titulado o egresado: la
// TITULADA, o la EGRESADA si no tiene ninguna titulada (misma prioridad que
// clasificarSituacion); entre varias, la más reciente. No se usa la
// representativa porque puede ser una carrera posterior aún en curso.
function carreraEgresada(carreras: CarreraItem[]): CarreraItem | null {
  const tituladas = carreras.filter((c) => c.estado === 'TITULADO');
  return carreraRepresentativa(
    tituladas.length > 0
      ? tituladas
      : carreras.filter((c) => c.estado === 'EGRESADO'),
  );
}

// Sin carreras, se aproxima con generacion.año porque el sistema no registra
// el año escolar (media) actual de cada estudiante — es una estimación, no un
// dato exacto.
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

// Cuenta como cambio de carrera (booleano) solo si una carrera fue abandonada
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

// Duración real en semestres: cantidad de semestres REGULARES (no
// recuperativos de invierno/verano, que la duración nominal tampoco cuenta)
// con al menos un ramo cargado en el avance curricular de la carrera.
//
// Los semestres sin ramos no cuentan: si el estudiante suspendió estudios un
// año, esos dos semestres no tienen ramos y quedan fuera del conteo. Tampoco
// se usa la fecha en que se registró el cambio de estado en la plataforma,
// que puede ser muy posterior al hecho real (carga de datos históricos).
//
// null si la carrera no llegó a EGRESADO/TITULADO, o no tiene ramos en
// ningún semestre regular.
function duracionRealSemestres(carrera: CarreraItem): number | null {
  const llegoAEgresarOTitular = carrera.historial_estados.some(
    (h) => h.estado_nuevo === 'TITULADO' || h.estado_nuevo === 'EGRESADO',
  );
  if (!llegoAEgresarOTitular) return null;

  // (year, semestre) identifica al semestre (@@unique en el esquema); varios
  // ramos del mismo semestre cuentan una sola vez.
  const semestresConRamos = new Set(
    carrera.ramos
      .filter(({ semestre: s }) => s.tipo === 'REGULAR')
      .map(({ semestre: s }) => `${s.year}-${s.semestre}`),
  );
  return semestresConRamos.size > 0 ? semestresConRamos.size : null;
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

function promedio(valores: number[]): string {
  const prom = valores.reduce((acc, v) => acc + v, 0) / valores.length;
  return prom.toFixed(1).replace('.', ',');
}

// La fila de total suma las filas (no repite `total`), así que si algún
// grupo quedara fuera se vería en el porcentaje.
function tablaDesglose(
  grupos: Array<[string, number]>,
  total: number,
  etiquetaColumna: string,
): ContentTable {
  const suma = grupos.reduce((acc, [, n]) => acc + n, 0);
  return InformeBuilder.tableBuilder(
    [etiquetaColumna, 'N°', '%'],
    grupos.map(([label, n]) => [label, String(n), pct(n, total)]),
    ['*', 60, 70],
    ['left', 'right', 'right'] as Alignment[],
    ['Total', String(suma), pct(suma, total)],
  );
}

// Un bloque es lo que presenta una tabla (título de sección, párrafo, rótulo)
// más la tabla, y no debe quedar cortado entre páginas. No se usa
// `unbreakable`: pdfmake no soporta bloques de más de una página y trunca el
// resto sin avisar. En su lugar se marcan el primer texto del bloque y un
// texto mínimo justo después de la tabla (pdfmake solo registra la posición
// de los textos, no de tablas ni stacks; y las celdas no sirven de marca
// porque con `dontBreakRows` sus posiciones se calculan fuera de la página),
// y `saltoAntesDeBloque` decide el salto.
function bloque(id: number, presentacion: Content[], tabla: ContentTable): Content[] {
  (presentacion[0] as { id?: string }).id = `bloque-${id}`;
  tabla.table.dontBreakRows = true;
  const finDeBloque: Content = {
    text: ' ',
    fontSize: 1,
    id: `fin-bloque-${id}`,
  };
  return [...presentacion, tabla, finDeBloque];
}

interface NodoPdf {
  id?: string;
  startPosition: { verticalRatio: number };
}

// Margen (fracción de la altura útil) para errores de redondeo al comparar
// posiciones.
const HOLGURA = 0.01;

// Un bloque que igual se va a cortar se mueve a una página nueva si empieza
// por debajo de esta fracción de la página, para que el título y el párrafo
// no queden solos al pie.
const INICIO_TARDIO = 0.7;

// Callback `pageBreakBefore` de pdfmake 0.3:
// - si el bloque termina en la misma página, no hay corte;
// - si termina en la página siguiente más arriba de donde empezó, cabe
//   completo en una página nueva y se mueve;
// - si no, no cabe en una página y se deja cortar (el encabezado de la tabla
//   se repite), salvo que empiece al pie de la página.
function saltoAntesDeBloque(
  nodo: NodoPdf,
  consultas: {
    getFollowingNodesOnPage: () => NodoPdf[];
    getNodesOnNextPage: () => NodoPdf[];
  },
): boolean {
  if (!nodo.id?.startsWith('bloque-')) return false;
  const idFin = `fin-${nodo.id}`;
  if (consultas.getFollowingNodesOnPage().some((n) => n.id === idFin)) {
    return false;
  }
  const inicio = nodo.startPosition.verticalRatio;
  const fin = consultas.getNodesOnNextPage().find((n) => n.id === idFin);
  if (fin && fin.startPosition.verticalRatio + HOLGURA < inicio) {
    return true;
  }
  return inicio > INICIO_TARDIO;
}

function tituloSeccion(texto: string): Content {
  return {
    text: texto,
    style: 'header',
    margin: [0, 16, 0, 6] as [number, number, number, number],
  };
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
            universidad: {
              select: { nombre: true, comuna: { select: { nombre: true } } },
            },
            historial_estados: {
              orderBy: { created_at: 'asc' },
              select: { estado_nuevo: true, created_at: true },
            },
            ramos: {
              select: {
                semestre: { select: { year: true, semestre: true, tipo: true } },
              },
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

    // Agrega "párrafo + rótulo + tabla" como un bloque que no se corta.
    // `previo` antepone lo que no debe quedar huérfano antes del párrafo
    // (título y párrafo de introducción de una sección).
    const pushTabla = (
      parrafo: string,
      titulo: string,
      tabla: ContentTable,
      previo: Content[] = [],
    ) => {
      content.push(
        ...bloque(
          n,
          [
            ...previo,
            InformeBuilder.paragrafBuilder(parrafo, previo.length > 0 ? 0 : 14),
            InformeBuilder.tableCaption(n, titulo),
          ],
          tabla,
        ),
      );
      n++;
    };

    // ── 1. Estadísticas generales ───────────────────────────────────────────

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
    pushTabla(
      `Desde su creación, la Fundación ha becado a un total de ${totalHistorico} ` +
        `estudiantes. La Tabla ${n} a continuación muestra cuántos becarios ` +
        `ingresaron cada año (su "generación"), junto con el acumulado y el ` +
        `porcentaje que representa cada generación sobre el total histórico.`,
      'Becarios según año de ingreso (generación)',
      InformeBuilder.tableBuilder(
        ['Generación', 'N°', 'N° acumulado', '% acumulado'],
        filasGeneracion,
        ['*', 55, 90, 85],
        ['left', 'right', 'right', 'right'] as Alignment[],
      ),
      [
        {
          text: '1. Estadísticas generales de becarias y becarios',
          style: 'header',
          margin: [0, 10, 0, 6] as [number, number, number, number],
        },
      ],
    );

    pushTabla(
      `La Tabla ${n} muestra la composición de género de la comunidad de ` +
        `becarios, según las categorías que el sistema permite registrar hoy.`,
      'Becarios según género',
      tablaDesglose(
        agruparConteo(estudiantes, (e) => GENERO_LABELS[e.genero]),
        totalHistorico,
        'Género',
      ),
    );

    pushTabla(
      `La Tabla ${n} indica de qué liceos de origen provienen los becarios, ` +
        `lo que permite ver qué establecimientos aportan más estudiantes al ` +
        `programa.`,
      'Becarios según liceo de origen',
      tablaDesglose(
        agruparConteo(estudiantes, (e) => e.liceo.nombre),
        totalHistorico,
        'Liceo',
      ),
    );

    pushTabla(
      `La Tabla ${n} agrupa a los becarios según la comuna del liceo del que ` +
        `provienen, para ver desde qué zonas llega el programa.`,
      'Becarios según comuna del liceo de origen',
      tablaDesglose(
        agruparConteo(estudiantes, (e) => e.liceo.comuna),
        totalHistorico,
        'Comuna',
      ),
    );

    pushTabla(
      `La Tabla ${n} muestra la modalidad de enseñanza media de la que ` +
        `provienen los becarios, tal como está registrada en el sistema para ` +
        `cada liceo.`,
      'Becarios según modalidad del liceo de origen',
      tablaDesglose(
        agruparConteo(estudiantes, (e) => e.liceo.especialidad),
        totalHistorico,
        'Modalidad',
      ),
    );

    pushTabla(
      `La Tabla ${n} resume en qué etapa se encuentra cada becario hoy: si ya ` +
        `se tituló o egresó, si está cursando su carrera, si su beca está ` +
        `suspendida, si se retiró del programa, o si aún no ingresa a la ` +
        `educación superior. Cuando un becario no tiene ninguna carrera ` +
        `registrada, se estima si todavía cursa enseñanza media o si no se ` +
        `matriculó, usando el año en que se unió a la Fundación como ` +
        `referencia (el sistema no registra el curso escolar de cada ` +
        `estudiante, por lo que esta distinción puntual es una aproximación).`,
      'Becarios según situación académica actual',
      tablaDesglose(
        agruparConteo(estudiantes, (e) => situaciones.get(e.rut_estudiante)!),
        totalHistorico,
        'Situación académica',
      ),
    );

    // ── 2. Caracterización en estudios superiores ───────────────────────────
    // Sin tabla por carrera: el nombre de la carrera es texto libre por
    // estudiante (no hay catálogo), así que agrupar por él junta carreras
    // distintas y separa las mismas escritas de otra forma.

    const enEducacionSuperior = estudiantes.filter((e) => {
      const s = situaciones.get(e.rut_estudiante)!;
      return e.carreras.length > 0 && s !== 'Retirado';
    });
    const totalSuperior = enEducacionSuperior.length;

    pushTabla(
      `La Tabla ${n} muestra en qué institución de educación superior estudian ` +
        `estos becarios.`,
      'Becarios según institución de educación superior',
      tablaDesglose(
        agruparConteo(
          enEducacionSuperior,
          (e) => carreraRepresentativa(e.carreras)!.universidad.nombre,
        ),
        totalSuperior,
        'Institución',
      ),
      [
        tituloSeccion('2. Becarias y becarios en estudios superiores'),
        InformeBuilder.paragrafBuilder(
          `Esta sección describe a los ${totalSuperior} becarios que en algún ` +
            `momento ingresaron a la educación superior y no se han retirado del ` +
            `programa (excluye a quienes aún cursan enseñanza media, a quienes no ` +
            `se han matriculado, y a los becarios retirados).`,
        ),
      ],
    );

    pushTabla(
      `La Tabla ${n} muestra en qué ciudad (comuna de la institución) estudian ` +
        `estos becarios.`,
      'Becarios según ciudad de estudio',
      tablaDesglose(
        agruparConteo(
          enEducacionSuperior,
          (e) => carreraRepresentativa(e.carreras)!.universidad.comuna.nombre,
        ),
        totalSuperior,
        'Ciudad',
      ),
    );

    const conCambio = enEducacionSuperior.filter((e) =>
      tuvoCambioDeCarrera(e.carreras),
    ).length;
    pushTabla(
      `La Tabla ${n} indica cuántos becarios abandonaron una carrera ` +
        `(suspendida, retirada o eliminada) y luego comenzaron otra distinta, ` +
        `es decir, cambiaron de carrera durante su trayectoria.`,
      'Becarios según cambio de carrera',
      tablaDesglose(
        [
          ['Con cambio de carrera', conCambio],
          ['Sin cambio de carrera', totalSuperior - conCambio],
        ],
        totalSuperior,
        'Permanencia en carrera',
      ),
    );

    // ── 3. Egresados y titulados ─────────────────────────────────────────────

    // Cada becario con al menos una carrera titulada o egresada, junto con
    // esa carrera (ver carreraEgresada).
    const egresadosTitulados = estudiantes.flatMap((e) => {
      const c = carreraEgresada(e.carreras);
      return c ? [{ e, c }] : [];
    });

    content.push(
      ...bloque(
        n,
        [
          tituloSeccion('3. Becarias y becarios egresados y titulados'),
          InformeBuilder.paragrafBuilder(
            `A la fecha, ${egresadosTitulados.length} becarios han egresado o se ` +
              `han titulado de su carrera. La Tabla ${n} los lista de forma ` +
              `individual, con su liceo de origen, carrera e institución.`,
          ),
          InformeBuilder.tableCaption(n, 'Becarios egresados y titulados'),
        ],
        InformeBuilder.tableBuilder(
          ['Apellido', 'Nombre', 'Gen.', 'Liceo', 'Carrera', 'Institución', 'Estado'],
          egresadosTitulados.map(({ e, c }) => [
            e.apellido,
            e.nombre,
            String(e.generacion_rel.año),
            e.liceo.nombre,
            c.nombre,
            c.universidad.nombre,
            c.estado === 'TITULADO' ? 'Titulado' : 'Egresado',
          ]),
          [70, 70, 35, '*', '*', 65, 60],
          ['left', 'left', 'center', 'left', 'left', 'left', 'center'] as Alignment[],
          ['Total', `${egresadosTitulados.length} becarios`, '', '', '', '', ''],
        ),
      ),
    );
    n++;

    const conDuracion = egresadosTitulados
      .map(({ e, c }) => {
        const real = duracionRealSemestres(c);
        return real !== null ? { e, c, real } : null;
      })
      .filter((x): x is { e: EstudianteItem; c: CarreraItem; real: number } => x !== null);

    if (conDuracion.length > 0) {
      const sobreduracionProm =
        conDuracion.reduce((acc, { c, real }) => acc + (real - c.duracion_sem), 0) /
        conDuracion.length;
      pushTabla(
        `La Tabla ${n} compara, para cada becario egresado o titulado, la ` +
          `duración oficial de su carrera con la cantidad real de semestres ` +
          `que le tomó completarla, para dimensionar cuánto se atrasan en ` +
          `promedio los becarios respecto al plan de estudios.`,
        'Duración nominal, real y sobreduración',
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
          [
            'Total / promedio',
            `${conDuracion.length} becarios`,
            '',
            promedio(conDuracion.map(({ c }) => c.duracion_sem)),
            promedio(conDuracion.map(({ real }) => real)),
            promedio(conDuracion.map(({ c, real }) => real - c.duracion_sem)),
          ],
        ),
      );
      content.push(
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
    }

    pushTabla(
      `La Tabla ${n} agrupa a los becarios egresados y titulados según la ` +
        `institución en la que estudiaron.`,
      'Egresados y titulados según institución',
      tablaDesglose(
        agruparConteo(egresadosTitulados, ({ c }) => c.universidad.nombre),
        egresadosTitulados.length,
        'Institución',
      ),
    );

    // ── 4. Retirados ──────────────────────────────────────────────────────────

    const retirados = estudiantes.filter(
      (e) => situaciones.get(e.rut_estudiante)! === 'Retirado',
    );

    const tituloRetirados = tituloSeccion('4. Becarias y becarios retirados');
    const parrafoRetirados =
      `Desde su creación, ${retirados.length} becarios han abandonado el ` +
      `programa. La Tabla ${n} muestra de qué liceos de origen provienen.`;
    if (retirados.length > 0) {
      pushTabla(
        parrafoRetirados,
        'Becarios retirados según liceo de origen',
        tablaDesglose(
          agruparConteo(retirados, (e) => e.liceo.nombre),
          retirados.length,
          'Liceo',
        ),
        [tituloRetirados],
      );
    } else {
      content.push(
        tituloRetirados,
        InformeBuilder.paragrafBuilder(parrafoRetirados),
        InformeBuilder.tableCaption(n, 'Becarios retirados según liceo de origen'),
        InformeBuilder.paragrafBuilder('No hay becarios retirados registrados.'),
      );
      n++;
    }

    // ── 5. Trayectoria durante el año en curso ──────────────────────────────

    // Cada becario se clasifica por la carrera que lo hizo entrar a la tabla
    // (activa hoy o con cambios de estado este año); si hay varias, la más
    // reciente. Así todo becario contado cae en exactamente una fila: si tuvo
    // cambios este año manda el último, y si no los tuvo es porque la carrera
    // está activa.
    const carreraDelAño = (c: CarreraItem) =>
      c.anio_ingreso <= añoActual &&
      (c.estado === 'ACTIVO' ||
        c.historial_estados.some((h) => h.created_at >= inicioAño));
    const universitariosDelAño = estudiantes.filter((e) =>
      e.carreras.some(carreraDelAño),
    );
    let continuan = 0;
    let egresaronEsteAño = 0;
    let congelaronEsteAño = 0;
    let seRetiraronEsteAño = 0;
    for (const e of universitariosDelAño) {
      const carrera = carreraRepresentativa(e.carreras.filter(carreraDelAño))!;
      const transicionesDelAño = carrera.historial_estados.filter(
        (h) => h.created_at >= inicioAño,
      );
      const estadoFinal =
        transicionesDelAño[transicionesDelAño.length - 1]?.estado_nuevo ?? carrera.estado;
      if (estadoFinal === 'TITULADO' || estadoFinal === 'EGRESADO') {
        egresaronEsteAño++;
      } else if (estadoFinal === 'SUSPENDIDO') {
        congelaronEsteAño++;
      } else if (estadoFinal === 'RETIRADO' || estadoFinal === 'ELIMINADO') {
        seRetiraronEsteAño++;
      } else {
        continuan++;
      }
    }
    content.push(
      ...bloque(
        n,
        [
          tituloSeccion(`5. Trayectoria durante el año en curso (${añoActual})`),
          InformeBuilder.paragrafBuilder(
            `Esta sección resume qué ha pasado, desde el 1 de enero de ${añoActual} ` +
              `hasta la fecha, con los becarios que estudian en la educación ` +
              `superior: cuántos continúan su carrera con normalidad, cuántos ` +
              `egresaron o se titularon, cuántos congelaron sus estudios y cuántos ` +
              `se retiraron. Se recalcula cada vez que se genera este informe, por ` +
              `lo que siempre refleja lo ocurrido desde el inicio del año hasta hoy.`,
          ),
          InformeBuilder.tableCaption(n, `Trayectoria de becarios en educación superior en ${añoActual}`),
        ],
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
      ),
    );
    n++;

    const generacionNueva = Math.max(
      ...estudiantes.map((e) => e.generacion_rel.año),
    );
    const nuevaGeneracion = estudiantes.filter(
      (e) => e.generacion_rel.año === generacionNueva,
    );
    pushTabla(
      `La Tabla ${n} muestra de qué liceos y comunas provienen los becarios ` +
        `de la Generación ${generacionNueva}, la más reciente en incorporarse ` +
        `a la Fundación.`,
      `Liceos de origen — Generación ${generacionNueva}`,
      tablaDesglose(
        agruparConteo(nuevaGeneracion, (e) => `${e.liceo.nombre} (${e.liceo.comuna})`),
        nuevaGeneracion.length,
        'Liceo (comuna)',
      ),
    );

    const ingresanEsteAño = estudiantes.filter((e) => {
      const primera = ordenarPorIngreso(e.carreras)[0];
      return primera && primera.anio_ingreso === añoActual;
    });
    if (ingresanEsteAño.length > 0) {
      pushTabla(
        `La Tabla ${n} muestra cuántos becarios comenzaron su primera carrera ` +
          `en una institución de educación superior durante ${añoActual}, ` +
          `agrupados por la generación a la ` +
          `que pertenecen (no necesariamente la más nueva: suele ser una ` +
          `generación que ya lleva un tiempo en la Fundación y recién ahora ` +
          `entra a la educación superior).`,
        `Becarios que ingresan a la educación superior en ${añoActual}`,
        tablaDesglose(
          agruparConteo(ingresanEsteAño, (e) => String(e.generacion_rel.año)),
          ingresanEsteAño.length,
          'Generación',
        ),
      );
    }

    // ── Anexo ─────────────────────────────────────────────────────────────────
    // Única tabla que puede cortarse entre páginas: no se arma como bloque.

    content.push(
      tituloSeccion('Anexo: listado histórico de becarias y becarios'),
      InformeBuilder.paragrafBuilder(
        `La Tabla ${n} lista a todos los becarios que ha tenido la Fundación ` +
          `desde su creación, de la generación más nueva a la más antigua, con ` +
          `su situación académica actual.`,
      ),
    );
    const listado = [...estudiantes].sort(
      (a, b) =>
        b.generacion_rel.año - a.generacion_rel.año ||
        a.apellido.localeCompare(b.apellido) ||
        a.nombre.localeCompare(b.nombre),
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
        ['Total', `${listado.length} becarios`, '', ''],
      ),
    );
    (content[content.length - 1] as ContentTable).table.dontBreakRows = true;

    const docDefinition = {
      content,
      footer: () => InformeBuilder.footerBuilder(),
      styles: InformeBuilder.styles,
      pageBreakBefore: saltoAntesDeBloque,
    };

    return this.printer.createPdf(docDefinition);
  }
}
