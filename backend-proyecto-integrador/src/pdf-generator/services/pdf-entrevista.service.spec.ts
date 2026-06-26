import { PdfEntrevistaGenerator } from './pdf-entrevista.service';
import { PdfPrinterProvider }     from '../providers/pdf-printer.provider';
import { PrismaService }          from '../../prisma/prisma.service';

const mockPrinter = { createPdf: jest.fn() };
const mockPrisma  = { entrevista: { findUnique: jest.fn() } };

describe('PdfEntrevistaGenerator', () => {
  let service: PdfEntrevistaGenerator;

  beforeEach(() => {
    service = new PdfEntrevistaGenerator(
      mockPrinter as unknown as PdfPrinterProvider,
      mockPrisma as unknown as PrismaService,
    );
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });
});
