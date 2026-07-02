import { PdfAcademicoGenerator } from './pdf-academico.service';
import { PdfPrinterProvider } from '../providers/pdf-printer.provider';
import type { CreatePdfAcademicoDto } from '../dto';

const FAKE_BUFFER = Buffer.from('pdf-academico');

const mockPrinter = { createPdf: jest.fn() };

const dtoValido: CreatePdfAcademicoDto = {
  nombreEstudiante: 'Ana García',
  rutEstudiante: '9.876.543-2',
  carrera: { nombre: 'Medicina', duracion_sem: 12 },
  resumen: {
    semFinalizados: 4,
    totalRamos: 30,
    ramosAprobados: 25,
    ramosReprobados: 3,
    ramosCursando: 2,
    ramosEliminados: 0,
    promedioGeneral: 5.8,
  },
  semestres: [
    {
      year: 2022,
      tipo: 'REGULAR',
      codigo: '1',
      estado: 'CERRADO',
      totalRamos: 6,
      aprobados: 6,
      reprobados: 0,
      eliminados: 0,
    },
    {
      year: 2022,
      tipo: 'REGULAR',
      codigo: '2',
      estado: 'CERRADO',
      totalRamos: 6,
      aprobados: 5,
      reprobados: 1,
      eliminados: 0,
    },
    {
      year: 2023,
      tipo: 'REGULAR',
      codigo: '1',
      estado: 'EN_CURSO',
      totalRamos: 6,
      aprobados: 0,
      reprobados: 0,
      eliminados: 0,
    },
  ],
};

describe('PdfAcademicoGenerator', () => {
  let service: PdfAcademicoGenerator;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrinter.createPdf.mockResolvedValue(FAKE_BUFFER);
    service = new PdfAcademicoGenerator(
      mockPrinter as unknown as PdfPrinterProvider,
    );
  });

  it('debe retornar un Buffer cuando recibe un DTO válido', async () => {
    const resultado = await service.pdfGenerate(dtoValido);
    expect(resultado).toBeInstanceOf(Buffer);
  });

  it('debe llamar a printer.createPdf exactamente una vez por invocación', async () => {
    await service.pdfGenerate(dtoValido);
    expect(mockPrinter.createPdf).toHaveBeenCalledTimes(1);
  });

  it('debe pasar a createPdf un docDefinition con content y styles', async () => {
    await service.pdfGenerate(dtoValido);

    const [docDefinition] = mockPrinter.createPdf.mock.calls[0];
    expect(docDefinition).toHaveProperty('content');
    expect(docDefinition).toHaveProperty('styles');
    expect(Array.isArray(docDefinition.content)).toBe(true);
    expect((docDefinition.content as unknown[]).length).toBeGreaterThan(0);
  });

  it('debe incluir el nombre del estudiante en el contenido del documento', async () => {
    await service.pdfGenerate(dtoValido);

    const [docDefinition] = mockPrinter.createPdf.mock.calls[0];
    const contenidoStr = JSON.stringify(docDefinition.content);
    expect(contenidoStr).toContain('Ana García');
  });
});
