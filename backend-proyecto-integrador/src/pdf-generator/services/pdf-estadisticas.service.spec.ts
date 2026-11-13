import { PdfEstadisticasGenerator } from './pdf-estadisticas.service';
import { PdfPrinterProvider } from '../providers/pdf-printer.provider';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreatePdfEstadisticasDto } from '../dto';

const FAKE_BUFFER = Buffer.from('pdf-estadisticas');

const mockPrinter = { createPdf: jest.fn() };
const mockPrisma = { estudiante: { findMany: jest.fn() } };

function carrera(overrides: Record<string, unknown> = {}) {
  return {
    codigo_carrera: 1,
    nombre: 'Ingeniería Civil Industrial',
    duracion_sem: 10,
    anio_ingreso: 2015,
    estado: 'ACTIVO',
    universidad: { nombre: 'Universidad de La Serena', comuna: { nombre: 'La Serena' } },
    historial_estados: [],
    ramos: [],
    ...overrides,
  };
}

function ramoEn(year: number, semestre: 'PRIMER_SEMESTRE' | 'SEGUNDO_SEMESTRE', tipo = 'REGULAR') {
  return { semestre: { year, semestre, tipo } };
}

const AÑO_ACTUAL = new Date().getFullYear();

// Un becario por cada "situación académica" posible, más un caso de cambio
// de carrera (Elena) para probar la regla de la Tabla de cambios de carrera.
const estudiantesFake = [
  {
    rut_estudiante: '1-1',
    nombre: 'Ana',
    apellido: 'Titulada',
    genero: 'FEMENINO',
    generacion_rel: { año: 2012 },
    liceo: { nombre: 'Liceo A', comuna: 'La Serena', especialidad: 'Científico Humanista' },
    carreras: [
      carrera({
        codigo_carrera: 1,
        anio_ingreso: 2013,
        estado: 'TITULADO',
        // El estado se registró en la plataforma recién en 2020 (carga
        // administrativa tardía) — dos años después de que Ana realmente
        // terminó. La duración real NO debe salir de esta fecha.
        historial_estados: [{ estado_nuevo: 'TITULADO', created_at: new Date('2020-03-10') }],
        // Su último semestre real con ramos es 2018/2S. El recuperativo de
        // verano 2019 no debe mover el punto final del cálculo.
        ramos: [
          ramoEn(2018, 'SEGUNDO_SEMESTRE'),
          { semestre: { year: 2019, semestre: 'VERANO', tipo: 'RECUPERATIVO' } },
        ],
      }),
    ],
  },
  {
    rut_estudiante: '2-2',
    nombre: 'Bruno',
    apellido: 'Egresado',
    genero: 'MASCULINO',
    generacion_rel: { año: 2013 },
    liceo: { nombre: 'Liceo B', comuna: 'Coquimbo', especialidad: 'Técnico Profesional' },
    carreras: [
      carrera({
        codigo_carrera: 2,
        anio_ingreso: 2014,
        estado: 'EGRESADO',
        historial_estados: [{ estado_nuevo: 'EGRESADO', created_at: new Date('2019-12-01') }],
        ramos: [ramoEn(2019, 'PRIMER_SEMESTRE')],
      }),
    ],
  },
  {
    rut_estudiante: '3-3',
    nombre: 'Carla',
    apellido: 'Estudiante',
    genero: 'FEMENINO',
    generacion_rel: { año: 2019 },
    liceo: { nombre: 'Liceo A', comuna: 'La Serena', especialidad: 'Científico Humanista' },
    carreras: [carrera({ codigo_carrera: 3, anio_ingreso: 2021, estado: 'ACTIVO' })],
  },
  {
    rut_estudiante: '4-4',
    nombre: 'Diego',
    apellido: 'Suspendido',
    genero: 'MASCULINO',
    generacion_rel: { año: 2018 },
    liceo: { nombre: 'Liceo C', comuna: 'Vicuña', especialidad: 'Técnico Profesional' },
    carreras: [
      carrera({
        codigo_carrera: 4,
        anio_ingreso: 2019,
        estado: 'SUSPENDIDO',
        historial_estados: [{ estado_nuevo: 'SUSPENDIDO', created_at: new Date('2022-03-01') }],
      }),
    ],
  },
  {
    rut_estudiante: '5-5',
    nombre: 'Elena',
    apellido: 'Cambio',
    genero: 'FEMENINO',
    generacion_rel: { año: 2016 },
    liceo: { nombre: 'Liceo B', comuna: 'Coquimbo', especialidad: 'Técnico Profesional' },
    carreras: [
      carrera({
        codigo_carrera: 5,
        anio_ingreso: 2017,
        estado: 'RETIRADO',
        historial_estados: [{ estado_nuevo: 'RETIRADO', created_at: new Date('2018-05-01') }],
      }),
      carrera({
        codigo_carrera: 6,
        anio_ingreso: 2019,
        estado: 'ACTIVO',
        nombre: 'Derecho',
      }),
    ],
  },
  {
    rut_estudiante: '6-6',
    nombre: 'Franco',
    apellido: 'Retirado',
    genero: 'MASCULINO',
    generacion_rel: { año: 2015 },
    liceo: { nombre: 'Liceo A', comuna: 'La Serena', especialidad: 'Científico Humanista' },
    carreras: [
      carrera({
        codigo_carrera: 7,
        anio_ingreso: 2016,
        estado: 'RETIRADO',
        historial_estados: [{ estado_nuevo: 'RETIRADO', created_at: new Date('2017-01-01') }],
      }),
    ],
  },
  {
    rut_estudiante: '7-7',
    nombre: 'Gabriela',
    apellido: 'Media',
    genero: 'FEMENINO',
    generacion_rel: { año: AÑO_ACTUAL },
    liceo: { nombre: 'Liceo C', comuna: 'Vicuña', especialidad: 'Técnico Profesional' },
    carreras: [],
  },
  {
    rut_estudiante: '8-8',
    nombre: 'Hugo',
    apellido: 'NoMatriculado',
    genero: 'MASCULINO',
    generacion_rel: { año: AÑO_ACTUAL - 5 },
    liceo: { nombre: 'Liceo B', comuna: 'Coquimbo', especialidad: 'Técnico Profesional' },
    carreras: [],
  },
];

