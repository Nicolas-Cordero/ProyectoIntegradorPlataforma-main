import { Test, TestingModule } from '@nestjs/testing';
import { AlertasService } from './alertas.service';
import { AlertasRepository } from './alertas.repository';



const mockRepository = {
  findAllEstudiantes: jest.fn(),
  getAllEntrevistasbyEstudiante: jest.fn(),
  getAllEntrevistas: jest.fn(),
};

const mockAlertasType = {
  ENTREVISTA_VENCIDA: "ENTREVISTA_VENCIDA",
  AUSENCIA_NOTAS: "AUSENCIA_NOTAS",
}

const DiasAtras = (dias: number): Date => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return fecha;
};

const makeEstudiante = (rut: string) => ({
  rut_estudiante: rut,
});

const makeEntrevista = (rut_estudiante: string, fecha: Date) => ({
  id: Math.random(),
  rut_estudiante,
  fecha_hora: fecha,
});

//Estructura de un test unitario típico en Jest
it('...', async () => {
  // Arrange — datos de entrada y configuración de mocks
  // Act     — llamada al servicio real
  // Assert  — verificación del resultado
});



describe('AlertasService', () => {
  let service: AlertasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertasService,
        { provide: AlertasRepository, useValue: mockRepository }
      ],
    }).compile();

    service = module.get<AlertasService>(AlertasService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Debe generar una alerta si un unico estudiante nunca ha tenido una entrevista', async () => {
    mockRepository.findAllEstudiantes.mockResolvedValue([makeEstudiante('12345678-9')]);
    mockRepository.getAllEntrevistasbyEstudiante.mockResolvedValue([]);

    const alertas = await service.getAlertasByEstudiante('12345678-9');

    expect(alertas).toHaveLength(1);
    expect(alertas[0]).toEqual({tipo: mockAlertasType.ENTREVISTA_VENCIDA, message: 'Estudiante sin entrevista', created_at: expect.any(Date)});
  });

  it('Debe generar la alerta de los estudiantes correspondientes a la generación solicitada que no tengan registros de entrevista', async () => {
    mockRepository.findAllEstudiantes.mockResolvedValue([
      {rut_estudiante: '12345678-9', generacion: '2020'},
      {rut_estudiante: '98765432-1', generacion: '2020'},
      {rut_estudiante: '11111111-1', generacion: '2021'},
    ]);
    mockRepository.getAllEntrevistasbyEstudiante.mockResolvedValue([]);

    const alertas = await service.getAlertasByGeneracion('2020');

    expect(alertas).toHaveLength(2);
    expect(alertas).toEqual([
      {rut_estudiante: '12345678-9', tipo: mockAlertasType.ENTREVISTA_VENCIDA, message: 'Estudiante sin entrevista', created_at: expect.any(Date)},
      {rut_estudiante: '98765432-1', tipo: mockAlertasType.ENTREVISTA_VENCIDA, message: 'Estudiante sin entrevista', created_at: expect.any(Date)}
    ]);
  });

  it('Debe generar alerta para cada estudiante que no haya tenido entrevista o no haya tenido una entrevista en los últimos 30 días', async () => {
    mockRepository.findAllEstudiantes.mockResolvedValue([
      makeEstudiante('12345678-9'),
      makeEstudiante('98765432-1'),
      makeEstudiante('11111111-1'),
    ]);
    mockRepository.getAllEntrevistas.mockResolvedValue([
      makeEntrevista('12345678-9', DiasAtras(31)), 
      makeEntrevista('98765432-1', DiasAtras(15))
    ]);

    const alertas = await service.getAllAlertas();

    expect(alertas).toHaveLength(2);
    expect(alertas).toEqual([
      {rut_estudiante: '12345678-9', tipo: mockAlertasType.ENTREVISTA_VENCIDA, message: 'Estudiante sin entrevista hace más de 31 días', created_at: expect.any(Date)},
      {rut_estudiante: '11111111-1', tipo: mockAlertasType.ENTREVISTA_VENCIDA, message: 'Estudiante sin entrevista', created_at: expect.any(Date)}
    ]);
  });

  it('No debe generar una alerta si el estudiante ha tenido una entrevista en los últimos 30 días', async () => {
    mockRepository.findAllEstudiantes.mockResolvedValue([
      makeEstudiante('12345678-9'),
    ]);
    mockRepository.getAllEntrevistas.mockResolvedValue([
      makeEntrevista('12345678-9', DiasAtras(29)), 
    ]);

    const alertas = await service.getAllAlertas();

    expect(alertas).toHaveLength(0);
    expect(alertas).toEqual([]);
  });

  it('Debe considerar solo la ultima entrevista si el estudiante ha tenido múltiples entrevistas', async () => {
    mockRepository.findAllEstudiantes.mockResolvedValue([
      makeEstudiante('12345678-9'),
      makeEstudiante('98765432-1'),
    ]);
    mockRepository.getAllEntrevistas.mockResolvedValue([
      makeEntrevista('12345678-9', DiasAtras(100)),
      makeEntrevista('12345678-9', DiasAtras(29)),
      makeEntrevista('12345678-9', DiasAtras(15)), 
      makeEntrevista('98765432-1', DiasAtras(100)),
      makeEntrevista('98765432-1', DiasAtras(35)),
    ]);

    const alertas = await service.getAllAlertas();

    expect(alertas).toHaveLength(1);
    expect(alertas).toEqual([
      {rut_estudiante: '98765432-1', tipo: mockAlertasType.ENTREVISTA_VENCIDA, message: 'Estudiante sin entrevista hace más de 35 días', created_at: expect.any(Date)},
    ]);
  });


});
