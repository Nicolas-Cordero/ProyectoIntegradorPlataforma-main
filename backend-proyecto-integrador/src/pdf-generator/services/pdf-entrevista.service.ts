import { Injectable } from '@nestjs/common';
import { IPdfGenerator } from '../interfaces';
import { CreatePdfEntrevistaDto } from '../dto';
import { PdfPrinterProvider } from '../providers/pdf-printer.provider';

@Injectable()
export class PdfEntrevistaGenerator implements IPdfGenerator<CreatePdfEntrevistaDto> {

  constructor(private readonly printer: PdfPrinterProvider) {}

  // TODO: implementar cuando se defina el DTO de entrevista
  async pdfGenerate(_dto: CreatePdfEntrevistaDto): Promise<Buffer> {
    throw new Error('PdfEntrevistaGenerator no implementado');
  }
}
