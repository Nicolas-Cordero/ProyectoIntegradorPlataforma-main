import { Test, TestingModule } from '@nestjs/testing';
import { AlertasController } from './alertas.controller';
import { AlertasService } from './alertas.service';

// ─── Mock del servicio ────────────────────────────────────────────────────────
const mockAlertasService = {
  getAllAlertas: jest.fn(),
  getAllAlertasByEstudiante: jest.fn(),
  getAlertasByGeneracion: jest.fn(),
};

// ─── Factory de alertas de prueba ─────────────────────────────────────────────
const makeAlerta = (rut: string, tipo = 'ENTREVISTA_VENCIDA') => ({
  rut_estudiante: rut,
  tipo,
  message: 'Sin entrevista hace 45 días',
  created_at: new Date(),
});

// ─── Suite ────────────────────────────────────────────────────────────────────
describe('AlertasController', () => {
  let controller: AlertasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertasController],
      providers: [{ provide: AlertasService, useValue: mockAlertasService }],
    }).compile();

    controller = module.get<AlertasController>(AlertasController);
  });

  afterEach(() => jest.clearAllMocks());

  // ── getAllAlertas ──────────────────────────────────────────────────────────

  describe('getAllAlertas', () => {
    it('debe retornar todas las alertas que entrega el servicio', async () => {
      // Arrange
      const alertasMock = [makeAlerta('12345678-9'), makeAlerta('98765432-1')];
      mockAlertasService.getAllAlertas.mockResolvedValue(alertasMock);

      // Act
      const resultado = await controller.getAllAlertas();

      // Assert
      expect(resultado).toEqual(alertasMock);
      expect(mockAlertasService.getAllAlertas).toHaveBeenCalledTimes(1);
    });

    it('debe retornar un array vacío si el servicio no genera alertas', async () => {
      // Arrange
      mockAlertasService.getAllAlertas.mockResolvedValue([]);

      // Act
      const resultado = await controller.getAllAlertas();

      // Assert
      expect(resultado).toEqual([]);
    });
  });

  // ── getAllAlertasByEstudiante ───────────────────────────────────────────────

  describe('getAllAlertasByEstudiante', () => {
    it('debe pasar el rut al servicio y retornar su respuesta', async () => {
      // Arrange
      const rut = '12345678-9';
      const alertasMock = [makeAlerta(rut)];
      mockAlertasService.getAllAlertasByEstudiante.mockResolvedValue(
        alertasMock,
      );

      // Act
      const resultado = await controller.getAllAlertasByEstudiante(rut);

      // Assert
      expect(resultado).toEqual(alertasMock);
      expect(mockAlertasService.getAllAlertasByEstudiante).toHaveBeenCalledWith(
        rut,
      );
      expect(
        mockAlertasService.getAllAlertasByEstudiante,
      ).toHaveBeenCalledTimes(1);
    });
  });

  // ── getAlertasByGeneracion ─────────────────────────────────────────────────

  describe('getAlertasByGeneracion', () => {
    it('debe pasar la generacion al servicio y retornar su respuesta', async () => {
      // Arrange
      const generacion = '2020';
      const alertasMock = [makeAlerta('12345678-9'), makeAlerta('98765432-1')];
      mockAlertasService.getAlertasByGeneracion.mockResolvedValue(alertasMock);

      // Act
      const resultado = await controller.getAlertasByGeneracion(generacion);

      // Assert
      expect(resultado).toEqual(alertasMock);
      expect(mockAlertasService.getAlertasByGeneracion).toHaveBeenCalledWith(
        generacion,
      );
      expect(mockAlertasService.getAlertasByGeneracion).toHaveBeenCalledTimes(
        1,
      );
    });
  });
});
