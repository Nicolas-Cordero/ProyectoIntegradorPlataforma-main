import { Test, TestingModule } from '@nestjs/testing';
import { AlertasService } from './alertas.service';
import { AlertaEntrevistaService } from './alerta-entrevista.service';
import { AlertaNotasService } from './alerta-notas.service';
import { AlertaAcuerdoService } from './alerta-acuerdo.service';
import { AlertasRepository } from './alertas.repository';

const mockRepository = {
  findRutsEstudiantes: jest.fn(),
  getUltimaEntrevistaPorEstudiante: jest.fn(),
  getRamosSinNota: jest.fn(),
  getAcuerdoVigente: jest.fn(),
  getRutsConFirma: jest.fn(),
};

const DiasAtras = (dias: number): Date => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return fecha;
};

// Última entrevista por rut, como la devuelve getUltimaEntrevistaPorEstudiante.
const ultimas = (entradas: Record<string, Date>) =>
  new Map(Object.entries(entradas));

// Entrevista reciente para cada rut: aísla las demás alertas en los tests que
// no tratan de entrevistas.
const conEntrevistaReciente = (...ruts: string[]) =>
  ultimas(Object.fromEntries(ruts.map((r) => [r, DiasAtras(1)])));

const ramoSinNota = (
  rut_estudiante: string,
  nombre: string,
  semestre: string,
  year = 2026,
) => ({ rut_estudiante, nombre, semestre: { year, semestre } });

const alerta = (tipo: string, message: string, rut_estudiante?: string) => ({
  ...(rut_estudiante ? { rut_estudiante } : {}),
  tipo,
  message,
  created_at: expect.any(Date),
});

const SIN_ENTREVISTA = 'Estudiante sin entrevista';
const SIN_FIRMA = 'Estudiante no ha firmado el acuerdo de compromiso vigente';