const dtoValido: CreatePdfEstadisticasDto = {};

describe('PdfEstadisticasGenerator', () => {
  let service: PdfEstadisticasGenerator;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrinter.createPdf.mockResolvedValue(FAKE_BUFFER);
    mockPrisma.estudiante.findMany.mockResolvedValue(estudiantesFake);
    service = new PdfEstadisticasGenerator(
      mockPrinter as unknown as PdfPrinterProvider,
      mockPrisma as unknown as PrismaService,
    );
  });

  it('debe retornar un Buffer', async () => {
    const resultado = await service.pdfGenerate(dtoValido);
    expect(resultado).toBeInstanceOf(Buffer);
  });

  it('debe llamar a printer.createPdf exactamente una vez', async () => {
    await service.pdfGenerate(dtoValido);
    expect(mockPrinter.createPdf).toHaveBeenCalledTimes(1);
  });

  it('debe incluir las secciones principales del informe', async () => {
    await service.pdfGenerate(dtoValido);
    const [docDefinition] = mockPrinter.createPdf.mock.calls[0];
    const contenidoStr = JSON.stringify(docDefinition.content);
    expect(contenidoStr).toContain('1. Estadísticas generales de becarias y becarios');
    expect(contenidoStr).toContain('2. Becarias y becarios en estudios superiores');
    expect(contenidoStr).toContain('3. Becarias y becarios egresados y titulados');
    expect(contenidoStr).toContain('4. Becarias y becarios retirados');
    expect(contenidoStr).toContain('5. Trayectoria durante el año en curso');
    expect(contenidoStr).toContain('"Anexo: listado histórico de becarias y becarios"');
    expect(contenidoStr).not.toContain('Becarios según carrera');
  });

  it('debe clasificar la situación académica de cada becario en el anexo', async () => {
    await service.pdfGenerate(dtoValido);
    const [docDefinition] = mockPrinter.createPdf.mock.calls[0];
    const contenidoStr = JSON.stringify(docDefinition.content);
    expect(contenidoStr).toContain('Titulada');
    expect(contenidoStr).toContain('NoMatriculado');
    expect(contenidoStr).toContain('Cursando enseñanza media');
    expect(contenidoStr).toContain('No matriculado');
  });

  it('debe contar el cambio de carrera solo para quien empezó la siguiente carrera después del abandono', async () => {
    await service.pdfGenerate(dtoValido);
    const [docDefinition] = mockPrinter.createPdf.mock.calls[0];
    const contenidoStr = JSON.stringify(docDefinition.content);
    // De los 5 becarios en educación superior (Ana, Bruno, Carla, Diego, Elena
    // — Franco queda fuera por retirado), solo Elena cambió de carrera: 1/5 = 20,0%.
    expect(contenidoStr).toContain('Con cambio de carrera');
    expect(contenidoStr).toContain('20,0%');
  });

  it('debe calcular la duración real desde el último semestre con ramos, no desde la fecha del cambio de estado', async () => {
    await service.pdfGenerate(dtoValido);
    const [docDefinition] = mockPrinter.createPdf.mock.calls[0];
    const contenidoStr = JSON.stringify(docDefinition.content);
    expect(contenidoStr).toContain('Duración nominal, real y sobreduración');

    // Ana: ingreso 2013, último ramo regular en 2018/2S (el recuperativo de
    // verano 2019 no cuenta) -> (2018-2013)*2 + 2 = 12 semestres reales.
    // Su TITULADO se registró en la plataforma en 2020 (carga tardía); si el
    // cálculo dependiera de esa fecha en vez de sus ramos, daría 15 en lugar
    // de 12 -- ese número NO debe aparecer.
    expect(contenidoStr).toContain('"12"');
    expect(contenidoStr).not.toContain('"15"');

    // Bruno: ingreso 2014, último ramo regular en 2019/1S -> 11 semestres reales.
    expect(contenidoStr).toContain('"11"');
  });

  it('debe agregar fila de total a todas las tablas salvo la de generaciones', async () => {
    await service.pdfGenerate(dtoValido);
    const tablas = tablasDe(mockPrinter.createPdf.mock.calls[0][0]);
    const [generaciones, ...resto] = tablas;
    expect(textoCelda(generaciones.at(-1)![0])).not.toBe('Total');
    for (const body of resto) {
      expect(textoCelda(body.at(-1)![0])).toMatch(/^Total/);
    }
    // Género: 4 femenino + 4 masculino = 8 de 8.
    const genero = resto[0];
    expect(genero.at(-1)!.map(textoCelda)).toEqual(['Total', '8', '100,0%']);
  });

  it('debe ordenar el anexo por generación, de la más nueva a la más antigua', async () => {
    await service.pdfGenerate(dtoValido);
    const anexo = tablasDe(mockPrinter.createPdf.mock.calls[0][0]).at(-1)!;
    expect(anexo.slice(1).map((fila) => textoCelda(fila[0]))).toEqual([
      'Media', 'NoMatriculado', 'Estudiante', 'Suspendido', 'Cambio',
      'Retirado', 'Egresado', 'Titulada', 'Total',
    ]);
  });

  it('debe clasificar en la trayectoria del año a todo becario que cuenta en el total', async () => {
    // Carrera antigua activa y carrera más reciente retirada antes de este año:
    // entra al total por la activa y debe contar como que continúa.
    mockPrisma.estudiante.findMany.mockResolvedValue([
      {
        ...estudiantesFake[2],
        carreras: [
          carrera({ codigo_carrera: 1, anio_ingreso: 2018, estado: 'ACTIVO' }),
          carrera({
            codigo_carrera: 2,
            anio_ingreso: 2020,
            estado: 'RETIRADO',
            historial_estados: [{ estado_nuevo: 'RETIRADO', created_at: new Date('2021-04-01') }],
          }),
        ],
      },
    ]);
    await service.pdfGenerate(dtoValido);
    const trayectoria = tablasDe(mockPrinter.createPdf.mock.calls[0][0]).find(
      (body) => textoCelda(body[0][0]) === 'SITUACIÓN',
    )!;
    expect(trayectoria[1].map(textoCelda)).toEqual(['Continúan sus estudios con normalidad', '1', '100,0%']);
    expect(trayectoria.at(-1)!.map(textoCelda)).toEqual(['Total', '1', '100,0%']);
  });

  describe('pageBreakBefore', () => {
    const nodo = (id: string, verticalRatio: number) => ({ id, startPosition: { verticalRatio } });
    let saltoAntes: (n: unknown, q: unknown) => boolean;

    beforeEach(async () => {
      await service.pdfGenerate(dtoValido);
      saltoAntes = mockPrinter.createPdf.mock.calls[0][0].pageBreakBefore;
    });

    const consultas = (mismaPagina: unknown[], siguiente: unknown[]) => ({
      getFollowingNodesOnPage: () => mismaPagina,
      getNodesOnNextPage: () => siguiente,
    });

    it('mueve el bloque a la página siguiente si allí cabe completo', () => {
      expect(saltoAntes(nodo('bloque-3', 0.6), consultas([], [nodo('fin-bloque-3', 0.3)]))).toBe(true);
    });

    it('no mueve el bloque si termina en la misma página', () => {
      expect(saltoAntes(nodo('bloque-3', 0.8), consultas([nodo('fin-bloque-3', 0.9)], []))).toBe(false);
    });

    it('deja cortarse el bloque si no cabe en una página', () => {
      expect(saltoAntes(nodo('bloque-3', 0.4), consultas([], [nodo('fin-bloque-3', 0.9)]))).toBe(false);
      expect(saltoAntes(nodo('bloque-3', 0.4), consultas([], []))).toBe(false);
    });

    it('mueve el bloque que se va a cortar si empieza al pie de la página', () => {
      expect(saltoAntes(nodo('bloque-3', 0.9), consultas([], []))).toBe(true);
    });

    it('ignora los nodos que no inician un bloque', () => {
      expect(saltoAntes(nodo('fin-bloque-3', 0.95), consultas([], []))).toBe(false);
    });
  });
});

type Celda = { text?: unknown };

function tablasDe(docDefinition: { content: unknown[] }): Celda[][][] {
  return docDefinition.content
    .filter((c): c is { table: { body: Celda[][] } } => typeof c === 'object' && c !== null && 'table' in c)
    .map((c) => c.table.body);
}

function textoCelda(celda: Celda): string {
  return String(celda.text);
}
