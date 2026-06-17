import { Test, TestingModule } from '@nestjs/testing';
import { AlertasService } from './alertas.service';
import { AlertaEntrevistaService } from './alerta-entrevista.service';
import { AlertaNotasService } from './alerta-notas.service';
import { AlertaAcuerdoService } from './alerta-acuerdo.service';
import { AlertasRepository } from './alertas.repository';
import { EstadoRamo, TipoSemestre } from '@prisma/client';



const mockRepository = {
  findAllEstudiantes: jest.fn(),
  getAllEntrevistasbyEstudiante: jest.fn(),
  getAllEntrevistas: jest.fn(),
  getAllRamosbyEstudiante: jest.fn(),
  getCarreraByCodigo: jest.fn(),
  getSemestreById: jest.fn(),
  getRamoById: jest.fn(),
  getAcuerdoVigente: jest.fn(),
  getRutsConFirma: jest.fn(),
  getFirmaAcuerdo: jest.fn(),
};

const mockAlertasType = {
  ENTREVISTA_VENCIDA: "ENTREVISTA_VENCIDA",
  AUSENCIA_NOTAS: "AUSENCIA_NOTAS",
  FIRMAR_ACUERDO: "FIRMAR_ACUERDO",
}

const DiasAtras = (dias: number): Date => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return fecha;
};

enum Semestre {
  PRIMER_SEMESTRE = "PRIMER_SEMESTRE",
  SEGUNDO_SEMESTRE = "SEGUNDO_SEMESTRE",
  VERANO = "VERANO",
  INVIERNO = "INVIERNO",
}

// Fechas de término de cada semestre (mes 0-indexado)
const FECHAS_BASE: Record<Semestre, { mes: number; dia: number }> = {
  PRIMER_SEMESTRE:  { mes: 6,  dia: 30 }, // 30 de julio
  SEGUNDO_SEMESTRE: { mes: 11, dia: 30 }, // 30 de diciembre
  INVIERNO:         { mes: 7,  dia: 30 }, // 30 de agosto
  VERANO:           { mes: 2,  dia: 0 },  // último día de febrero (28 o 29)
};

const DiasAdelante = (dias: number, semestre: Semestre): Date => {
  const ahora = new Date();
  const { mes, dia } = FECHAS_BASE[semestre];

  const fechaBase = new Date(ahora.getFullYear(), mes, dia);

  if (ahora > fechaBase) {
    fechaBase.setFullYear(ahora.getFullYear() + 1);
  }

  fechaBase.setDate(fechaBase.getDate() + dias);
  return fechaBase;
};



const makeEstudiante = (rut: string) => ({
  rut_estudiante: rut,
});

const makeEntrevista = (rut_estudiante: string, fecha: Date) => ({
  id: Math.random(),
  rut_estudiante,
  fecha_hora: fecha,
});

const makeRamo = (id: number, nombre: string, estado: EstadoRamo, codigo_carrera: number, rut_estudiante: string, nota_final: number | undefined, semestre_id: number) => ({
  id: id,
  nombre: nombre,
  estado: estado,
  codigo_carrera: codigo_carrera,
  rut_estudiante: rut_estudiante,
  nota_final: nota_final,
  semestre_id: semestre_id,
});

