import { PdfAcademicoGenerator } from './pdf-academico.service';
import { PdfPrinterProvider } from '../providers/pdf-printer.provider';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreatePdfAcademicoDto } from '../dto';

const FAKE_BUFFER = Buffer.from('pdf-academico');

const mockPrinter = { createPdf: jest.fn() };
const mockPrisma = {
  carrera: { findUnique: jest.fn() },
  ramo: { findMany: jest.fn() },
  historial_estado_carrera: { findMany: jest.fn() },
};

const dtoValido: CreatePdfAcademicoDto = { codigo_carrera: 1 };

const carreraFake = {
  codigo_carrera: 1,
  nombre: 'Medicina',
  duracion_sem: 12,
  estudiante: {
    nombre: 'Ana',
    apellido: 'García',
    rut_estudiante: '9876543-2',
  },
};

const ramosFake = [
  {
    estado: 'APROBADO',
    nota_final: 6.0,
    semestre: {
      semestre_id: 1,
      year: 2022,
      semestre: 'PRIMER_SEMESTRE',
      tipo: 'REGULAR',
    },
  },
  {
    estado: 'REPROBADO',
    nota_final: 3.5,
    semestre: {
      semestre_id: 1,
      year: 2022,
      semestre: 'PRIMER_SEMESTRE',
      tipo: 'REGULAR',
    },
  },
  {
    estado: 'CURSANDO',
    nota_final: null,
    semestre: {
      semestre_id: 2,
      year: 2022,
      semestre: 'SEGUNDO_SEMESTRE',
      tipo: 'REGULAR',
    },
  },
];

describe('PdfAcademicoGenerator', () => {
  let service: PdfAcademicoGenerator;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrinter.createPdf.mockResolvedValue(FAKE_BUFFER);
    mockPrisma.carrera.findUnique.mockResolvedValue(carreraFake);
    mockPrisma.ramo.findMany.mockResolvedValue(ramosFake);
    mockPrisma.historial_estado_carrera.findMany.mockResolvedValue([]);
    service = new PdfAcademicoGenerator(
      mockPrinter as unknown as PdfPrinterProvider,
      mockPrisma as unknown as PrismaService,
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

  it('debe lanzar una excepción si la carrera no existe', async () => {
    mockPrisma.carrera.findUnique.mockResolvedValue(null);
    await expect(service.pdfGenerate(dtoValido)).rejects.toThrow();
  });
});
