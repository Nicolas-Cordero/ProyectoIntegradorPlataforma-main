import { Controller, Post, Body, UseGuards, UsePipes, ValidationPipe, StreamableFile } from '@nestjs/common';
import { UserRol } from '@prisma/client';
import { PdfGeneratorService } from './pdf-generator.service';
import { Generators } from './interfaces';
import { CreatePdfAcademicoDto, CreatePdfSemestreDto, CreatePdfEstadisticasDto, CreatePdfAcuerdoDto, CreatePdfEntrevistaDto, CreatePdfEntrevistaResumenDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('pdf-generator')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRol.ADMIN, UserRol.TUTOR)
@UsePipes(new ValidationPipe({ transform: true }))
export class PdfGeneratorController {
  constructor(private readonly pdfGeneratorService: PdfGeneratorService) {}

  @Post('academico')
  async generarAcademico(@Body() dto: CreatePdfAcademicoDto): Promise<StreamableFile> {
    const buffer = await this.pdfGeneratorService.pdfGenerate(dto, Generators.ACADEMICO);
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: 'attachment; filename="informe-academico.pdf"',
    });
  }

  @Post('semestre')
  async generarSemestre(@Body() dto: CreatePdfSemestreDto): Promise<StreamableFile> {
    const buffer = await this.pdfGeneratorService.pdfGenerate(dto, Generators.SEMESTRE);
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: 'attachment; filename="informe-semestral.pdf"',
    });
  }

  @Post('estadisticas')
  async generarEstadisticas(@Body() dto: CreatePdfEstadisticasDto): Promise<StreamableFile> {
    const buffer = await this.pdfGeneratorService.pdfGenerate(dto, Generators.ESTADISTICAS);
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: 'attachment; filename="informe-estadisticas.pdf"',
    });
  }

  @Post('acuerdo')
  async generarAcuerdo(@Body() dto: CreatePdfAcuerdoDto): Promise<StreamableFile> {
    const buffer = await this.pdfGeneratorService.pdfGenerate(dto, Generators.ACUERDO);
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: 'attachment; filename="acuerdo-compromiso.pdf"',
    });
  }

  @Post('entrevista')
  async generarEntrevista(@Body() dto: CreatePdfEntrevistaDto): Promise<StreamableFile> {
    const buffer = await this.pdfGeneratorService.pdfGenerate(dto, Generators.ENTREVISTA);
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: 'attachment; filename="informe-entrevista.pdf"',
    });
  }

  @Post('entrevista-resumen')
  async generarEntrevistaResumen(@Body() dto: CreatePdfEntrevistaResumenDto): Promise<StreamableFile> {
    const buffer = await this.pdfGeneratorService.pdfGenerate(dto, Generators.ENTREVISTA_RESUMEN);
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: 'attachment; filename="resumen-entrevistas.pdf"',
    });
  }
}
