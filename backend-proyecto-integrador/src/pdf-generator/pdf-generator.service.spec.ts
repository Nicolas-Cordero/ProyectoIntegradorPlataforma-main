import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PdfGeneratorService } from './pdf-generator.service';
import { Generators } from './interfaces';
import { PdfAcademicoGenerator }    from './services/pdf-academico.service';
import { PdfEntrevistaGenerator }   from './services/pdf-entrevista.service';
import { PdfSemestreGenerator }     from './services/pdf-semestre.service';
import { PdfEstadisticasGenerator } from './services/pdf-estadisticas.service';
import { PdfAcuerdoGenerator }      from './services/pdf-acuerdo.service';
import type { CreatePdfAcademicoDto } from './dto';

const FAKE_BUFFER = Buffer.from('fake-pdf');

const mockAcademico    = { pdfGenerate: jest.fn() };
const mockEntrevista   = { pdfGenerate: jest.fn() };
const mockSemestre     = { pdfGenerate: jest.fn() };
const mockEstadisticas = { pdfGenerate: jest.fn() };
const mockAcuerdo      = { pdfGenerate: jest.fn() };

describe('PdfGeneratorService', () => {
  let service: PdfGeneratorService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockAcademico.pdfGenerate.mockResolvedValue(FAKE_BUFFER);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfGeneratorService,
        { provide: PdfAcademicoGenerator,    useValue: mockAcademico    },
        { provide: PdfEntrevistaGenerator,   useValue: mockEntrevista   },
        { provide: PdfSemestreGenerator,     useValue: mockSemestre     },
        { provide: PdfEstadisticasGenerator, useValue: mockEstadisticas },
        { provide: PdfAcuerdoGenerator,      useValue: mockAcuerdo      },
      ],
    }).compile();

    service = module.get<PdfGeneratorService>(PdfGeneratorService);
  });

  it('Debe recibir un generator y devolver un buffer con el pdf asociado a dicho generator', async () => {
    const dto: CreatePdfAcademicoDto = {
      nombreEstudiante: 'Ana García',
      rutEstudiante:    '9.876.543-2',
      carrera:  { nombre: 'Medicina', duracion_sem: 12 },
      resumen:  { semFinalizados: 4, totalRamos: 30, ramosAprobados: 25, ramosReprobados: 3, ramosCursando: 2, ramosEliminados: 0, promedioGeneral: 5.8 },
      semestres: [],
    };

    const resultado = await service.pdfGenerate(dto, Generators.ACADEMICO);

    expect(resultado).toBeInstanceOf(Buffer);
    expect(mockAcademico.pdfGenerate).toHaveBeenCalledTimes(1);
    expect(mockAcademico.pdfGenerate).toHaveBeenCalledWith(dto);
  });

  it('Si recibe un DTO invalido debe elevar un error legible', async () => {
    await expect(
      service.pdfGenerate({} as any, 'generator_inexistente' as any),
    ).rejects.toThrow(BadRequestException);
  });
});
