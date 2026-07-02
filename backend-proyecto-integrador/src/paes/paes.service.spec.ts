import { Test, TestingModule } from '@nestjs/testing';
import { PaesRepository } from './paes.repository';
import { PaesService } from './paes.service';
import { CreatePaesDto } from './dto/create-paes.dto';
import { UpdatePaesDto } from './dto/update-paes.dto';

const mockRepository = {
  findPaesByEstudiante: jest.fn(),
  findAll: jest.fn(),
  findAllEstudiantes: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('PaesService', () => {
  let service: PaesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaesService,
        { provide: PaesRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<PaesService>(PaesService);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  it('Debe escribir los puntajes paes del estudiante en la base de datos', async () => {
    const createPaesDto: CreatePaesDto = {
      rut_estudiante: '21427760-3',
      matematicas: 500,
      lenguaje: 600,
      nem: 650,
      ranking: 700,
      matematicas2: 500,
      ciencias: 500,
      historia: 600,
    };

    // El estudiante no tiene paes registrada aún
    mockRepository.findPaesByEstudiante.mockResolvedValue(null);

    mockRepository.create.mockResolvedValue({
      matematicas: 500,
      lenguaje: 600,
      nem: 650,
      ranking: 700,
      matematicas2: 500,
      ciencias: 500,
      historia: 600,
    });

    const response = await service.create(createPaesDto);

    expect(response).toEqual({
      matematicas: 500,
      lenguaje: 600,
      nem: 650,
      ranking: 700,
      matematicas2: 500,
      ciencias: 500,
      historia: 600,
    });
  });

  it('Debe actualizar los puntajes paes de un estudiante', async () => {
    mockRepository.findPaesByEstudiante.mockResolvedValue({
      rut_estudiante: '21427760-3',
      matematicas: 500,
      lenguaje: 600,
      nem: 650,
      ranking: 700,
      matematicas2: 500,
      ciencias: 500,
      historia: 600,
    });

    mockRepository.update.mockResolvedValue({
      matematicas: 100,
      lenguaje: 100,
      nem: 100,
      ranking: 100,
      matematicas2: 100,
      ciencias: 100,
      historia: 100,
    });

    const updatePaesDto: UpdatePaesDto = {
      matematicas: 100,
      lenguaje: 100,
      nem: 100,
      ranking: 100,
      matematicas2: 100,
      ciencias: 100,
      historia: 100,
    };

    const response = await service.update('21427760-3', updatePaesDto);

    expect(response).toEqual({
      matematicas: 100,
      lenguaje: 100,
      nem: 100,
      ranking: 100,
      matematicas2: 100,
      ciencias: 100,
      historia: 100,
    });
  });

  it('Cada estudiante solo debe tener una sola prueba paes (rut_estudiante Unique en la base de datos)', async () => {
    const createPaesDto: CreatePaesDto = {
      rut_estudiante: '21427760-3',
      matematicas: 500,
      lenguaje: 600,
      nem: 650,
      ranking: 700,
      matematicas2: 500,
      ciencias: 500,
      historia: 600,
    };

    // Primera llamada: no existe registro → se puede crear
    // Segunda llamada: ya existe registro → debe lanzar error
    mockRepository.findPaesByEstudiante
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        rut_estudiante: '21427760-3',
        matematicas: 500,
        lenguaje: 600,
        nem: 650,
        ranking: 700,
        matematicas2: 500,
        ciencias: 500,
        historia: 600,
      });

    mockRepository.create.mockResolvedValue({
      matematicas: 500,
      lenguaje: 600,
      nem: 650,
      ranking: 700,
      matematicas2: 500,
      ciencias: 500,
      historia: 600,
    });

    const response = await service.create(createPaesDto);
    expect(response).toEqual({
      matematicas: 500,
      lenguaje: 600,
      nem: 650,
      ranking: 700,
      matematicas2: 500,
      ciencias: 500,
      historia: 600,
    });

    await expect(service.create(createPaesDto)).rejects.toThrow();
  });

  it('Se debe poder actualizar ciertos campos, no necesariamente todos', async () => {
    mockRepository.findPaesByEstudiante.mockResolvedValue({
      rut_estudiante: '21427760-3',
      matematicas: 500,
      lenguaje: 600,
      nem: 650,
      ranking: 700,
      matematicas2: 500,
      ciencias: 500,
      historia: 600,
    });

    mockRepository.update.mockResolvedValue({
      matematicas: 100,
      lenguaje: 600,
      nem: 650,
      ranking: 700,
      matematicas2: 500,
      ciencias: 500,
      historia: 600,
    });

    const updatePaesDto: UpdatePaesDto = {
      matematicas: 100,
    };

    const response = await service.update('21427760-3', updatePaesDto);

    expect(response).toEqual({
      matematicas: 100,
      lenguaje: 600,
      nem: 650,
      ranking: 700,
      matematicas2: 500,
      ciencias: 500,
      historia: 600,
    });
  });

  it('Se debe poder actualizar solo el NEM o el Ranking sin afectar los demás campos', async () => {
    mockRepository.findPaesByEstudiante.mockResolvedValue({
      rut_estudiante: '21427760-3',
      matematicas: 500,
      lenguaje: 600,
      nem: 650,
      ranking: 700,
      matematicas2: 500,
      ciencias: 500,
      historia: 600,
    });

    mockRepository.update.mockResolvedValue({
      matematicas: 500,
      lenguaje: 600,
      nem: 720,
      ranking: 700,
      matematicas2: 500,
      ciencias: 500,
      historia: 600,
    });

    const updatePaesDto: UpdatePaesDto = { nem: 720 };

    const response = await service.update('21427760-3', updatePaesDto);

    expect(response.nem).toBe(720);
    expect(response.ranking).toBe(700);
    expect(response.matematicas).toBe(500);
    expect(response.lenguaje).toBe(600);
  });

  it('Se debe poder buscar por generación', async () => {
    mockRepository.findAllEstudiantes.mockResolvedValue([
      { rut_estudiante: '12345678-9', generacion: '2020' },
      { rut_estudiante: '98765432-1', generacion: '2020' },
      { rut_estudiante: '11111111-1', generacion: '2021' },
    ]);

    mockRepository.findAll.mockResolvedValue([
      {
        rut_estudiante: '12345678-9',
        matematicas: 500,
        lenguaje: 300,
        nem: 600,
        ranking: 650,
        matematicas2: 500,
        ciencias: 500,
        historia: 600,
      },
      {
        rut_estudiante: '98765432-1',
        matematicas: 500,
        lenguaje: 600,
        nem: 610,
        ranking: 660,
        matematicas2: 500,
        ciencias: 200,
        historia: 600,
      },
      {
        rut_estudiante: '11111111-1',
        matematicas: 500,
        lenguaje: 600,
        nem: 620,
        ranking: 670,
        matematicas2: 500,
        ciencias: 200,
        historia: 600,
      },
    ]);

    const response = await service.getByGeneration('2020');

    expect(response).toEqual([
      {
        rut_estudiante: '12345678-9',
        matematicas: 500,
        lenguaje: 300,
        nem: 600,
        ranking: 650,
        matematicas2: 500,
        ciencias: 500,
        historia: 600,
      },
      {
        rut_estudiante: '98765432-1',
        matematicas: 500,
        lenguaje: 600,
        nem: 610,
        ranking: 660,
        matematicas2: 500,
        ciencias: 200,
        historia: 600,
      },
    ]);
  });

  it('Se debe poder obtener todos los puntajes paes', async () => {
    mockRepository.findAll.mockResolvedValue([
      {
        rut_estudiante: '12345678-9',
        matematicas: 500,
        lenguaje: 300,
        nem: 600,
        ranking: 650,
        matematicas2: 500,
        ciencias: 500,
        historia: 600,
      },
      {
        rut_estudiante: '98765432-1',
        matematicas: 500,
        lenguaje: 600,
        nem: 610,
        ranking: 660,
        matematicas2: 500,
        ciencias: 200,
        historia: 600,
      },
      {
        rut_estudiante: '11111111-1',
        matematicas: 500,
        lenguaje: 600,
        nem: 620,
        ranking: 670,
        matematicas2: 500,
        ciencias: 200,
        historia: 600,
      },
    ]);

    const response = await service.findAll();

    expect(response).toEqual([
      {
        rut_estudiante: '12345678-9',
        matematicas: 500,
        lenguaje: 300,
        nem: 600,
        ranking: 650,
        matematicas2: 500,
        ciencias: 500,
        historia: 600,
      },
      {
        rut_estudiante: '98765432-1',
        matematicas: 500,
        lenguaje: 600,
        nem: 610,
        ranking: 660,
        matematicas2: 500,
        ciencias: 200,
        historia: 600,
      },
      {
        rut_estudiante: '11111111-1',
        matematicas: 500,
        lenguaje: 600,
        nem: 620,
        ranking: 670,
        matematicas2: 500,
        ciencias: 200,
        historia: 600,
      },
    ]);
  });

  it('Se debe poder remover una instancia por estudiante', async () => {
    mockRepository.findPaesByEstudiante.mockResolvedValue({
      id: 1,
      rut_estudiante: '12345678-9',
      matematicas: 500,
      lenguaje: 300,
      nem: 600,
      ranking: 650,
      matematicas2: 500,
      ciencias: 500,
      historia: 600,
    });

    mockRepository.remove.mockResolvedValue(undefined);

    const response = await service.removeByEstudiante('12345678-9');

    expect(response).toBeUndefined();
  });
});
