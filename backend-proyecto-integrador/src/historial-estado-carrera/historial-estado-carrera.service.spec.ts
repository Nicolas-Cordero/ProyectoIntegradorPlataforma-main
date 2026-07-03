import { Test, TestingModule } from '@nestjs/testing';
import { EstadoEstudiante } from '@prisma/client';
import { HistorialEstadoCarreraService } from './historial-estado-carrera.service';
import { HistorialEstadoCarreraRepository } from './historial-estado-carrera.repository';

const mockRepository = {
  registrar: jest.fn(),
  cambiarEstado: jest.fn(),
  findByCarrera: jest.fn(),
};

describe('HistorialEstadoCarreraService', () => {
  let service: HistorialEstadoCarreraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistorialEstadoCarreraService,
        { provide: HistorialEstadoCarreraRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<HistorialEstadoCarreraService>(
      HistorialEstadoCarreraService,
    );
  });

  afterEach(() => jest.resetAllMocks());

  it('Todos los estudiantes deben empezar como activos', async () => {
    mockRepository.registrar.mockResolvedValue({
      id: 1,
      codigo_carrera: 1,
      estado_anterior: null,
      estado_nuevo: EstadoEstudiante.ACTIVO,
      rut_usuario: '12345678-9',
      created_at: new Date(),
    });

    const result = await service.registrarEstadoInicial(1, '12345678-9');

    expect(mockRepository.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        estado_anterior: null,
        estado_nuevo: EstadoEstudiante.ACTIVO,
      }),
    );
    expect(result.estado_nuevo).toBe(EstadoEstudiante.ACTIVO);
    expect(result.estado_anterior).toBeNull();
  });

  it('Al cambiar de estado debe quedar registrado', async () => {
    mockRepository.cambiarEstado.mockResolvedValue({
      id: 2,
      codigo_carrera: 1,
      estado_anterior: EstadoEstudiante.ACTIVO,
      estado_nuevo: EstadoEstudiante.EGRESADO,
      rut_usuario: 'admin-rut',
      created_at: new Date(),
    });

    const dto = { codigo_carrera: 1, estado_nuevo: EstadoEstudiante.EGRESADO };
    const result = await service.cambiarEstado(dto, 'admin-rut');

    expect(mockRepository.cambiarEstado).toHaveBeenCalledWith(
      1,
      EstadoEstudiante.EGRESADO,
      'admin-rut',
    );
    expect(result.estado_nuevo).toBe(EstadoEstudiante.EGRESADO);
  });

  it('Si el estado es distinto de activo, si o si estado anterior debe ser distinto de null', async () => {
    mockRepository.findByCarrera.mockResolvedValue([
      {
        estado_anterior: null,
        estado_nuevo: EstadoEstudiante.ACTIVO,
        created_at: new Date(),
      },
      {
        estado_anterior: EstadoEstudiante.ACTIVO,
        estado_nuevo: EstadoEstudiante.EGRESADO,
        created_at: new Date(),
      },
      {
        estado_anterior: EstadoEstudiante.EGRESADO,
        estado_nuevo: EstadoEstudiante.TITULADO,
        created_at: new Date(),
      },
    ]);

    const historial = await service.findByCarrera(1);

    const noActivos = historial.filter(
      (h) => h.estado_nuevo !== EstadoEstudiante.ACTIVO,
    );
    noActivos.forEach((h) => expect(h.estado_anterior).not.toBeNull());
  });

  it('Un estudiante que termino su carrera sin congelar deberia tener solo 3 actualizaciones, activo, egresado, titulado', async () => {
    mockRepository.findByCarrera.mockResolvedValue([
      {
        estado_anterior: null,
        estado_nuevo: EstadoEstudiante.ACTIVO,
        created_at: new Date(),
      },
      {
        estado_anterior: EstadoEstudiante.ACTIVO,
        estado_nuevo: EstadoEstudiante.EGRESADO,
        created_at: new Date(),
      },
      {
        estado_anterior: EstadoEstudiante.EGRESADO,
        estado_nuevo: EstadoEstudiante.TITULADO,
        created_at: new Date(),
      },
    ]);

    const historial = await service.findByCarrera(1);

    expect(historial).toHaveLength(3);
    expect(historial[0].estado_nuevo).toBe(EstadoEstudiante.ACTIVO);
    expect(historial[1].estado_nuevo).toBe(EstadoEstudiante.EGRESADO);
    expect(historial[2].estado_nuevo).toBe(EstadoEstudiante.TITULADO);
  });

  describe('getSemestresSupendidos', () => {
    it('Si una carrera nunca se suspende, debe retornar 0', async () => {
      mockRepository.findByCarrera.mockResolvedValue([
        {
          estado_nuevo: EstadoEstudiante.ACTIVO,
          created_at: new Date('2024-01-15'),
        },
      ]);

      const result = await service.getSemestresSupendidos(1);
      expect(result).toBe(0);
    });

    it('Una suspensión breve (menos de un semestre) no debe sumar ningún semestre', async () => {
      mockRepository.findByCarrera.mockResolvedValue([
        {
          estado_nuevo: EstadoEstudiante.ACTIVO,
          created_at: new Date('2024-01-15'),
        },
        {
          estado_nuevo: EstadoEstudiante.SUSPENDIDO,
          created_at: new Date('2024-03-01'),
        },
        {
          // ~2 meses suspendido: muy por debajo de un semestre (~6 meses)
          estado_nuevo: EstadoEstudiante.ACTIVO,
          created_at: new Date('2024-05-01'),
        },
      ]);

      const result = await service.getSemestresSupendidos(1);
      expect(result).toBe(0);
    });

    it('Una suspensión que supera la duración de un semestre debe sumar 1', async () => {
      mockRepository.findByCarrera.mockResolvedValue([
        {
          estado_nuevo: EstadoEstudiante.ACTIVO,
          created_at: new Date('2024-01-15'),
        },
        {
          estado_nuevo: EstadoEstudiante.SUSPENDIDO,
          created_at: new Date('2024-01-15'),
        },
        {
          // 244 días suspendido (> 182.625 días de un semestre) → 1
          estado_nuevo: EstadoEstudiante.ACTIVO,
          created_at: new Date('2024-09-15'),
        },
      ]);

      const result = await service.getSemestresSupendidos(1);
      expect(result).toBe(1);
    });

    it('Si el estudiante esta actualmente suspendido, debe contar el tiempo hasta hoy', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-06-30'));

      mockRepository.findByCarrera.mockResolvedValue([
        {
          estado_nuevo: EstadoEstudiante.ACTIVO,
          created_at: new Date('2025-03-01'),
        },
        {
          // 364 días suspendido hasta "hoy" (> 182.625) → 1
          estado_nuevo: EstadoEstudiante.SUSPENDIDO,
          created_at: new Date('2025-07-01'),
        },
      ]);

      const result = await service.getSemestresSupendidos(1);
      expect(result).toBe(1);

      jest.useRealTimers();
    });

    it('Dos suspensiones separadas que ninguna llega sola a un semestre, pero suman más de uno, deben contar 1', async () => {
      mockRepository.findByCarrera.mockResolvedValue([
        {
          estado_nuevo: EstadoEstudiante.ACTIVO,
          created_at: new Date('2024-01-01'),
        },
        {
          // Primer periodo: Mar–Jun 2024 (~3 meses, 92 días)
          estado_nuevo: EstadoEstudiante.SUSPENDIDO,
          created_at: new Date('2024-03-01'),
        },
        {
          estado_nuevo: EstadoEstudiante.ACTIVO,
          created_at: new Date('2024-06-01'),
        },
        {
          // Segundo periodo: Ago–Dic 2024 (~4 meses, 122 días)
          estado_nuevo: EstadoEstudiante.SUSPENDIDO,
          created_at: new Date('2024-08-01'),
        },
        {
          // Total acumulado: 214 días (> 182.625) → 1, aunque ningún tramo
          // individual llegó a los ~183 días de un semestre
          estado_nuevo: EstadoEstudiante.ACTIVO,
          created_at: new Date('2024-12-01'),
        },
      ]);

      const result = await service.getSemestresSupendidos(1);
      expect(result).toBe(1);
    });

    it('Si el estudiante es retirado y luego vuelve a estar activo, ese tiempo cuenta igual que SUSPENDIDO', async () => {
      mockRepository.findByCarrera.mockResolvedValue([
        {
          estado_nuevo: EstadoEstudiante.ACTIVO,
          created_at: new Date('2024-01-15'),
        },
        {
          estado_nuevo: EstadoEstudiante.RETIRADO,
          created_at: new Date('2024-01-15'),
        },
        {
          // Mismos 244 días que el caso SUSPENDIDO → 1
          estado_nuevo: EstadoEstudiante.ACTIVO,
          created_at: new Date('2024-09-15'),
        },
      ]);

      const result = await service.getSemestresSupendidos(1);
      expect(result).toBe(1);
    });

    it('Si el estudiante es eliminado y luego vuelve a estar activo, ese tiempo cuenta igual que SUSPENDIDO', async () => {
      mockRepository.findByCarrera.mockResolvedValue([
        {
          estado_nuevo: EstadoEstudiante.ACTIVO,
          created_at: new Date('2024-01-15'),
        },
        {
          estado_nuevo: EstadoEstudiante.ELIMINADO,
          created_at: new Date('2024-01-15'),
        },
        {
          estado_nuevo: EstadoEstudiante.ACTIVO,
          created_at: new Date('2024-09-15'),
        },
      ]);

      const result = await service.getSemestresSupendidos(1);
      expect(result).toBe(1);
    });

    it('SUSPENDIDO seguido de RETIRADO debe tratarse como un único periodo continuo fuera de la carrera', async () => {
      mockRepository.findByCarrera.mockResolvedValue([
        {
          estado_nuevo: EstadoEstudiante.ACTIVO,
          created_at: new Date('2024-01-15'),
        },
        {
          estado_nuevo: EstadoEstudiante.SUSPENDIDO,
          created_at: new Date('2024-01-15'),
        },
        {
          estado_nuevo: EstadoEstudiante.RETIRADO,
          created_at: new Date('2024-05-01'),
        },
        {
          // El intervalo completo (15-ene a 15-sep, 244 días) cuenta como uno
          // solo, sin cortarse en la transición SUSPENDIDO → RETIRADO
          estado_nuevo: EstadoEstudiante.ACTIVO,
          created_at: new Date('2024-09-15'),
        },
      ]);

      const result = await service.getSemestresSupendidos(1);
      expect(result).toBe(1);
    });

    it('EGRESADO y TITULADO no deben contar como suspendido', async () => {
      mockRepository.findByCarrera.mockResolvedValue([
        {
          estado_nuevo: EstadoEstudiante.ACTIVO,
          created_at: new Date('2024-01-15'),
        },
        {
          estado_nuevo: EstadoEstudiante.EGRESADO,
          created_at: new Date('2024-06-01'),
        },
        {
          estado_nuevo: EstadoEstudiante.TITULADO,
          created_at: new Date('2024-12-01'),
        },
      ]);

      const result = await service.getSemestresSupendidos(1);
      expect(result).toBe(0);
    });

    it('Si se selecciona SUSPENDIDO y se corrige a ACTIVO minutos después, no debe sumar nada', async () => {
      mockRepository.findByCarrera.mockResolvedValue([
        {
          estado_nuevo: EstadoEstudiante.ACTIVO,
          created_at: new Date('2024-01-15'),
        },
        {
          estado_nuevo: EstadoEstudiante.SUSPENDIDO,
          created_at: new Date('2024-03-01T10:00:00'),
        },
        {
          estado_nuevo: EstadoEstudiante.ACTIVO,
          created_at: new Date('2024-03-01T10:05:00'),
        },
      ]);

      const result = await service.getSemestresSupendidos(1);
      expect(result).toBe(0);
    });

    it('Una suspensión breve que cruza la medianoche tampoco debe sumar nada', async () => {
      mockRepository.findByCarrera.mockResolvedValue([
        {
          estado_nuevo: EstadoEstudiante.ACTIVO,
          created_at: new Date('2024-01-15'),
        },
        {
          estado_nuevo: EstadoEstudiante.SUSPENDIDO,
          created_at: new Date('2024-03-01T23:00:00'),
        },
        {
          // Solo 2 horas de duración real, aunque cruce a otro día calendario
          estado_nuevo: EstadoEstudiante.ACTIVO,
          created_at: new Date('2024-03-02T01:00:00'),
        },
      ]);

      const result = await service.getSemestresSupendidos(1);
      expect(result).toBe(0);
    });
  });
});
