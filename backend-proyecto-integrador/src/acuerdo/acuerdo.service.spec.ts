import { Test, TestingModule } from '@nestjs/testing';
import { AcuerdoService } from './acuerdo.service';
import { AcuerdoRepository } from './acuerdo.repository';
import { UpdateAcuerdoDto } from './dto/update-acuerdo.dto';
import { DocumentoCompromiso } from './interfaces';

const mockRepository = {
  findAll: jest.fn(),
  create: jest.fn(),
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
}

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
}


describe('AcuerdoService', () => {
  let service: AcuerdoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcuerdoService,
        { provide: AcuerdoRepository, useValue: mockRepository }
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
});
