import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AcuerdoService } from './acuerdo.service';
import { AcuerdoRepository } from './acuerdo.repository';
import { UpdateAcuerdoDto } from './dto/update-acuerdo.dto';
import { DocumentoCompromiso } from './interfaces';

const mockRepository = {
  findAll: jest.fn(),
  create: jest.fn(),
  findVigente: jest.fn(),
  findById: jest.fn(),
  firmar: jest.fn(),
  findFirma: jest.fn(),
  findFirmantes: jest.fn(),
};

const mockAcuerdo = {
  id: 1,
  createdAt: new Date('2026-01-01'),
  documento: {
    titulo: 'Renovación compromiso Becarias y Becarios',
    subtitulo: 'Beca Carmen Goudie año 2026',
    abstract: 'El presente documento expone...',
    topicos: [
      {
        nombre: 'Compromisos académicos',
        puntos: ['Mantenerse como alumna/o regular...'],
      },
    ],
  },
};

const mockAcuerdoAntiguo = {
  id: 1,
  createdAt: new Date('2020-01-01'),
  documento: {
    titulo: 'Renovación compromiso Becarias y Becarios',
    subtitulo: 'Beca Carmen Goudie año 2026',
    abstract: 'El presente documento expone...',
    topicos: [
      {
        nombre: 'Compromisos académicos',
        puntos: ['Mantenerse como alumna/o regular...'],
      },
    ],
  },
};

