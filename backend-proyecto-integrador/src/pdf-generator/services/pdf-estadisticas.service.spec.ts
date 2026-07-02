import { PdfEstadisticasGenerator } from './pdf-estadisticas.service';
import { PdfPrinterProvider } from '../providers/pdf-printer.provider';
import type { CreatePdfEstadisticasDto } from '../dto';

const FAKE_BUFFER = Buffer.from('pdf-estadisticas');

const mockPrinter = { createPdf: jest.fn() };

const dtoValido: CreatePdfEstadisticasDto = {
  kpis: {
    total: 120,
    activos: 80,
    titulados: 15,
    egresados: 10,
    retirados: 15,
    tasaDesercion: 12.5,
    nuevos: 25,
    nuevosAño: 2024,
  },
  estadoData: [
    { label: 'Estudiando', count: 80, pct: 66.7 },
    { label: 'Retirado/a', count: 15, pct: 12.5 },
  ],
  generoData: [
    { label: 'Femenino', count: 65, pct: 54.2 },
    { label: 'Masculino', count: 55, pct: 45.8 },
  ],
  porGeneracion: [
    { año: 2020, count: 30 },
    { año: 2021, count: 25 },
    { año: 2022, count: 28 },
    { año: 2023, count: 25 },
    { año: 2024, count: 12 },
  ],
  cohorteData: {
    estados: ['ACTIVO', 'TITULADO', 'RETIRADO'],
    rows: [
      {
        año: 2020,
        total: 30,
        counts: { ACTIVO: 15, TITULADO: 10, RETIRADO: 5 },
      },
      {
        año: 2021,
        total: 25,
        counts: { ACTIVO: 20, TITULADO: 2, RETIRADO: 3 },
      },
    ],
  },
};

describe('PdfEstadisticasGenerator', () => {
  let service: PdfEstadisticasGenerator;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrinter.createPdf.mockResolvedValue(FAKE_BUFFER);
    service = new PdfEstadisticasGenerator(
      mockPrinter as unknown as PdfPrinterProvider,
    );
  });

  it('debe retornar un Buffer cuando recibe un DTO válido', async () => {
    const resultado = await service.pdfGenerate(dtoValido);
    expect(resultado).toBeInstanceOf(Buffer);
  });

  it('debe llamar a printer.createPdf exactamente una vez', async () => {
    await service.pdfGenerate(dtoValido);
    expect(mockPrinter.createPdf).toHaveBeenCalledTimes(1);
  });

  it('debe incluir los KPIs principales en el contenido del documento', async () => {
    await service.pdfGenerate(dtoValido);

    const [docDefinition] = mockPrinter.createPdf.mock.calls[0];
    const contenidoStr = JSON.stringify(docDefinition.content);
    expect(contenidoStr).toContain('120'); // total histórico
    expect(contenidoStr).toContain('12,5%'); // tasa de deserción formateada
    expect(contenidoStr).toContain('Nuevos 2024');
  });

  it('debe incluir todas las secciones del informe en el content', async () => {
    await service.pdfGenerate(dtoValido);

    const [docDefinition] = mockPrinter.createPdf.mock.calls[0];
    const contenidoStr = JSON.stringify(docDefinition.content);
    expect(contenidoStr).toContain('Indicadores clave');
    expect(contenidoStr).toContain('Situación académica actual');
    expect(contenidoStr).toContain('Composición por género');
    expect(contenidoStr).toContain('Becarios por generación');
    expect(contenidoStr).toContain('Estado actual por cohorte');
  });
});
