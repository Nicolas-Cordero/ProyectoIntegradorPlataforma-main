import { EstadoRamo } from '@prisma/client';
import { SemestreService } from './semestre.service';
import {
  CambioEstadoRamo,
  RamoParaCierre,
  SemestreRepository,
} from './semestre.repository';
import { StorageService } from '../storage/storage.service';

// Las reglas de cierre viven en el servicio; el repositorio solo aporta la
// transacción. Estos tests le pasan los ramos al callback que el servicio
// entrega y verifican qué cambios pide escribir.
describe('SemestreService.cerrarSemestre', () => {
  let service: SemestreService;
  let cambiosPedidos: CambioEstadoRamo[];

  function cerrarCon(ramos: RamoParaCierre[]): Promise<void> {
    const repo = {
      cerrarSemestre: jest.fn(
        (
          _semestre_id: number,
          _codigo_carrera: number,
          calcularCambios: (r: RamoParaCierre[]) => CambioEstadoRamo[],
        ) => {
          cambiosPedidos = calcularCambios(ramos);
          return Promise.resolve();
        },
      ),
    };
    service = new SemestreService(
      repo as unknown as SemestreRepository,
      {} as StorageService,
    );
    return service.cerrarSemestre(1, 1);
  }

  beforeEach(() => {
    cambiosPedidos = [];
  });

  it('deriva el estado desde la nota final: >= 4 aprueba, < 4 reprueba', async () => {
    await cerrarCon([
      { id: 1, estado: EstadoRamo.CURSANDO, nota_final: 4 },
      { id: 2, estado: EstadoRamo.CURSANDO, nota_final: 3.9 },
    ]);

    expect(cambiosPedidos).toEqual([
      { id: 1, estado: EstadoRamo.APROBADO },
      { id: 2, estado: EstadoRamo.REPROBADO },
    ]);
  });

  it('cierra el semestre aunque haya ramos sin nota, dejándolos PENDIENTE', async () => {
    await cerrarCon([
      { id: 1, estado: EstadoRamo.CURSANDO, nota_final: null },
      { id: 2, estado: EstadoRamo.CURSANDO, nota_final: 5.5 },
    ]);

    expect(cambiosPedidos).toEqual([
      { id: 1, estado: EstadoRamo.PENDIENTE },
      { id: 2, estado: EstadoRamo.APROBADO },
    ]);
  });

  it('respeta el estado del tutor en un ramo sin nota ya evaluado', async () => {
    // Ramo que no se califica con nota: el tutor lo dejó APROBADO a mano y el
    // cierre no lo degrada a PENDIENTE.
    await cerrarCon([
      { id: 1, estado: EstadoRamo.APROBADO, nota_final: null },
      { id: 2, estado: EstadoRamo.REPROBADO, nota_final: null },
    ]);

    expect(cambiosPedidos).toEqual([]);
  });

  it('deja intacto un ramo eliminado, con o sin nota', async () => {
    await cerrarCon([
      { id: 1, estado: EstadoRamo.ELIMINADO, nota_final: null },
      { id: 2, estado: EstadoRamo.ELIMINADO, nota_final: 2 },
    ]);

    expect(cambiosPedidos).toEqual([]);
  });

  it('saca de PENDIENTE a un ramo que llegó al cierre ya con nota', async () => {
    await cerrarCon([{ id: 1, estado: EstadoRamo.PENDIENTE, nota_final: 6 }]);

    expect(cambiosPedidos).toEqual([{ id: 1, estado: EstadoRamo.APROBADO }]);
  });

  it('no reescribe un ramo cuyo estado ya coincide con el calculado', async () => {
    await cerrarCon([
      { id: 1, estado: EstadoRamo.APROBADO, nota_final: 6 },
      { id: 2, estado: EstadoRamo.PENDIENTE, nota_final: null },
    ]);

    expect(cambiosPedidos).toEqual([]);
  });
});