const makeCarrera = (codigo_carrera: number) => ({
  codigo_carrera: codigo_carrera,
  nombre: `Carrera ${codigo_carrera}`,
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
        AlertaEntrevistaService,
        AlertaNotasService,
        AlertaAcuerdoService,
        { provide: AlertasRepository, useValue: mockRepository }
      ],
    }).compile();

    service = module.get<AlertasService>(AlertasService);
  });

  afterEach(() => {
    // resetAllMocks (y no clearAllMocks) para que los mockResolvedValue de un
    // test no se filtren al siguiente: los métodos no mockeados deben devolver
    // undefined y el servicio omite esa verificación.
    jest.resetAllMocks();
    jest.useRealTimers();
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

  it('Debe generar alerta para cada estudiante que no haya tenido entrevista o no haya tenido una entrevista en los últimos 2 meses', async () => {
    mockRepository.findAllEstudiantes.mockResolvedValue([
      makeEstudiante('12345678-9'),
      makeEstudiante('98765432-1'),
      makeEstudiante('11111111-1'),
    ]);
    mockRepository.getAllEntrevistas.mockResolvedValue([
      makeEntrevista('12345678-9', DiasAtras(65)),
      makeEntrevista('98765432-1', DiasAtras(15))
    ]);

    const alertas = await service.getAllAlertas();

    expect(alertas).toHaveLength(2);
    expect(alertas).toEqual([
      {rut_estudiante: '12345678-9', tipo: mockAlertasType.ENTREVISTA_VENCIDA, message: 'Estudiante sin entrevista hace más de 65 días', created_at: expect.any(Date)},
      {rut_estudiante: '11111111-1', tipo: mockAlertasType.ENTREVISTA_VENCIDA, message: 'Estudiante sin entrevista', created_at: expect.any(Date)}
    ]);
  });

  it('No debe generar una alerta si el estudiante ha tenido una entrevista en los últimos 2 meses', async () => {
    mockRepository.findAllEstudiantes.mockResolvedValue([
      makeEstudiante('12345678-9'),
    ]);
    mockRepository.getAllEntrevistas.mockResolvedValue([
      makeEntrevista('12345678-9', DiasAtras(55)),
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
      makeEntrevista('98765432-1', DiasAtras(70)),
    ]);

    const alertas = await service.getAllAlertas();

    expect(alertas).toHaveLength(1);
    expect(alertas).toEqual([
      {rut_estudiante: '98765432-1', tipo: mockAlertasType.ENTREVISTA_VENCIDA, message: 'Estudiante sin entrevista hace más de 70 días', created_at: expect.any(Date)},
    ]);
  });













  // Nuevos casos de prueba para la alerta de ausencia de notas finales después de 1 mes de finalizado el semestre.
  it('Debe generar una alerta si el estudiante no ha subido sus notas después de 1 meses de finalizado el semestre', async () => {
    // configuramos una fecha actual falsa:  29 de agosto = 30 días después del fin del primer semestre (30 de julio), dispara la alerta 
    const fechaActual = new Date(2026, 7, 29); // Mes es 0-indexed
    jest.useFakeTimers();
    jest.setSystemTime(fechaActual);

    mockRepository.findAllEstudiantes.mockResolvedValue([makeEstudiante('12345678-9')]);
    mockRepository.getAllRamosbyEstudiante.mockResolvedValue([
      makeRamo(123, "calculo", EstadoRamo.CURSANDO, 123 , '12345678-9', undefined, 1),
    ]);
    mockRepository.getSemestreById.mockResolvedValue({id: 1, year: 2026, semestre: Semestre.PRIMER_SEMESTRE, tipo: TipoSemestre.REGULAR});
    
    const alertas = await service.getAlertasByEstudiante('12345678-9');
    expect(alertas).toHaveLength(1);
    expect(alertas[0]).toEqual({tipo: mockAlertasType.AUSENCIA_NOTAS, message: `Alumno sin nota final para calculo`, created_at: expect.any(Date)});
  });

  it('Debe generar una alerta para cada ramo sin nota final subida después de 1 meses de finalizado el semestre', async () => {
    // configuramos una fecha actual falsa:  29 de agosto = 30 días después del fin del primer semestre (30 de julio), dispara la alerta
    const fechaActual = new Date(2026, 7, 29); // Mes es 0-indexed
    jest.useFakeTimers();
    jest.setSystemTime(fechaActual);

    mockRepository.findAllEstudiantes.mockResolvedValue([makeEstudiante('12345678-9')]);
    mockRepository.getAllRamosbyEstudiante.mockResolvedValue([
      makeRamo(123, "calculo", EstadoRamo.CURSANDO, 123 , '12345678-9', undefined, 1),
      makeRamo(124, "algebra", EstadoRamo.CURSANDO, 123 , '12345678-9', undefined, 1),
    ]);
    mockRepository.getSemestreById.mockResolvedValue({id: 1, year: 2026, semestre: Semestre.PRIMER_SEMESTRE, tipo: TipoSemestre.REGULAR});
    
    const alertas = await service.getAlertasByEstudiante('12345678-9');
    expect(alertas).toHaveLength(2);
    expect(alertas).toEqual([
      {tipo: mockAlertasType.AUSENCIA_NOTAS, message: `Alumno sin nota final para calculo`, created_at: expect.any(Date)},
      {tipo: mockAlertasType.AUSENCIA_NOTAS, message: `Alumno sin nota final para algebra`, created_at: expect.any(Date)},
    ]);
  });


  it('No debe generar una alerta si los ramos tienen su nota final subida después de 1 meses de finalizado el semestre', async () => {
    // configuramos una fecha actual falsa:  29 de agosto = 30 días después del fin del primer semestre (30 de julio), dispara la alerta
    const fechaActual = new Date(2026, 7, 29); // Mes es 0-indexed
    jest.useFakeTimers();
    jest.setSystemTime(fechaActual);

    mockRepository.findAllEstudiantes.mockResolvedValue([makeEstudiante('12345678-9')]);
    mockRepository.getAllRamosbyEstudiante.mockResolvedValue([
      makeRamo(123, "calculo", EstadoRamo.CURSANDO, 123 , '12345678-9', 5.0, 1),
      makeRamo(124, "algebra", EstadoRamo.CURSANDO, 123 , '12345678-9', 4.5, 1),
    ]);
    mockRepository.getSemestreById.mockResolvedValue({id: 1, year: 2026, semestre: Semestre.PRIMER_SEMESTRE, tipo: TipoSemestre.REGULAR});
    
    const alertas = await service.getAllAlertasByEstudiante('12345678-9');
    expect(alertas).toHaveLength(0);
    expect(alertas).toEqual([]);
  });


  it('Si el ramo es "eliminado" no debe generar una alerta aunque no tenga nota final subida después de 1 meses de finalizado el semestre', async () => {
    // configuramos una fecha actual falsa: 29 de agosto = 30 días después del fin del primer semestre (30 de julio)
    const fechaActual = new Date(2026, 7, 29); // Mes es 0-indexed
    jest.useFakeTimers();
    jest.setSystemTime(fechaActual);
    mockRepository.findAllEstudiantes.mockResolvedValue([makeEstudiante('12345678-9')]);
    mockRepository.getAllRamosbyEstudiante.mockResolvedValue([
      makeRamo(123, "calculo", EstadoRamo.ELIMINADO, 123 , '12345678-9',undefined, 1),
      makeRamo(124, "algebra", EstadoRamo.CURSANDO, 123 , '12345678-9', undefined, 1),
    ]);

    mockRepository.getSemestreById.mockResolvedValue({id: 1, year: 2026, semestre: Semestre.PRIMER_SEMESTRE, tipo: TipoSemestre.REGULAR})

    const alertas = await service.getAlertasByEstudiante('12345678-9');
    expect(alertas).toHaveLength(1);
    expect(alertas).toEqual([
      {tipo: mockAlertasType.AUSENCIA_NOTAS, message: `Alumno sin nota final para algebra`, created_at: expect.any(Date)},
    ]);
  });


  it('Debe manejar mas de un estudiante a la vez', async () => {
    // configuramos una fecha actual falsa:  29 de agosto = 30 días después del fin del primer semestre (30 de julio), dispara la alerta
    const fechaActual = new Date(2026, 7, 29); // Mes es 0-indexed
    jest.useFakeTimers();
    jest.setSystemTime(fechaActual);

    mockRepository.findAllEstudiantes.mockResolvedValue([makeEstudiante('12345678-9')]);
    mockRepository.getAllRamosbyEstudiante.mockResolvedValue([
      makeRamo(123, "calculo", EstadoRamo.CURSANDO, 123 , '12345678-9', undefined, 1),
      makeRamo(124, "algebra", EstadoRamo.CURSANDO, 124 , '98765432-9', undefined, 1),
    ]);
    mockRepository.getSemestreById.mockResolvedValue({id: 1, year: 2026, semestre: Semestre.PRIMER_SEMESTRE, tipo: TipoSemestre.REGULAR});
    
    const alertas = await service.getAllAlertas();
    expect(alertas).toHaveLength(2);
    expect(alertas).toEqual([
      {rut_estudiante: '12345678-9', tipo: mockAlertasType.AUSENCIA_NOTAS, message: `Alumno sin nota final para calculo`, created_at: expect.any(Date)},
      {rut_estudiante: '98765432-9', tipo: mockAlertasType.AUSENCIA_NOTAS, message: `Alumno sin nota final para algebra`, created_at: expect.any(Date)},
    ]);
  });

  it('Debe devolver un arreglo con todas las alertas para una generación específica', async () => {
    // configuramos una fecha actual falsa:  29 de agosto = 30 días después del fin del primer semestre (30 de julio), dispara la alerta
    const fechaActual = new Date(2026, 7, 29); // Mes es 0-indexed
    jest.useFakeTimers();
    jest.setSystemTime(fechaActual);

    mockRepository.findAllEstudiantes.mockResolvedValue([
      {rut_estudiante: '12345678-9', generacion: '2020'},
      {rut_estudiante: '98765432-1', generacion: '2020'},
      {rut_estudiante: '11111111-1', generacion: '2021'},
    ]);

    mockRepository.getAllRamosbyEstudiante.mockResolvedValue([
      makeRamo(123, "a", EstadoRamo.CURSANDO, 123 , '12345678-9', undefined, 1),
      makeRamo(124, "b", EstadoRamo.CURSANDO, 123 , '12345678-9', 4, 1),
      makeRamo(125, "c", EstadoRamo.ELIMINADO, 125 , '98765432-1', undefined, 1),
      makeRamo(126, "c", EstadoRamo.CURSANDO, 124 , '98765432-9', undefined, 1),
    ]);

    mockRepository.getSemestreById.mockResolvedValue({id: 1, year: 2026, semestre: Semestre.PRIMER_SEMESTRE, tipo: TipoSemestre.REGULAR});
    
    const alertas = await service.getAlertasByGeneracion('2020');
    expect(alertas).toHaveLength(1);
    expect(alertas).toEqual([
      {rut_estudiante: '12345678-9', tipo: mockAlertasType.AUSENCIA_NOTAS, message: `Alumno sin nota final para a`, created_at: expect.any(Date)},
    ]);
  });


  it('Debe funcionar para el segundo semestre', async () => {
    // configuramos una fecha actual falsa: 29 de enero de 2027 = 30 días después del fin del segundo semestre (30 de diciembre), dispara la alerta
    const fechaActual = new Date(2027, 0, 29); // Mes es 0-indexed
    jest.useFakeTimers();
    jest.setSystemTime(fechaActual);

    mockRepository.findAllEstudiantes.mockResolvedValue([
      {rut_estudiante: '12345678-9'},
    ]);

    mockRepository.getAllRamosbyEstudiante.mockResolvedValue([
      makeRamo(123, "a", EstadoRamo.CURSANDO, 123 , '12345678-9', undefined, 1),
    ]);

    mockRepository.getSemestreById.mockResolvedValue({id: 1, year: 2026, semestre: Semestre.SEGUNDO_SEMESTRE, tipo: TipoSemestre.REGULAR});
    
    const alertas = await service.getAllAlertas();
    expect(alertas).toHaveLength(1);
    expect(alertas).toEqual([
      {rut_estudiante: '12345678-9', tipo: mockAlertasType.AUSENCIA_NOTAS, message: `Alumno sin nota final para a`, created_at: expect.any(Date)},
    ]);
  });

  it('Debe funcionar para el semestre de invierno', async () => {
    // 29 de septiembre = 30 días después del fin del semestre de invierno (30 de agosto)
    const fechaActual = new Date(2026, 8, 29);
    jest.useFakeTimers();
    jest.setSystemTime(fechaActual);

    mockRepository.findAllEstudiantes.mockResolvedValue([
      { rut_estudiante: '12345678-9' },
    ]);
    mockRepository.getAllRamosbyEstudiante.mockResolvedValue([
      makeRamo(123, "a", EstadoRamo.CURSANDO, 123, '12345678-9', undefined, 1),
    ]);
    mockRepository.getSemestreById.mockResolvedValue({
      id: 1, year: 2026, semestre: Semestre.INVIERNO, tipo: TipoSemestre.REGULAR
    });

    const alertas = await service.getAllAlertas();
    expect(alertas).toHaveLength(1);
    expect(alertas).toEqual([
      { rut_estudiante: '12345678-9', tipo: mockAlertasType.AUSENCIA_NOTAS, message: `Alumno sin nota final para a`, created_at: expect.any(Date) },
    ]);
  });

  it('Debe funcionar para el semestre de verano', async () => {
    // 30 de marzo = 30 días después del fin del semestre de verano (28 febrero)
    const fechaActual = new Date(2026, 2, 30);
    jest.useFakeTimers();
    jest.setSystemTime(fechaActual);

    mockRepository.findAllEstudiantes.mockResolvedValue([
      { rut_estudiante: '12345678-9' },
    ]);
    mockRepository.getAllRamosbyEstudiante.mockResolvedValue([
      makeRamo(123, "a", EstadoRamo.CURSANDO, 123, '12345678-9', undefined, 1),
    ]);
    mockRepository.getSemestreById.mockResolvedValue({
      id: 1, year: 2026, semestre: Semestre.VERANO, tipo: TipoSemestre.REGULAR
    });

    const alertas = await service.getAllAlertas();
    expect(alertas).toHaveLength(1);
    expect(alertas).toEqual([
      { rut_estudiante: '12345678-9', tipo: mockAlertasType.AUSENCIA_NOTAS, message: `Alumno sin nota final para a`, created_at: expect.any(Date) },
    ]);
  });

  // ── Alerta de firma del acuerdo de compromiso ──────────────────────────────

  it('Debe generar una alerta si el estudiante no ha firmado el acuerdo vigente', async () => {
    mockRepository.getAcuerdoVigente.mockResolvedValue({ id: 1, createdAt: new Date('2026-01-01') });
    mockRepository.getFirmaAcuerdo.mockResolvedValue(null);

    const alertas = await service.getAlertasByEstudiante('12345678-9');

    expect(alertas).toHaveLength(1);
    expect(alertas[0]).toEqual({
      tipo: mockAlertasType.FIRMAR_ACUERDO,
      message: 'Estudiante no ha firmado el acuerdo de compromiso vigente',
      created_at: expect.any(Date),
    });
    expect(mockRepository.getFirmaAcuerdo).toHaveBeenCalledWith(1, '12345678-9');
  });

  it('No debe generar la alerta de acuerdo si el estudiante ya firmó la versión vigente', async () => {
    mockRepository.getAcuerdoVigente.mockResolvedValue({ id: 1, createdAt: new Date('2026-01-01') });
    mockRepository.getFirmaAcuerdo.mockResolvedValue({ id: 99 });

    const alertas = await service.getAlertasByEstudiante('12345678-9');

    expect(alertas).toHaveLength(0);
    expect(alertas).toEqual([]);
  });

  it('No debe generar la alerta de acuerdo si no existe ningún acuerdo vigente', async () => {
    mockRepository.getAcuerdoVigente.mockResolvedValue(null);

    const alertas = await service.getAlertasByEstudiante('12345678-9');

    expect(alertas).toHaveLength(0);
    // Sin acuerdo vigente no tiene sentido consultar la firma.
    expect(mockRepository.getFirmaAcuerdo).not.toHaveBeenCalled();
  });

  it('Debe generar la alerta de acuerdo solo para los estudiantes que no firmaron la versión vigente', async () => {
    mockRepository.findAllEstudiantes.mockResolvedValue([
      makeEstudiante('12345678-9'), // firmó
      makeEstudiante('98765432-1'), // no firmó
    ]);
    mockRepository.getAcuerdoVigente.mockResolvedValue({ id: 1, createdAt: new Date('2026-01-01') });
    mockRepository.getRutsConFirma.mockResolvedValue(['12345678-9']);

    const alertas = await service.getAllAlertas();

    expect(alertas).toHaveLength(1);
    expect(alertas).toEqual([
      {
        rut_estudiante: '98765432-1',
        tipo: mockAlertasType.FIRMAR_ACUERDO,
        message: 'Estudiante no ha firmado el acuerdo de compromiso vigente',
        created_at: expect.any(Date),
      },
    ]);
    // El acuerdo vigente se resuelve una sola vez y las firmas se traen en bloque.
    expect(mockRepository.getAcuerdoVigente).toHaveBeenCalledTimes(1);
    expect(mockRepository.getRutsConFirma).toHaveBeenCalledTimes(1);
  });

  // ── Varios tipos de alerta a la vez ────────────────────────────────────────

  it('Debe manejar diferentes tipos de alertas a la vez (entrevista, notas y acuerdo)', async () => {
    // 29 de agosto = 30 días después del fin del primer semestre (dispara notas)
    const fechaActual = new Date(2026, 7, 29);
    jest.useFakeTimers();
    jest.setSystemTime(fechaActual);

    mockRepository.findAllEstudiantes.mockResolvedValue([makeEstudiante('12345678-9')]);
    mockRepository.getAllEntrevistas.mockResolvedValue([
      makeEntrevista('12345678-9', DiasAtras(70)), // entrevista vencida (> 2 meses)
    ]);
    mockRepository.getAllRamosbyEstudiante.mockResolvedValue([
      makeRamo(123, 'calculo', EstadoRamo.CURSANDO, 123, '12345678-9', undefined, 1),
    ]);
    mockRepository.getSemestreById.mockResolvedValue({ id: 1, year: 2026, semestre: Semestre.PRIMER_SEMESTRE, tipo: TipoSemestre.REGULAR });
    mockRepository.getAcuerdoVigente.mockResolvedValue({ id: 1, createdAt: new Date(2026, 0, 1) });
    mockRepository.getRutsConFirma.mockResolvedValue([]); // no firmó

    const alertas = await service.getAllAlertas();

    expect(alertas).toHaveLength(3);
    expect(alertas).toEqual([
      { rut_estudiante: '12345678-9', tipo: mockAlertasType.ENTREVISTA_VENCIDA, message: 'Estudiante sin entrevista hace más de 70 días', created_at: expect.any(Date) },
      { rut_estudiante: '12345678-9', tipo: mockAlertasType.AUSENCIA_NOTAS, message: 'Alumno sin nota final para calculo', created_at: expect.any(Date) },
      { rut_estudiante: '12345678-9', tipo: mockAlertasType.FIRMAR_ACUERDO, message: 'Estudiante no ha firmado el acuerdo de compromiso vigente', created_at: expect.any(Date) },
    ]);
  });
});
