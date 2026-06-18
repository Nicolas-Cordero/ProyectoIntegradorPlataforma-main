import { PdfEntrevistaGenerator } from './pdf-entrevista.service';
import { PdfPrinterProvider }     from '../providers/pdf-printer.provider';

const mockPrinter = { createPdf: jest.fn() };

describe('PdfEntrevistaGenerator', () => {
  let service: PdfEntrevistaGenerator;

  beforeEach(() => {
    service = new PdfEntrevistaGenerator(mockPrinter as unknown as PdfPrinterProvider);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // TODO: agregar tests cuando se implemente pdfGenerate
});
