import { PdfAcuerdoGenerator } from './pdf-acuerdo.service';
import { PdfPrinterProvider }  from '../providers/pdf-printer.provider';
import type { CreatePdfAcuerdoDto } from '../dto';

const FAKE_BUFFER = Buffer.from('pdf-acuerdo');

const mockPrinter = { createPdf: jest.fn() };

const dtoValido: CreatePdfAcuerdoDto = {
  titulo:    'Acuerdo de Compromiso 2024',
  subtitulo: 'Programa de Becas — Fundación Carmen Goudie',
  abstract:  'El presente acuerdo establece los compromisos mutuos entre el becario y la fundación durante el período académico.',
  version:   '15 jun. 2024, 10:30',
  topicos: [
    {
      nombre: 'Compromisos académicos',
      puntos: [
        'Mantener un promedio semestral igual o superior a 4.0.',
        'Informar de cualquier cambio de carrera o institución.',
      ],
    },
    {
      nombre: 'Compromisos de participación',
      puntos: [
        'Asistir a las reuniones de seguimiento convocadas por el tutor.',
      ],
    },
  ],
};

describe('PdfAcuerdoGenerator', () => {
  let service: PdfAcuerdoGenerator;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrinter.createPdf.mockResolvedValue(FAKE_BUFFER);
    service = new PdfAcuerdoGenerator(mockPrinter as unknown as PdfPrinterProvider);
  });

  it('debe retornar un Buffer cuando recibe un DTO válido', async () => {
    const resultado = await service.pdfGenerate(dtoValido);
    expect(resultado).toBeInstanceOf(Buffer);
  });

  it('debe llamar a printer.createPdf exactamente una vez', async () => {
    await service.pdfGenerate(dtoValido);
    expect(mockPrinter.createPdf).toHaveBeenCalledTimes(1);
  });

  it('debe incluir el título del acuerdo en el contenido del documento', async () => {
    await service.pdfGenerate(dtoValido);

    const [docDefinition] = mockPrinter.createPdf.mock.calls[0];
    const contenidoStr = JSON.stringify(docDefinition.content);
    expect(contenidoStr).toContain('Acuerdo de Compromiso 2024');
  });

  it('debe incluir cada tópico y sus puntos en el contenido', async () => {
    await service.pdfGenerate(dtoValido);

    const [docDefinition] = mockPrinter.createPdf.mock.calls[0];
    const contenidoStr = JSON.stringify(docDefinition.content);
    expect(contenidoStr).toContain('Compromisos académicos');
    expect(contenidoStr).toContain('Compromisos de participación');
    expect(contenidoStr).toContain('Mantener un promedio');
  });

  it('debe generar el PDF correctamente con tópicos vacíos', async () => {
    const dtoSinTopicos: CreatePdfAcuerdoDto = { ...dtoValido, topicos: [] };
    const resultado = await service.pdfGenerate(dtoSinTopicos);
    expect(resultado).toBeInstanceOf(Buffer);
  });
});
