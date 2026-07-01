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

    service = module.get<HistorialEstadoCarreraService>(HistorialEstadoCarreraService);
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

    expect(mockRepository.cambiarEstado).toHaveBeenCalledWith(1, EstadoEstudiante.EGRESADO, 'admin-rut');
    expect(result.estado_nuevo).toBe(EstadoEstudiante.EGRESADO);
  });

  it('Si el estado es distinto de activo, si o si estado anterior debe ser distinto de null', async () => {
    mockRepository.findByCarrera.mockResolvedValue([
      { estado_anterior: null,                    estado_nuevo: EstadoEstudiante.ACTIVO,   created_at: new Date() },
      { estado_anterior: EstadoEstudiante.ACTIVO, estado_nuevo: EstadoEstudiante.EGRESADO, created_at: new Date() },
      { estado_anterior: EstadoEstudiante.EGRESADO, estado_nuevo: EstadoEstudiante.TITULADO, created_at: new Date() },
    ]);

    const historial = await service.findByCarrera(1);

    const noActivos = historial.filter((h) => h.estado_nuevo !== EstadoEstudiante.ACTIVO);
    noActivos.forEach((h) => expect(h.estado_anterior).not.toBeNull());
  });

  it('Un estudiante que termino su carrera sin congelar deberia tener solo 3 actualizaciones, activo, egresado, titulado', async () => {
    mockRepository.findByCarrera.mockResolvedValue([
      { estado_anterior: null,                      estado_nuevo: EstadoEstudiante.ACTIVO,   created_at: new Date() },
      { estado_anterior: EstadoEstudiante.ACTIVO,   estado_nuevo: EstadoEstudiante.EGRESADO, created_at: new Date() },
      { estado_anterior: EstadoEstudiante.EGRESADO, estado_nuevo: EstadoEstudiante.TITULADO, created_at: new Date() },
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
        { estado_nuevo: EstadoEstudiante.ACTIVO, created_at: new Date('2024-01-15') },
      ]);

      const result = await service.getSemestresSupendidos(1);
      expect(result).toBe(0);
    });

    it('Si el estudiante suspende y retoma, debe contar los semestres correctamente', async () => {
      mockRepository.findByCarrera.mockResolvedValue([
        { estado_nuevo: EstadoEstudiante.ACTIVO,     created_at: new Date('2024-01-15') },
        { estado_nuevo: EstadoEstudiante.SUSPENDIDO, created_at: new Date('2024-03-01') },
        { estado_nuevo: EstadoEstudiante.ACTIVO,     created_at: new Date('2024-08-15') },
      ]);

      // Mar 2024 – Aug 2024 solapa con S1-2024 (ene–jun) y S2-2024 (jul–dic)
      const result = await service.getSemestresSupendidos(1);
      expect(result).toBe(2);
    });

    it('Si el estudiante esta actualmente suspendido, debe contar los semestres hasta hoy', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-06-30'));

      mockRepository.findByCarrera.mockResolvedValue([
        { estado_nuevo: EstadoEstudiante.ACTIVO,     created_at: new Date('2025-03-01') },
        { estado_nuevo: EstadoEstudiante.SUSPENDIDO, created_at: new Date('2025-07-01') },
      ]);

      // Jul 2025 – Jun 2026 solapa con S2-2025 y S1-2026
      const result = await service.getSemestresSupendidos(1);
      expect(result).toBe(2);

      jest.useRealTimers();
    });

    it('Si el estudiante suspende, retoma y suspende de nuevo, debe sumar ambos periodos', async () => {
      mockRepository.findByCarrera.mockResolvedValue([
        { estado_nuevo: EstadoEstudiante.ACTIVO,     created_at: new Date('2024-01-15') },
        { estado_nuevo: EstadoEstudiante.SUSPENDIDO, created_at: new Date('2024-03-01') },
        { estado_nuevo: EstadoEstudiante.ACTIVO,     created_at: new Date('2024-04-01') },
        { estado_nuevo: EstadoEstudiante.SUSPENDIDO, created_at: new Date('2024-08-01') },
        { estado_nuevo: EstadoEstudiante.ACTIVO,     created_at: new Date('2024-09-01') },
      ]);

      // Primera suspensión [Mar–Abr 2024]: solo S1-2024 → 1
      // Segunda suspensión [Ago–Sep 2024]: solo S2-2024 → 1
      const result = await service.getSemestresSupendidos(1);
      expect(result).toBe(2);
    });
  });
});
