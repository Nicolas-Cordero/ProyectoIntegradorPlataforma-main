import { PdfSemestreGenerator } from './pdf-semestre.service';
import { PdfPrinterProvider } from '../providers/pdf-printer.provider';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreatePdfSemestreDto } from '../dto';

const FAKE_BUFFER = Buffer.from('pdf-semestre');

const mockPrinter = { createPdf: jest.fn() };
const mockPrisma = {
  carrera: { findUnique: jest.fn() },
  ramo: { findMany: jest.fn() },
};

const carreraFake = {
  codigo_carrera: 1,
  nombre: 'Enfermería',
  estudiante: {
    nombre: 'Pedro',
    apellido: 'Soto',
    rut_estudiante: '14000000-K',
  },
};

const ramosFake = [
  {
    nombre: 'Anatomía I',
    estado: 'APROBADO',
    nota_final: 5.5,
    intento: 1,
    comentario: 'Le costó el primer parcial pero se recuperó bien.',
    semestre: {
      semestre_id: 1,
      year: 2024,
      semestre: 'PRIMER_SEMESTRE',
      tipo: 'REGULAR',
    },
  },
  {
    nombre: 'Bioquímica',
    estado: 'REPROBADO',
    nota_final: 3.8,
    intento: 1,
    comentario: '',
    semestre: {
      semestre_id: 1,
      year: 2024,
      semestre: 'PRIMER_SEMESTRE',
      tipo: 'REGULAR',
    },
  },
  {
    nombre: 'Fisiología',
    estado: 'APROBADO',
    nota_final: 6.1,
    intento: 2,
    comentario: '',
    semestre: {
      semestre_id: 1,
      year: 2024,
      semestre: 'PRIMER_SEMESTRE',
      tipo: 'REGULAR',
    },
  },
  {
    nombre: 'Farmacología',
    estado: 'CURSANDO',
    nota_final: null,
    intento: 1,
    comentario: '',
    semestre: {
      semestre_id: 2,
      year: 2024,
      semestre: 'SEGUNDO_SEMESTRE',
      tipo: 'REGULAR',
    },
  },
];

const dtoCerrado: CreatePdfSemestreDto = { codigo_carrera: 1, semestre_id: 1 };
const dtoAbierto: CreatePdfSemestreDto = { codigo_carrera: 1, semestre_id: 2 };
const dtoTodos: CreatePdfSemestreDto = { codigo_carrera: 1 };

describe('PdfSemestreGenerator', () => {
  let service: PdfSemestreGenerator;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrinter.createPdf.mockResolvedValue(FAKE_BUFFER);
    mockPrisma.carrera.findUnique.mockResolvedValue(carreraFake);
    mockPrisma.ramo.findMany.mockResolvedValue(ramosFake);
    service = new PdfSemestreGenerator(
      mockPrinter as unknown as PdfPrinterProvider,
      mockPrisma as unknown as PrismaService,
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

  it('debe incluir el resumen de notas y el comentario del ramo cuando el semestre está cerrado', async () => {
    await service.pdfGenerate(dtoCerrado);

    const [docDefinition] = mockPrinter.createPdf.mock.calls[0];
    const contenidoStr = JSON.stringify(docDefinition.content);
    expect(contenidoStr).toContain('Aprobados: 2');
    expect(contenidoStr).toContain('Le costó el primer parcial');
  });

  it('no debe incluir el resumen de notas cuando el semestre está abierto', async () => {
    await service.pdfGenerate(dtoAbierto);

    const [docDefinition] = mockPrinter.createPdf.mock.calls[0];
    const contenidoStr = JSON.stringify(docDefinition.content);
    expect(contenidoStr).not.toContain('Aprobados:');
  });

  it('debe incluir todos los semestres cuando no se especifica semestre_id', async () => {
    await service.pdfGenerate(dtoTodos);

    const [docDefinition] = mockPrinter.createPdf.mock.calls[0];
    const contenidoStr = JSON.stringify(docDefinition.content);
    expect(contenidoStr).toContain('Anatomía I');
    expect(contenidoStr).toContain('Farmacología');
  });

  it('debe lanzar una excepción si el semestre solicitado no existe en la carrera', async () => {
    await expect(
      service.pdfGenerate({ codigo_carrera: 1, semestre_id: 999 }),
    ).rejects.toThrow();
  });
});