describe('AlertasService', () => {
  let service: AlertasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertasService,
        AlertaEntrevistaService,
        AlertaNotasService,
        AlertaAcuerdoService,
        { provide: AlertasRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<AlertasService>(AlertasService);

    mockRepository.findRutsEstudiantes.mockResolvedValue([]);
    mockRepository.getUltimaEntrevistaPorEstudiante.mockResolvedValue(
      new Map(),
    );
    mockRepository.getRamosSinNota.mockResolvedValue([]);
    mockRepository.getAcuerdoVigente.mockResolvedValue(null);
    mockRepository.getRutsConFirma.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  // ── Consultas ──────────────────────────────────────────────────────────────

  it('Debe hacer una cantidad fija de consultas, sin importar cuántos estudiantes haya', async () => {
    const ruts = Array.from({ length: 150 }, (_, i) => `${i}-0`);
    mockRepository.findRutsEstudiantes.mockResolvedValue(ruts);
    mockRepository.getAcuerdoVigente.mockResolvedValue({ id: 1 });

    await service.getAllAlertas();

    expect(mockRepository.findRutsEstudiantes).toHaveBeenCalledTimes(1);
    expect(
      mockRepository.getUltimaEntrevistaPorEstudiante,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockRepository.getUltimaEntrevistaPorEstudiante,
    ).toHaveBeenCalledWith(ruts);
    expect(mockRepository.getRamosSinNota).toHaveBeenCalledTimes(1);
    expect(mockRepository.getRamosSinNota).toHaveBeenCalledWith(ruts);
    expect(mockRepository.getAcuerdoVigente).toHaveBeenCalledTimes(1);
    expect(mockRepository.getRutsConFirma).toHaveBeenCalledTimes(1);
    expect(mockRepository.getRutsConFirma).toHaveBeenCalledWith(1, ruts);
  });

  it('No debe consultar nada más si no hay estudiantes que evaluar', async () => {
    const alertas = await service.getAlertasByGeneracion('2030');

    expect(alertas).toEqual([]);
    expect(mockRepository.findRutsEstudiantes).toHaveBeenCalledWith(2030);
    expect(
      mockRepository.getUltimaEntrevistaPorEstudiante,
    ).not.toHaveBeenCalled();
    expect(mockRepository.getRamosSinNota).not.toHaveBeenCalled();
  });

  it('Debe devolver un arreglo vacío si la generación no es un año', async () => {
    expect(await service.getAlertasByGeneracion('abc')).toEqual([]);
    expect(mockRepository.findRutsEstudiantes).not.toHaveBeenCalled();
  });

  it('Debe evaluar un estudiante sin consultar la lista de estudiantes', async () => {
    await service.getAlertasByEstudiante('12345678-9');

    expect(mockRepository.findRutsEstudiantes).not.toHaveBeenCalled();
    expect(mockRepository.getRamosSinNota).toHaveBeenCalledWith(['12345678-9']);
  });

  // ── Entrevistas ────────────────────────────────────────────────────────────

  it('Debe generar una alerta si un unico estudiante nunca ha tenido una entrevista', async () => {
    const alertas = await service.getAlertasByEstudiante('12345678-9');

    expect(alertas).toEqual([alerta('ENTREVISTA_VENCIDA', SIN_ENTREVISTA)]);
  });

  it('Debe generar la alerta de los estudiantes de la generación solicitada que no tengan entrevistas', async () => {
    mockRepository.findRutsEstudiantes.mockResolvedValue([
      '12345678-9',
      '98765432-1',
    ]);

    const alertas = await service.getAlertasByGeneracion('2020');

    expect(mockRepository.findRutsEstudiantes).toHaveBeenCalledWith(2020);
    expect(alertas).toEqual([
      alerta('ENTREVISTA_VENCIDA', SIN_ENTREVISTA, '12345678-9'),
      alerta('ENTREVISTA_VENCIDA', SIN_ENTREVISTA, '98765432-1'),
    ]);
  });

  it('Debe generar alerta para cada estudiante sin entrevista o sin una entrevista en los últimos 2 meses', async () => {
    mockRepository.findRutsEstudiantes.mockResolvedValue([
      '12345678-9',
      '98765432-1',
      '11111111-1',
    ]);
    mockRepository.getUltimaEntrevistaPorEstudiante.mockResolvedValue(
      ultimas({ '12345678-9': DiasAtras(65), '98765432-1': DiasAtras(15) }),
    );

    const alertas = await service.getAllAlertas();

    expect(alertas).toEqual([
      alerta(
        'ENTREVISTA_VENCIDA',
        'Estudiante sin entrevista hace más de 65 días',
        '12345678-9',
      ),
      alerta('ENTREVISTA_VENCIDA', SIN_ENTREVISTA, '11111111-1'),
    ]);
  });

  it('No debe generar una alerta si el estudiante ha tenido una entrevista en los últimos 2 meses', async () => {
    mockRepository.findRutsEstudiantes.mockResolvedValue(['12345678-9']);
    mockRepository.getUltimaEntrevistaPorEstudiante.mockResolvedValue(
      ultimas({ '12345678-9': DiasAtras(55) }),
    );

    expect(await service.getAllAlertas()).toEqual([]);
  });

  // ── Notas ──────────────────────────────────────────────────────────────────
  // Los ramos llegan ya filtrados por el repositorio (CURSANDO/PENDIENTE y sin
  // nota final; ver alertas.repository.spec.ts). Aquí se prueba el plazo.

  it('Debe generar una alerta por cada ramo sin nota final pasado 1 mes del fin del semestre', async () => {
    // 29 de agosto = 30 días después del fin del primer semestre (30 de julio)
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 7, 29));
    mockRepository.getUltimaEntrevistaPorEstudiante.mockResolvedValue(
      conEntrevistaReciente('12345678-9'),
    );
    mockRepository.getRamosSinNota.mockResolvedValue([
      ramoSinNota('12345678-9', 'calculo', 'PRIMER_SEMESTRE'),
      ramoSinNota('12345678-9', 'algebra', 'PRIMER_SEMESTRE'),
    ]);

    const alertas = await service.getAlertasByEstudiante('12345678-9');

    expect(alertas).toEqual([
      alerta('AUSENCIA_NOTAS', 'Alumno sin nota final para calculo'),
      alerta('AUSENCIA_NOTAS', 'Alumno sin nota final para algebra'),
    ]);
  });

  it('No debe generar la alerta de notas antes de que pase 1 mes del fin del semestre', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 7, 28));
    mockRepository.getUltimaEntrevistaPorEstudiante.mockResolvedValue(
      conEntrevistaReciente('12345678-9'),
    );
    mockRepository.getRamosSinNota.mockResolvedValue([
      ramoSinNota('12345678-9', 'calculo', 'PRIMER_SEMESTRE'),
    ]);

    expect(await service.getAlertasByEstudiante('12345678-9')).toEqual([]);
  });

  it('Debe asignar los ramos a su estudiante cuando se evalúan varios a la vez', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 7, 29));
    mockRepository.findRutsEstudiantes.mockResolvedValue([
      '12345678-9',
      '98765432-1',
    ]);
    mockRepository.getUltimaEntrevistaPorEstudiante.mockResolvedValue(
      conEntrevistaReciente('12345678-9', '98765432-1'),
    );
    // El repositorio los devuelve mezclados; las alertas salen por estudiante.
    mockRepository.getRamosSinNota.mockResolvedValue([
      ramoSinNota('98765432-1', 'algebra', 'PRIMER_SEMESTRE'),
      ramoSinNota('12345678-9', 'calculo', 'PRIMER_SEMESTRE'),
      ramoSinNota('98765432-1', 'fisica', 'PRIMER_SEMESTRE'),
    ]);

    const alertas = await service.getAllAlertas();

    expect(alertas).toEqual([
      alerta(
        'AUSENCIA_NOTAS',
        'Alumno sin nota final para calculo',
        '12345678-9',
      ),
      alerta(
        'AUSENCIA_NOTAS',
        'Alumno sin nota final para algebra',
        '98765432-1',
      ),
      alerta(
        'AUSENCIA_NOTAS',
        'Alumno sin nota final para fisica',
        '98765432-1',
      ),
    ]);
  });

  it.each([
    // [semestre, año del semestre, fecha actual (30 días después de su fin)]
    ['SEGUNDO_SEMESTRE', 2026, new Date(2027, 0, 29)], // fin 30 de diciembre
    ['INVIERNO', 2026, new Date(2026, 8, 29)], // fin 30 de agosto
    ['VERANO', 2026, new Date(2026, 2, 30)], // fin 28 de febrero
  ])('Debe funcionar para el semestre %s', async (semestre, year, hoy) => {
    jest.useFakeTimers();
    jest.setSystemTime(hoy);
    mockRepository.findRutsEstudiantes.mockResolvedValue(['12345678-9']);
    mockRepository.getUltimaEntrevistaPorEstudiante.mockResolvedValue(
      conEntrevistaReciente('12345678-9'),
    );
    mockRepository.getRamosSinNota.mockResolvedValue([
      ramoSinNota('12345678-9', 'a', semestre, year),
    ]);

    expect(await service.getAllAlertas()).toEqual([
      alerta('AUSENCIA_NOTAS', 'Alumno sin nota final para a', '12345678-9'),
    ]);
  });

  // ── Acuerdo de compromiso ──────────────────────────────────────────────────

  it('Debe generar una alerta si el estudiante no ha firmado el acuerdo vigente', async () => {
    mockRepository.getUltimaEntrevistaPorEstudiante.mockResolvedValue(
      conEntrevistaReciente('12345678-9'),
    );
    mockRepository.getAcuerdoVigente.mockResolvedValue({ id: 1 });

    const alertas = await service.getAlertasByEstudiante('12345678-9');

    expect(alertas).toEqual([alerta('FIRMAR_ACUERDO', SIN_FIRMA)]);
    expect(mockRepository.getRutsConFirma).toHaveBeenCalledWith(1, [
      '12345678-9',
    ]);
  });

  it('No debe generar la alerta de acuerdo si el estudiante ya firmó la versión vigente', async () => {
    mockRepository.getUltimaEntrevistaPorEstudiante.mockResolvedValue(
      conEntrevistaReciente('12345678-9'),
    );
    mockRepository.getAcuerdoVigente.mockResolvedValue({ id: 1 });
    mockRepository.getRutsConFirma.mockResolvedValue(['12345678-9']);

    expect(await service.getAlertasByEstudiante('12345678-9')).toEqual([]);
  });

  it('No debe generar la alerta de acuerdo ni consultar firmas si no existe ningún acuerdo', async () => {
    mockRepository.getUltimaEntrevistaPorEstudiante.mockResolvedValue(
      conEntrevistaReciente('12345678-9'),
    );

    expect(await service.getAlertasByEstudiante('12345678-9')).toEqual([]);
    expect(mockRepository.getRutsConFirma).not.toHaveBeenCalled();
  });

  it('Debe generar la alerta de acuerdo solo para los estudiantes que no firmaron la versión vigente', async () => {
    mockRepository.findRutsEstudiantes.mockResolvedValue([
      '12345678-9', // firmó
      '98765432-1', // no firmó
    ]);
    mockRepository.getUltimaEntrevistaPorEstudiante.mockResolvedValue(
      conEntrevistaReciente('12345678-9', '98765432-1'),
    );
    mockRepository.getAcuerdoVigente.mockResolvedValue({ id: 1 });
    mockRepository.getRutsConFirma.mockResolvedValue(['12345678-9']);

    expect(await service.getAllAlertas()).toEqual([
      alerta('FIRMAR_ACUERDO', SIN_FIRMA, '98765432-1'),
    ]);
  });

  // ── Varios tipos a la vez ──────────────────────────────────────────────────

  it('Debe devolver las alertas de cada estudiante en orden: entrevista, notas y acuerdo', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 7, 29));
    mockRepository.findRutsEstudiantes.mockResolvedValue(['12345678-9']);
    mockRepository.getUltimaEntrevistaPorEstudiante.mockResolvedValue(
      ultimas({ '12345678-9': DiasAtras(70) }),
    );
    mockRepository.getRamosSinNota.mockResolvedValue([
      ramoSinNota('12345678-9', 'calculo', 'PRIMER_SEMESTRE'),
    ]);
    mockRepository.getAcuerdoVigente.mockResolvedValue({ id: 1 });

    expect(await service.getAllAlertas()).toEqual([
      alerta(
        'ENTREVISTA_VENCIDA',
        'Estudiante sin entrevista hace más de 70 días',
        '12345678-9',
      ),
      alerta(
        'AUSENCIA_NOTAS',
        'Alumno sin nota final para calculo',
        '12345678-9',
      ),
      alerta('FIRMAR_ACUERDO', SIN_FIRMA, '12345678-9'),
    ]);
  });
});
