import { PdfSemestreGenerator } from './pdf-semestre.service';
import { PdfPrinterProvider } from '../providers/pdf-printer.provider';
import type { CreatePdfSemestreDto } from '../dto';

const FAKE_BUFFER = Buffer.from('pdf-semestre');

const mockPrinter = { createPdf: jest.fn() };

const dtoCerrado: CreatePdfSemestreDto = {
  nombreEstudiante: 'Pedro Soto',
  rutEstudiante: '14.000.000-K',
  carrera: { nombre: 'Enfermería' },
  semestre: { year: 2024, tipo: 'REGULAR', codigo: '1', abierto: false },
  ramos: [
    { nombre: 'Anatomía I', nota_final: 5.5, intento: 1, estado: 'APROBADO' },
    { nombre: 'Bioquímica', nota_final: 3.8, intento: 1, estado: 'REPROBADO' },
    { nombre: 'Fisiología', nota_final: 6.1, intento: 2, estado: 'APROBADO' },
  ],
  resumen: { aprobados: 2, reprobados: 1, eliminados: 0, promedio: 5.3 },
};

const dtoAbierto: CreatePdfSemestreDto = {
  ...dtoCerrado,
  semestre: { year: 2024, tipo: 'REGULAR', codigo: '2', abierto: true },
  ramos: [
    {
      nombre: 'Farmacología',
      nota_final: null,
      intento: 1,
      estado: 'CURSANDO',
    },
  ],
  resumen: { aprobados: 0, reprobados: 0, eliminados: 0, promedio: null },
};

describe('PdfSemestreGenerator', () => {
  let service: PdfSemestreGenerator;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrinter.createPdf.mockResolvedValue(FAKE_BUFFER);
    service = new PdfSemestreGenerator(
      mockPrinter as unknown as PdfPrinterProvider,
    );
  });

  it('debe retornar un Buffer para un semestre cerrado', async () => {
    const resultado = await service.pdfGenerate(dtoCerrado);
    expect(resultado).toBeInstanceOf(Buffer);
  });

  it('debe retornar un Buffer para un semestre abierto', async () => {
    const resultado = await service.pdfGenerate(dtoAbierto);
    expect(resultado).toBeInstanceOf(Buffer);
  });

  it('debe incluir el resumen de notas cuando el semestre está cerrado', async () => {
    await service.pdfGenerate(dtoCerrado);

    const [docDefinition] = mockPrinter.createPdf.mock.calls[0];
    const contenidoStr = JSON.stringify(docDefinition.content);
    expect(contenidoStr).toContain('Aprobados: 2');
    expect(contenidoStr).toContain('5.3');
  });

  it('no debe incluir el resumen de notas cuando el semestre está abierto', async () => {
    await service.pdfGenerate(dtoAbierto);

    const [docDefinition] = mockPrinter.createPdf.mock.calls[0];
    const contenidoStr = JSON.stringify(docDefinition.content);
    expect(contenidoStr).not.toContain('Aprobados:');
  });
});