describe('AcuerdoService', () => {
  let service: AcuerdoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcuerdoService,
        { provide: AcuerdoRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<AcuerdoService>(AcuerdoService);
  });

  afterEach(() => {
    // resetAllMocks (y no clearAllMocks) para que los mockResolvedValue de un
    // test no se filtren al siguiente: los métodos no mockeados deben devolver
    // undefined y el servicio omite esa verificación.
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  it('Debe retornar todos los acuerdos registrados hasta la fecha.', async () => {
    mockRepository.findAll.mockResolvedValue([mockAcuerdo]);

    const response = await service.findAll();

    expect(response).toBeInstanceOf(Array);
    expect(response.length).toBeGreaterThan(0);
    expect(response[0]).toMatchObject({
      id: expect.any(Number),
      createdAt: expect.any(Date),
      documento: expect.objectContaining({
        titulo: expect.any(String),
        subtitulo: expect.any(String),
        abstract: expect.any(String),
        topicos: expect.arrayContaining([
          expect.objectContaining({
            nombre: expect.any(String),
            puntos: expect.arrayContaining([expect.any(String)]),
          }),
        ]),
      }),
    });
  });

  it('Debe retornar el acuerdo mas cercano a x fecha', async () => {
    mockRepository.findAll.mockResolvedValue([mockAcuerdo, mockAcuerdoAntiguo]);

    const response = await service.findMostNear(new Date());

    expect(response).toMatchObject({
      id: 1,
      createdAt: new Date('2026-01-01'),
      documento: expect.objectContaining({
        titulo: expect.any(String),
        subtitulo: expect.any(String),
        abstract: expect.any(String),
        topicos: expect.arrayContaining([
          expect.objectContaining({
            nombre: expect.any(String),
            puntos: expect.arrayContaining([expect.any(String)]),
          }),
        ]),
      }),
    });
  });

  it('Debe crear un nuevo acuerdo con los cambios aplicados y retornar la nueva instancia con createdAt en la fecha de creación.', async () => {
    const fechaOriginal = new Date('2025-01-01');
    const fechaNuevaVersion = new Date('2026-06-15');

    jest.useFakeTimers();
    jest.setSystemTime(fechaNuevaVersion);

    const updateDto: UpdateAcuerdoDto = {
      documento: {
        titulo: 'Título actualizado',
      },
    };

    const nuevaVersion = {
      id: 2, // nueva fila en la BD
      createdAt: fechaNuevaVersion,
      documento: {
        ...mockAcuerdo.documento,
        ...updateDto.documento,
      },
    };

    mockRepository.create.mockResolvedValue(nuevaVersion);

    const response = await service.update(1, updateDto);

    // Es una instancia nueva, no la misma
    expect(response.id).not.toBe(mockAcuerdo.id);
    expect(response.createdAt).toEqual(fechaNuevaVersion);
    expect(response.createdAt).not.toEqual(fechaOriginal);
    const documento = response.documento as unknown as DocumentoCompromiso;
    expect(documento.titulo).toBe('Título actualizado');
  });

  // ── Firma del acuerdo ────────────────────────────────────────────────────

  it('Debe firmar la versión vigente del acuerdo en nombre del estudiante', async () => {
    mockRepository.findVigente.mockResolvedValue(mockAcuerdo);
    mockRepository.firmar.mockResolvedValue({
      id: 10,
      acuerdo_id: mockAcuerdo.id,
      rut_estudiante: '12345678-9',
      firmado_at: new Date('2026-06-16'),
    });

    const estado = await service.firmarVigente('12345678-9');

    // Se firma la versión vigente resuelta en el servidor, no una arbitraria.
    expect(mockRepository.firmar).toHaveBeenCalledWith(
      mockAcuerdo.id,
      '12345678-9',
    );
    expect(estado).toEqual({
      hayAcuerdoVigente: true,
      acuerdoId: mockAcuerdo.id,
      firmado: true,
      firmadoAt: new Date('2026-06-16'),
    });
  });

  it('Debe lanzar NotFoundException al firmar si no hay acuerdo vigente', async () => {
    mockRepository.findVigente.mockResolvedValue(null);

    await expect(service.firmarVigente('12345678-9')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockRepository.firmar).not.toHaveBeenCalled();
  });

  it('Debe reportar firmado=true si el estudiante ya firmó la versión vigente', async () => {
    mockRepository.findVigente.mockResolvedValue(mockAcuerdo);
    mockRepository.findFirma.mockResolvedValue({
      id: 10,
      acuerdo_id: mockAcuerdo.id,
      rut_estudiante: '12345678-9',
      firmado_at: new Date('2026-06-16'),
    });

    const estado = await service.getEstadoFirmaVigente('12345678-9');

    expect(estado).toEqual({
      hayAcuerdoVigente: true,
      acuerdoId: mockAcuerdo.id,
      firmado: true,
      firmadoAt: new Date('2026-06-16'),
    });
  });

  it('Debe reportar firmado=false si el estudiante no ha firmado la versión vigente', async () => {
    mockRepository.findVigente.mockResolvedValue(mockAcuerdo);
    mockRepository.findFirma.mockResolvedValue(null);

    const estado = await service.getEstadoFirmaVigente('12345678-9');

    expect(estado).toEqual({
      hayAcuerdoVigente: true,
      acuerdoId: mockAcuerdo.id,
      firmado: false,
      firmadoAt: null,
    });
  });

  it('Debe reportar que no hay acuerdo vigente cuando no existe ninguno', async () => {
    mockRepository.findVigente.mockResolvedValue(null);

    const estado = await service.getEstadoFirmaVigente('12345678-9');

    expect(estado).toEqual({
      hayAcuerdoVigente: false,
      acuerdoId: null,
      firmado: false,
      firmadoAt: null,
    });
    expect(mockRepository.findFirma).not.toHaveBeenCalled();
  });

  // ── Firmantes de una versión ─────────────────────────────────────────────

  it('Debe retornar los estudiantes que firmaron una versión concreta del acuerdo', async () => {
    mockRepository.findById.mockResolvedValue(mockAcuerdo);
    mockRepository.findFirmantes.mockResolvedValue([
      {
        firmado_at: new Date('2026-06-16'),
        estudiante: {
          rut_estudiante: '12345678-9',
          nombre: 'Camila',
          apellido: 'Rojas',
        },
      },
    ]);

    const firmantes = await service.getFirmantes(1);

    expect(mockRepository.findFirmantes).toHaveBeenCalledWith(1);
    expect(firmantes).toEqual([
      {
        rut_estudiante: '12345678-9',
        nombre: 'Camila',
        apellido: 'Rojas',
        firmadoAt: new Date('2026-06-16'),
      },
    ]);
  });

  it('Debe lanzar NotFoundException al pedir los firmantes de un acuerdo inexistente', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(service.getFirmantes(999)).rejects.toThrow(NotFoundException);
    expect(mockRepository.findFirmantes).not.toHaveBeenCalled();
  });
});
