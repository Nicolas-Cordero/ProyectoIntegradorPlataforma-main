import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  School as SchoolIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { Modal, Input, Select, Alert } from '../../components/ui';
import { useConfirmDialog } from '../../components/ui';
import { Spinner } from '../../components/ui';
import type { EstudianteOutletContext } from './EstudianteDetail';
import {
  universidadService,
  carreraAvanceService,
  semestreAvanceService,
  ramoAvanceService,
} from '../../services';
import type { UniversidadDto } from '../../services/universidad.service';
import type { CarreraAvanceDto, CreateCarreraAvanceDto, ViaAcceso } from '../../services/carrera-avance.service';
import type { SemestreDto, BackendSemestre, TipoSemestre, CreateSemestreDto } from '../../services/semestre-avance.service';
import type { RamoAvanceDto, EstadoRamoAvance } from '../../services/ramo-avance.service';

// ─── Constantes / helpers de mapeo ────────────────────────────────────────────

type CodigoSemUI = '1' | '2' | 'INVIERNO' | 'VERANO';

const UI_TO_BACKEND: Record<CodigoSemUI, BackendSemestre> = {
  '1':        'PRIMER_SEMESTRE',
  '2':        'SEGUNDO_SEMESTRE',
  'INVIERNO': 'INVIERNO',
  'VERANO':   'VERANO',
};

const BACKEND_TO_UI: Record<BackendSemestre, CodigoSemUI> = {
  PRIMER_SEMESTRE:  '1',
  SEGUNDO_SEMESTRE: '2',
  INVIERNO:         'INVIERNO',
  VERANO:           'VERANO',
};

// Orden cronológico dentro de un mismo año:
// Sem 1 → Rec. Invierno → Sem 2 → Rec. Verano
const ORDEN_SEMESTRE: Record<CodigoSemUI, number> = {
  '1':        0,
  'INVIERNO': 1,
  '2':        2,
  'VERANO':   3,
};

function semLabel(year: number, tipo: TipoSemestre, codigo: CodigoSemUI): string {
  if (tipo === 'REGULAR') return `${year} — Semestre ${codigo}`;
  return `${year} — Rec. ${codigo === 'INVIERNO' ? 'Invierno' : 'Verano'}`;
}

// La nota final ahora es un valor único ingresado a mano (puede llegar como
// string desde Prisma Decimal). Normaliza a number | null.
function normalizarNota(valor: number | string | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  return isNaN(n) ? null : n;
}

function esCerrado(ramos: RamoUI[]): boolean {
  return ramos.length > 0 && ramos.every(r => r.estado !== 'CURSANDO');
}

// ─── Tipos UI ─────────────────────────────────────────────────────────────────

interface RamoUI {
  id: number;
  nombre: string;
  estado: EstadoRamoAvance;
  comentario: string;
  intento: number;
  nota_final: number | null;
}

interface SemestreUI {
  semestre_id: number;
  year: number;
  codigo: CodigoSemUI;
  tipo: TipoSemestre;
  ramos: RamoUI[];
  soloLocal: boolean; // creado en esta sesión pero sin ramos (no persiste si se recarga)
}

interface CarreraUI extends CarreraAvanceDto {
  semestres: SemestreUI[];
  cargando: boolean;
  error: string | null;
}

// ─── Chips de estado ──────────────────────────────────────────────────────────

const ESTADO_CHIP: Record<EstadoRamoAvance, { bg: string; text: string; label: string }> = {
  APROBADO:  { bg: 'bg-green-100', text: 'text-green-700', label: 'Aprobado'  },
  REPROBADO: { bg: 'bg-red-100',   text: 'text-red-700',   label: 'Reprobado' },
  CURSANDO:  { bg: 'bg-blue-100',  text: 'text-blue-700',  label: 'Cursando'  },
  ELIMINADO: { bg: 'bg-gray-100',  text: 'text-gray-500',  label: 'Eliminado' },
};

const ESTADO_RAMO_OPTS: { valor: EstadoRamoAvance; etiqueta: string }[] = [
  { valor: 'APROBADO',  etiqueta: 'Aprobado'  },
  { valor: 'REPROBADO', etiqueta: 'Reprobado' },
  { valor: 'CURSANDO',  etiqueta: 'Cursando'  },
  { valor: 'ELIMINADO', etiqueta: 'Eliminado' },
];

const VIA_ACCESO_OPTS = [
  { valor: 'REGULAR',  etiqueta: 'Regular'  },
  { valor: 'ESPECIAL', etiqueta: 'Especial' },
  { valor: 'PACE',     etiqueta: 'PACE'     },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function EstudianteAvanceCurricular() {
  const { estudiante } = useOutletContext<EstudianteOutletContext>();
  const rut = estudiante.rut_estudiante;

  const { showConfirm, ConfirmDialog } = useConfirmDialog();

  // ── Estado global ─────────────────────────────────────────────────────────
  const [carreras, setCarreras] = useState<CarreraUI[]>([]);
  const [cargandoCarreras, setCargandoCarreras] = useState(true);
  const [errorCarreras, setErrorCarreras] = useState<string | null>(null);

  // ── Modal: Nueva carrera ──────────────────────────────────────────────────
  const [modalCarrera, setModalCarrera] = useState(false);
  const [universidades, setUniversidades] = useState<UniversidadDto[]>([]);
  const [cargandoUniversidades, setCargandoUniversidades] = useState(false);
  const [busquedaUniv, setBusquedaUniv] = useState('');
  const [formCarrera, setFormCarrera] = useState<{
    nombre: string;
    codigo_universidad: number | null;
    universidad_nombre: string;
    duracion_sem: string;
    via_acceso: ViaAcceso;
  }>({ nombre: '', codigo_universidad: null, universidad_nombre: '', duracion_sem: '8', via_acceso: 'REGULAR' });
  const [errCarrera, setErrCarrera] = useState('');
  const [guardandoCarrera, setGuardandoCarrera] = useState(false);

  // ── Modal: Nuevo semestre ─────────────────────────────────────────────────
  const [modalSemestre, setModalSemestre] = useState<number | null>(null); // codigo_carrera
  const [todosLosSemestres, setTodosLosSemestres] = useState<SemestreDto[]>([]);
  const [formSem, setFormSem] = useState<{ year: number; tipo: TipoSemestre; codigo: CodigoSemUI }>({
    year: new Date().getFullYear(), tipo: 'REGULAR', codigo: '1',
  });
  const [errSem, setErrSem] = useState('');
  const [guardandoSem, setGuardandoSem] = useState(false);

  // ── Modal: Crear / editar ramo ────────────────────────────────────────────
  const [modalRamo, setModalRamo] = useState<{
    carreraId: number;
    semestreId: number;
    rutEstudiante: string;
    editRamo?: RamoUI;
  } | null>(null);
  const [formRamo, setFormRamo] = useState({
    nombre: '', estado: 'CURSANDO' as EstadoRamoAvance, comentario: '', intento: '1', nota_final: '',
  });
  const [errRamo, setErrRamo] = useState('');
  const [guardandoRamo, setGuardandoRamo] = useState(false);

  // ── Cargar ramos de una carrera (debe declararse ANTES de cargarCarreras) ──
  const cargarSemestres = useCallback(async (codigo_carrera: number) => {
    setCarreras(cs => cs.map(c => c.codigo_carrera === codigo_carrera
      ? { ...c, cargando: true, error: null }
      : c
    ));
    try {
      const ramos = await ramoAvanceService.getByCarrera(codigo_carrera);
      const semestresMap = new Map<number, SemestreUI>();

      for (const r of ramos) {
        const { semestre_id, year, semestre, tipo } = r.semestre;
        if (!semestresMap.has(semestre_id)) {
          semestresMap.set(semestre_id, {
            semestre_id,
            year,
            codigo: BACKEND_TO_UI[semestre],
            tipo,
            ramos: [],
            soloLocal: false,
          });
        }
        semestresMap.get(semestre_id)!.ramos.push({
          id:         r.id,
          nombre:     r.nombre,
          estado:     r.estado,
          comentario: r.comentario,
          intento:    r.intento,
          nota_final: normalizarNota(r.nota_final),
        });
      }

      const semestres = Array.from(semestresMap.values()).sort((a, b) =>
        a.year !== b.year ? a.year - b.year : ORDEN_SEMESTRE[a.codigo] - ORDEN_SEMESTRE[b.codigo]
      );

      setCarreras(cs => cs.map(c => c.codigo_carrera === codigo_carrera
        ? { ...c, semestres, cargando: false }
        : c
      ));
    } catch {
      setCarreras(cs => cs.map(c => c.codigo_carrera === codigo_carrera
        ? { ...c, cargando: false, error: 'No se pudieron cargar los semestres.' }
        : c
      ));
    }
  }, []);

  // ── Carga inicial de carreras ─────────────────────────────────────────────
  const cargarCarreras = useCallback(async () => {
    setCargandoCarreras(true);
    setErrorCarreras(null);
    try {
      const data = await carreraAvanceService.getByEstudiante(rut);
      // Inicia con cargando:true para bloquear acciones hasta que lleguen los ramos
      setCarreras(data.map(c => ({ ...c, semestres: [], cargando: true, error: null })));
      // Dispara la carga de ramos de todas las carreras en paralelo
      data.forEach(c => cargarSemestres(c.codigo_carrera));
    } catch {
      setErrorCarreras('No se pudieron cargar las carreras. Intenta de nuevo.');
    } finally {
      setCargandoCarreras(false);
    }
  }, [rut, cargarSemestres]);

  useEffect(() => { cargarCarreras(); }, [cargarCarreras]);

  // ── Carrera: crear ────────────────────────────────────────────────────────
  const abrirModalCarrera = () => {
    setFormCarrera({ nombre: '', codigo_universidad: null, universidad_nombre: '', duracion_sem: '8', via_acceso: 'REGULAR' });
    setBusquedaUniv('');
    setErrCarrera('');

    if (universidades.length === 0) {
      setCargandoUniversidades(true);
      universidadService.getAll()
        .then(setUniversidades)
        .catch(() => setErrCarrera('No se pudieron cargar las universidades.'))
        .finally(() => setCargandoUniversidades(false));
    }

    setModalCarrera(true);
  };

  const agregarCarrera = async () => {
    if (!formCarrera.codigo_universidad) { setErrCarrera('Selecciona una universidad'); return; }
    if (!formCarrera.nombre.trim())       { setErrCarrera('El nombre de la carrera es requerido'); return; }
    const dur = parseInt(formCarrera.duracion_sem, 10);
    if (isNaN(dur) || dur < 1)            { setErrCarrera('La duración debe ser al menos 1 semestre'); return; }

    setGuardandoCarrera(true);
    setErrCarrera('');
    try {
      const payload: CreateCarreraAvanceDto = {
        nombre:             formCarrera.nombre.trim(),
        rut_estudiante:     rut,
        duracion_sem:       dur,
        codigo_universidad: formCarrera.codigo_universidad,
        via_acceso:         formCarrera.via_acceso,
      };
      const nueva = await carreraAvanceService.create(payload);
      setCarreras(cs => [...cs, { ...nueva, semestres: [], cargando: false, error: null }]);
      setModalCarrera(false);
    } catch (e: any) {
      setErrCarrera(e?.message || 'Error al crear la carrera.');
    } finally {
      setGuardandoCarrera(false);
    }
  };

  const eliminarCarrera = (codigo_carrera: number, nombre: string) => {
    showConfirm({
      title: 'Eliminar carrera',
      message: `Se eliminará "${nombre}" y todos sus datos. Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      confirmColor: 'error',
      onConfirm: async () => {
        try {
          await carreraAvanceService.remove(codigo_carrera);
          setCarreras(cs => cs.filter(c => c.codigo_carrera !== codigo_carrera));
        } catch (e: any) {
          setErrorCarreras(e?.message || 'Error al eliminar la carrera.');
        }
      },
    });
  };

  // ── Semestre: abrir modal ─────────────────────────────────────────────────
  const abrirModalSemestre = async (codigo_carrera: number) => {
    setFormSem({ year: new Date().getFullYear(), tipo: 'REGULAR', codigo: '1' });
    setErrSem('');
    setModalSemestre(codigo_carrera);

    if (todosLosSemestres.length === 0) {
      try {
        const sems = await semestreAvanceService.getAll();
        setTodosLosSemestres(sems);
      } catch {
        // Si falla, igual se puede continuar; el "find or create" lo manejará
      }
    }
  };

  const agregarSemestre = async () => {
    if (modalSemestre === null) return;
    const carrera = carreras.find(c => c.codigo_carrera === modalSemestre);
    if (!carrera) return;

    const backendCodigo = UI_TO_BACKEND[formSem.codigo];

    // Validar recuperativo requiere semestre regular cerrado
    if (formSem.tipo === 'RECUPERATIVO') {
      const hayRegularCerrado = carrera.semestres.some(
        s => s.tipo === 'REGULAR' && esCerrado(s.ramos)
      );
      if (!hayRegularCerrado) {
        setErrSem('Se requiere al menos un semestre regular cerrado para agregar uno recuperativo.');
        return;
      }
    }

    // Validar duplicado local
    const duplicadoLocal = carrera.semestres.some(
      s => s.year === formSem.year && s.codigo === formSem.codigo
    );
    if (duplicadoLocal) {
      const label = semLabel(formSem.year, formSem.tipo, formSem.codigo);
      setErrSem(`Ya existe ${label} en esta carrera.`);
      return;
    }

    setGuardandoSem(true);
    setErrSem('');
    try {
      // Buscar semestre global existente o crearlo
      let semestre = todosLosSemestres.find(
        s => s.year === formSem.year && s.semestre === backendCodigo && s.tipo === formSem.tipo
      );
      if (!semestre) {
        const payload: CreateSemestreDto = {
          year:     formSem.year,
          semestre: backendCodigo,
          tipo:     formSem.tipo,
        };
        semestre = await semestreAvanceService.create(payload);
        setTodosLosSemestres(prev => [...prev, semestre!]);
      }

      const nuevoSem: SemestreUI = {
        semestre_id: semestre.semestre_id,
        year:        formSem.year,
        codigo:      formSem.codigo,
        tipo:        formSem.tipo,
        ramos:       [],
        soloLocal:   true,
      };

      setCarreras(cs => cs.map(c => c.codigo_carrera === modalSemestre
        ? { ...c, semestres: [...c.semestres, nuevoSem] }
        : c
      ));
      setModalSemestre(null);
    } catch (e: any) {
      // El error 409 indica que ya existe globalmente pero con distinto tipo — caso edge raro
      setErrSem(e?.message || 'Error al crear el semestre.');
    } finally {
      setGuardandoSem(false);
    }
  };

  const eliminarSemestreLocal = (codigo_carrera: number, semestre_id: number) => {
    showConfirm({
      title: 'Eliminar semestre',
      message: 'Se eliminarán todos los ramos asociados. Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      confirmColor: 'error',
      onConfirm: async () => {
        const carrera = carreras.find(c => c.codigo_carrera === codigo_carrera);
        const sem = carrera?.semestres.find(s => s.semestre_id === semestre_id);
        if (!sem) return;

        try {
          // Eliminar ramos del backend primero
          await Promise.all(sem.ramos.map(r => ramoAvanceService.remove(r.id)));
          // Quitar de UI
          setCarreras(cs => cs.map(c => c.codigo_carrera === codigo_carrera
            ? { ...c, semestres: c.semestres.filter(s => s.semestre_id !== semestre_id) }
            : c
          ));
        } catch (e: any) {
          setErrorCarreras(e?.message || 'Error al eliminar el semestre.');
        }
      },
    });
  };

  // ── Semestre: cerrar ──────────────────────────────────────────────────────
  const cerrarSemestre = async (codigo_carrera: number, semestre_id: number) => {
    const carrera = carreras.find(c => c.codigo_carrera === codigo_carrera);
    const sem = carrera?.semestres.find(s => s.semestre_id === semestre_id);
    if (!sem) return;

    const ramosACerrar = sem.ramos.filter(r => r.estado === 'CURSANDO');
    if (ramosACerrar.length === 0) return;

    try {
      const actualizados = await Promise.all(
        ramosACerrar.map(r => {
          const nuevoEstado: EstadoRamoAvance =
            r.nota_final !== null && r.nota_final >= 4 ? 'APROBADO' : 'REPROBADO';
          return ramoAvanceService.update(r.id, { estado: nuevoEstado }).then(res => ({
            id: r.id,
            estado: nuevoEstado,
            res,
          }));
        })
      );

      setCarreras(cs => cs.map(c => c.codigo_carrera === codigo_carrera ? {
        ...c,
        semestres: c.semestres.map(s => s.semestre_id === semestre_id ? {
          ...s,
          soloLocal: false,
          ramos: s.ramos.map(r => {
            const upd = actualizados.find(u => u.id === r.id);
            return upd ? { ...r, estado: upd.estado } : r;
          }),
        } : s),
      } : c));
    } catch (e: any) {
      setErrorCarreras(e?.message || 'Error al cerrar el semestre.');
    }
  };

  // ── Ramo: abrir modales ───────────────────────────────────────────────────
  const abrirNuevoRamo = (codigo_carrera: number, semestre_id: number) => {
    setFormRamo({ nombre: '', estado: 'CURSANDO', comentario: '', intento: '1', nota_final: '' });
    setErrRamo('');
    setModalRamo({ carreraId: codigo_carrera, semestreId: semestre_id, rutEstudiante: rut });
  };

  const abrirEditarRamo = (codigo_carrera: number, semestre_id: number, ramo: RamoUI) => {
    setFormRamo({
      nombre:     ramo.nombre,
      estado:     ramo.estado,
      comentario: ramo.comentario,
      intento:    String(ramo.intento),
      nota_final: ramo.nota_final !== null ? String(ramo.nota_final) : '',
    });
    setErrRamo('');
    setModalRamo({ carreraId: codigo_carrera, semestreId: semestre_id, rutEstudiante: rut, editRamo: ramo });
  };

  const guardarRamo = async () => {
    if (!modalRamo) return;
    if (!formRamo.nombre.trim()) { setErrRamo('El nombre del ramo es requerido'); return; }
    const intento = parseInt(formRamo.intento, 10);
    if (isNaN(intento) || intento < 1) { setErrRamo('El intento debe ser un número mayor a 0'); return; }

    // Nota final: no aplica para eliminados; opcional para el resto (1.0–7.0)
    let notaFinal: number | null = null;
    if (formRamo.estado !== 'ELIMINADO' && formRamo.nota_final.trim() !== '') {
      notaFinal = Number(formRamo.nota_final.replace(',', '.'));
      if (isNaN(notaFinal) || notaFinal < 1 || notaFinal > 7) {
        setErrRamo('La nota final debe ser un número entre 1.0 y 7.0');
        return;
      }
      notaFinal = Math.round(notaFinal * 10) / 10; // máx. 1 decimal
    }

    // Validar límite de ramos en recuperativo
    const carreraUI = carreras.find(c => c.codigo_carrera === modalRamo.carreraId);
    const semUI     = carreraUI?.semestres.find(s => s.semestre_id === modalRamo.semestreId);
    const esRecupPorLimite = semUI?.tipo === 'RECUPERATIVO'
      && !modalRamo.editRamo
      && (semUI?.ramos.length ?? 0) >= 1;
    if (esRecupPorLimite) {
      setErrRamo('Los semestres recuperativos solo pueden contener un ramo.');
      return;
    }

    setGuardandoRamo(true);
    setErrRamo('');
    try {
      if (modalRamo.editRamo) {
        const updated = await ramoAvanceService.update(modalRamo.editRamo.id, {
          nombre:    formRamo.nombre.trim(),
          estado:    formRamo.estado,
          comentario: formRamo.comentario,
          intento,
          nota_final: notaFinal,
        });
        setCarreras(cs => cs.map(c => c.codigo_carrera === modalRamo.carreraId ? {
          ...c,
          semestres: c.semestres.map(s => s.semestre_id === modalRamo.semestreId ? {
            ...s,
            ramos: s.ramos.map(r => r.id === modalRamo.editRamo!.id
              ? { ...r, nombre: updated.nombre, estado: updated.estado, comentario: updated.comentario, intento: updated.intento, nota_final: normalizarNota(updated.nota_final) }
              : r
            ),
          } : s),
        } : c));
      } else {
        const created = await ramoAvanceService.create({
          semestre_id:    modalRamo.semestreId,
          rut_estudiante: modalRamo.rutEstudiante,
          codigo_carrera: modalRamo.carreraId,
          nombre:         formRamo.nombre.trim(),
          estado:         formRamo.estado,
          comentario:     formRamo.comentario,
          intento,
          nota_final:     notaFinal,
        });
        const nuevoRamo: RamoUI = {
          id:         created.id,
          nombre:     created.nombre,
          estado:     created.estado,
          comentario: created.comentario,
          intento:    created.intento,
          nota_final: normalizarNota(created.nota_final),
        };
        setCarreras(cs => cs.map(c => c.codigo_carrera === modalRamo.carreraId ? {
          ...c,
          semestres: c.semestres.map(s => s.semestre_id === modalRamo.semestreId
            ? { ...s, soloLocal: false, ramos: [...s.ramos, nuevoRamo] }
            : s
          ),
        } : c));
      }
      setModalRamo(null);
    } catch (e: any) {
      setErrRamo(e?.message || 'Error al guardar el ramo.');
    } finally {
      setGuardandoRamo(false);
    }
  };

  const eliminarRamo = (codigo_carrera: number, semestre_id: number, ramo: RamoUI) => {
    showConfirm({
      title: 'Eliminar ramo',
      message: `¿Eliminar "${ramo.nombre}"?`,
      confirmText: 'Eliminar',
      confirmColor: 'error',
      onConfirm: async () => {
        try {
          await ramoAvanceService.remove(ramo.id);
          setCarreras(cs => cs.map(c => c.codigo_carrera === codigo_carrera ? {
            ...c,
            semestres: c.semestres.map(s => s.semestre_id === semestre_id
              ? { ...s, ramos: s.ramos.filter(r => r.id !== ramo.id) }
              : s
            ),
          } : c));
        } catch (e: any) {
          setErrorCarreras(e?.message || 'Error al eliminar el ramo.');
        }
      },
    });
  };

  // ── Datos derivados para modales ──────────────────────────────────────────
  const carreraDelSem = modalSemestre !== null
    ? carreras.find(c => c.codigo_carrera === modalSemestre) ?? null
    : null;

  const hayRegularCerrado = carreraDelSem?.semestres.some(
    s => s.tipo === 'REGULAR' && esCerrado(s.ramos)
  ) ?? false;

  const esEdicion = !!modalRamo?.editRamo;

  const univsFiltradas = universidades.filter(u =>
    u.nombre.toLowerCase().includes(busquedaUniv.toLowerCase()) ||
    u.comuna.toLowerCase().includes(busquedaUniv.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────────────────

  if (cargandoCarreras) {
    return <div className="flex justify-center py-20"><Spinner message="Cargando carreras..." /></div>;
  }

  return (
    <div>
      {/* Error global */}
      {errorCarreras && (
        <div className="mb-4">
          <Alert tipo="error" mensaje={errorCarreras} />
        </div>
      )}

      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Avance Curricular</h2>
          <p className="text-base font-medium text-gray-600 mt-1.5">
            {carreras.length === 0 ? (
              'Sin carreras registradas'
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-[#65B39B]/15 text-[#3a7a6b] rounded-full">
                  {carreras.length}
                </span>
                carrera{carreras.length > 1 ? 's' : ''} registrada{carreras.length > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={abrirModalCarrera}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#65B39B] text-white text-sm font-semibold rounded-xl hover:bg-[#4a9e87] transition-colors"
        >
          <AddIcon fontSize="small" />
          Agregar carrera
        </button>
      </div>

      {/* Estado vacío */}
      {carreras.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <p className="text-5xl mb-4">🎓</p>
          <h3 className="text-lg font-bold text-gray-700 mb-2">Sin carrera asociada</h3>
          <p className="text-base text-gray-400 mb-6">
            Agrega una carrera para comenzar a registrar el avance curricular.
          </p>
          <button
            onClick={abrirModalCarrera}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#65B39B] text-white text-sm font-semibold rounded-xl hover:bg-[#4a9e87] transition-colors"
          >
            <AddIcon fontSize="small" />
            Agregar primera carrera
          </button>
        </div>
      )}

      {/* Carreras */}
      <div className="space-y-4">
        {carreras.map(carrera => (
          <CarreraAcordeon
            key={carrera.codigo_carrera}
            carrera={carrera}
            onEliminarCarrera={() => eliminarCarrera(carrera.codigo_carrera, carrera.nombre)}
            onAgregarSemestre={() => abrirModalSemestre(carrera.codigo_carrera)}
            onCerrarSemestre={semId => cerrarSemestre(carrera.codigo_carrera, semId)}
            onEliminarSemestre={semId => eliminarSemestreLocal(carrera.codigo_carrera, semId)}
            onAgregarRamo={semId => abrirNuevoRamo(carrera.codigo_carrera, semId)}
            onEditarRamo={(semId, ramo) => abrirEditarRamo(carrera.codigo_carrera, semId, ramo)}
            onEliminarRamo={(semId, ramo) => eliminarRamo(carrera.codigo_carrera, semId, ramo)}
          />
        ))}
      </div>

      {/* ── Modal: Nueva carrera ─────────────────────────────────────────── */}
      <Modal
        titulo="Nueva carrera"
        abierto={modalCarrera}
        onCerrar={() => setModalCarrera(false)}
        tamanio="sm"
        acciones={
          <div className="flex gap-2 justify-end w-full">
            <button onClick={() => setModalCarrera(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button
              onClick={agregarCarrera}
              disabled={guardandoCarrera}
              className="px-4 py-2 text-sm rounded-lg bg-[#65B39B] text-white font-semibold hover:bg-[#4a9e87] disabled:opacity-50 transition-colors"
            >
              {guardandoCarrera ? 'Guardando…' : 'Agregar'}
            </button>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          {errCarrera && <Alert tipo="error" mensaje={errCarrera} />}

          {/* Selector de universidad con búsqueda */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">Universidad</p>
            {cargandoUniversidades ? (
              <p className="text-sm text-gray-400">Cargando universidades…</p>
            ) : (
              <>
                <input
                  type="text"
                  value={formCarrera.codigo_universidad ? formCarrera.universidad_nombre : busquedaUniv}
                  onChange={e => {
                    setBusquedaUniv(e.target.value);
                    if (formCarrera.codigo_universidad) {
                      setFormCarrera(f => ({ ...f, codigo_universidad: null, universidad_nombre: '' }));
                    }
                  }}
                  placeholder="Buscar universidad por nombre o comuna…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#65B39B]/40 focus:border-[#65B39B]"
                />
                {busquedaUniv && !formCarrera.codigo_universidad && (
                  <div className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto shadow-sm">
                    {univsFiltradas.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
                    ) : (
                      univsFiltradas.slice(0, 8).map(u => (
                        <button
                          key={u.codigo_universidad}
                          type="button"
                          onClick={() => {
                            setFormCarrera(f => ({ ...f, codigo_universidad: u.codigo_universidad, universidad_nombre: u.nombre }));
                            setBusquedaUniv('');
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-[#65B39B]/10 transition-colors"
                        >
                          <span className="font-medium text-gray-800">{u.nombre}</span>
                          <span className="text-gray-400 ml-1 text-xs">· {u.comuna}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
                {formCarrera.codigo_universidad && (
                  <p className="mt-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                    ✓ {formCarrera.universidad_nombre}
                  </p>
                )}
              </>
            )}
          </div>

          <Input
            etiqueta="Nombre de la carrera"
            valor={formCarrera.nombre}
            onChange={v => setFormCarrera(f => ({ ...f, nombre: v }))}
            placeholder="Ej: Ingeniería Civil en Informática"
          />
          <Input
            etiqueta="Duración (semestres)"
            tipo="number"
            valor={formCarrera.duracion_sem}
            onChange={v => setFormCarrera(f => ({ ...f, duracion_sem: v }))}
            placeholder="Ej: 10"
          />
          <Select
            etiqueta="Vía de acceso"
            valor={formCarrera.via_acceso}
            onChange={v => setFormCarrera(f => ({ ...f, via_acceso: v as ViaAcceso }))}
            opciones={VIA_ACCESO_OPTS.map(o => ({ valor: o.valor, etiqueta: o.etiqueta }))}
          />
        </div>
      </Modal>

      {/* ── Modal: Nuevo semestre ─────────────────────────────────────────── */}
      <Modal
        titulo="Nuevo semestre"
        abierto={modalSemestre !== null}
        onCerrar={() => setModalSemestre(null)}
        tamanio="sm"
        acciones={
          <div className="flex gap-2 justify-end w-full">
            <button onClick={() => setModalSemestre(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button
              onClick={agregarSemestre}
              disabled={guardandoSem}
              className="px-4 py-2 text-sm rounded-lg bg-[#65B39B] text-white font-semibold hover:bg-[#4a9e87] disabled:opacity-50 transition-colors"
            >
              {guardandoSem ? 'Guardando…' : 'Agregar'}
            </button>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          {errSem && <Alert tipo="error" mensaje={errSem} />}
          <Input
            etiqueta="Año"
            tipo="number"
            valor={formSem.year}
            onChange={v => setFormSem(f => ({ ...f, year: Number(v) || f.year }))}
          />
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Tipo</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="tipoSem" checked={formSem.tipo === 'REGULAR'}
                  onChange={() => setFormSem(f => ({ ...f, tipo: 'REGULAR', codigo: '1' }))}
                  className="accent-[#65B39B] w-4 h-4"
                />
                <span className="text-sm text-gray-700">Regular</span>
              </label>
              <label className={`flex items-center gap-2 ${!hayRegularCerrado ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                <input type="radio" name="tipoSem" checked={formSem.tipo === 'RECUPERATIVO'}
                  disabled={!hayRegularCerrado}
                  onChange={() => setFormSem(f => ({ ...f, tipo: 'RECUPERATIVO', codigo: 'INVIERNO' }))}
                  className="accent-[#65B39B] w-4 h-4"
                />
                <span className="text-sm text-gray-700">Recuperativo</span>
              </label>
            </div>
            {!hayRegularCerrado && (
              <p className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Requiere al menos un semestre regular cerrado.
              </p>
            )}
          </div>
          {formSem.tipo === 'REGULAR' && (
            <Select
              etiqueta="Semestre"
              valor={formSem.codigo}
              onChange={v => setFormSem(f => ({ ...f, codigo: v as '1' | '2' }))}
              opciones={[
                { valor: '1', etiqueta: 'Primer semestre' },
                { valor: '2', etiqueta: 'Segundo semestre' },
              ]}
            />
          )}
          {formSem.tipo === 'RECUPERATIVO' && (
            <Select
              etiqueta="Período"
              valor={formSem.codigo}
              onChange={v => setFormSem(f => ({ ...f, codigo: v as 'INVIERNO' | 'VERANO' }))}
              opciones={[
                { valor: 'INVIERNO', etiqueta: 'Invierno' },
                { valor: 'VERANO',   etiqueta: 'Verano'   },
              ]}
            />
          )}
        </div>
      </Modal>

      {/* ── Modal: Crear / editar ramo ────────────────────────────────────── */}
      <Modal
        titulo={esEdicion ? 'Editar ramo' : 'Nuevo ramo'}
        abierto={modalRamo !== null}
        onCerrar={() => setModalRamo(null)}
        tamanio="sm"
        acciones={
          <div className="flex gap-2 justify-end w-full">
            <button onClick={() => setModalRamo(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button
              onClick={guardarRamo}
              disabled={guardandoRamo}
              className="px-4 py-2 text-sm rounded-lg bg-[#65B39B] text-white font-semibold hover:bg-[#4a9e87] disabled:opacity-50 transition-colors"
            >
              {guardandoRamo ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Agregar ramo'}
            </button>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          {errRamo && <Alert tipo="error" mensaje={errRamo} />}
          <Input
            etiqueta="Nombre del ramo"
            valor={formRamo.nombre}
            onChange={v => setFormRamo(f => ({ ...f, nombre: v }))}
            placeholder="Ej: Cálculo I"
          />
          <Select
            etiqueta="Estado"
            valor={formRamo.estado}
            onChange={v => setFormRamo(f => ({ ...f, estado: v as EstadoRamoAvance }))}
            opciones={ESTADO_RAMO_OPTS.map(o => ({ valor: o.valor, etiqueta: o.etiqueta }))}
          />
          <Input
            etiqueta="Intento"
            tipo="number"
            valor={formRamo.intento}
            onChange={v => setFormRamo(f => ({ ...f, intento: v }))}
            ayuda="Número de veces que se ha cursado este ramo"
          />
          <Input
            etiqueta="Nota final (opcional)"
            tipo="number"
            valor={formRamo.estado === 'ELIMINADO' ? '' : formRamo.nota_final}
            onChange={v => setFormRamo(f => ({ ...f, nota_final: v }))}
            placeholder={formRamo.estado === 'ELIMINADO' ? 'No aplica para ramos eliminados' : 'Ej: 5.5'}
            ayuda={formRamo.estado === 'ELIMINADO' ? undefined : 'Ingresa la nota final entre 1.0 y 7.0. Déjalo vacío si aún no tiene nota.'}
            inputProps={{ step: 0.1, min: 1, max: 7 }}
            deshabilitado={formRamo.estado === 'ELIMINADO'}
          />
          <Input
            etiqueta="Comentario (opcional)"
            valor={formRamo.comentario}
            onChange={v => setFormRamo(f => ({ ...f, comentario: v }))}
            placeholder="Observaciones sobre el ramo"
          />
        </div>
      </Modal>

      <ConfirmDialog />
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

interface CarreraAcordeonProps {
  carrera: CarreraUI;
  onEliminarCarrera: () => void;
  onAgregarSemestre: () => void;
  onCerrarSemestre: (semId: number) => void;
  onEliminarSemestre: (semId: number) => void;
  onAgregarRamo: (semId: number) => void;
  onEditarRamo: (semId: number, ramo: RamoUI) => void;
  onEliminarRamo: (semId: number, ramo: RamoUI) => void;
}

function CarreraAcordeon({
  carrera, onEliminarCarrera, onAgregarSemestre,
  onCerrarSemestre, onEliminarSemestre, onAgregarRamo, onEditarRamo, onEliminarRamo,
}: CarreraAcordeonProps) {
  const [expandido, setExpandido] = useState(false);

  const ultimoSem = carrera.semestres.at(-1) ?? null;
  // Bloquear si está cargando O si el último semestre no está cerrado
  const puedeAgregarSem = !carrera.cargando && (!ultimoSem || esCerrado(ultimoSem.ramos) || ultimoSem.soloLocal);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Cabecera del acordeón */}
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer select-none hover:bg-gray-50 transition-colors"
        onClick={() => setExpandido(e => !e)}
      >
        <div className="flex items-center gap-3 min-w-0">
          {expandido
            ? <ExpandLessIcon sx={{ fontSize: 20, color: '#9ca3af', flexShrink: 0 }} />
            : <ExpandMoreIcon sx={{ fontSize: 20, color: '#9ca3af', flexShrink: 0 }} />}
          <SchoolIcon sx={{ color: '#65B39B', fontSize: 22, flexShrink: 0 }} />
          <div className="min-w-0">
            <p className="text-base font-bold text-gray-800 truncate">{carrera.nombre}</p>
            <p className="text-base text-gray-400 truncate">
              {carrera.via_acceso} · {carrera.duracion_sem} semestres
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4" onClick={e => e.stopPropagation()}>
          <button
            onClick={onAgregarSemestre}
            disabled={!puedeAgregarSem}
            title={
              carrera.cargando
                ? 'Espera mientras se cargan los datos'
                : !puedeAgregarSem
                  ? 'Cierra el semestre actual antes de agregar uno nuevo'
                  : undefined
            }
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-[#65B39B] text-white hover:bg-[#4a9e87] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <AddIcon sx={{ fontSize: 16 }} />
            {carrera.cargando ? 'Cargando…' : 'Nuevo semestre'}
          </button>
          <button
            onClick={onEliminarCarrera}
            title="Eliminar carrera"
            className="p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
          >
            <DeleteIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      </div>

      {/* Contenido */}
      {expandido && (
        <div className="border-t border-gray-100 px-6 py-5">
          {carrera.cargando && (
            <div className="flex justify-center py-8">
              <Spinner message="Cargando semestres…" />
            </div>
          )}

          {carrera.error && (
            <Alert tipo="error" mensaje={carrera.error} />
          )}

          {!carrera.cargando && !carrera.error && (
            <>
              {!puedeAgregarSem && ultimoSem && (
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
                  <span>⚠️</span>
                  <span>
                    Cierra <strong>{semLabel(ultimoSem.year, ultimoSem.tipo, ultimoSem.codigo)}</strong> antes de agregar el siguiente semestre.
                  </span>
                </div>
              )}

              {carrera.semestres.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
                  <p className="text-base text-gray-400 mb-4">Esta carrera no tiene semestres registrados aún.</p>
                  <button
                    onClick={onAgregarSemestre}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#65B39B] border border-[#65B39B]/40 rounded-lg hover:bg-[#65B39B]/5 transition-colors"
                  >
                    <AddIcon sx={{ fontSize: 16 }} />
                    Agregar primer semestre
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto pb-2">
                  <div className="flex gap-5" style={{ minWidth: 'max-content' }}>
                    {carrera.semestres.map(sem => (
                      <SemestreColumna
                        key={sem.semestre_id}
                        semestre={sem}
                        onCerrar={() => onCerrarSemestre(sem.semestre_id)}
                        onEliminar={() => onEliminarSemestre(sem.semestre_id)}
                        onAgregarRamo={() => onAgregarRamo(sem.semestre_id)}
                        onEditarRamo={ramo => onEditarRamo(sem.semestre_id, ramo)}
                        onEliminarRamo={ramo => onEliminarRamo(sem.semestre_id, ramo)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface SemestreColumnaProps {
  semestre: SemestreUI;
  onCerrar: () => void;
  onEliminar: () => void;
  onAgregarRamo: () => void;
  onEditarRamo: (ramo: RamoUI) => void;
  onEliminarRamo: (ramo: RamoUI) => void;
}

function SemestreColumna({ semestre, onCerrar, onEliminar, onAgregarRamo, onEditarRamo, onEliminarRamo }: SemestreColumnaProps) {
  const cerrado = esCerrado(semestre.ramos);
  const ramoLimitAlcanzado = semestre.tipo === 'RECUPERATIVO' && semestre.ramos.length >= 1;
  const todosConNota = semestre.ramos.length > 0
    && semestre.ramos.every(r => r.estado === 'ELIMINADO' || r.nota_final !== null);
  const puedesCerrar = semestre.ramos.length > 0 && todosConNota;
  const tooltipCierre = semestre.ramos.length === 0
    ? 'Agrega al menos un ramo'
    : !todosConNota
      ? 'Todos los ramos deben tener nota final'
      : undefined;

  return (
    <div className={`w-64 flex-none flex flex-col rounded-xl border-2 overflow-hidden transition-colors ${cerrado ? 'border-green-200' : 'border-gray-200'}`}>
      {/* Encabezado */}
      <div className={`px-4 py-3 flex items-center justify-between ${cerrado ? 'bg-green-50' : 'bg-gray-50'}`}>
        <div>
          <p className="text-base font-bold text-gray-800">
            {semLabel(semestre.year, semestre.tipo, semestre.codigo)}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {semestre.tipo === 'RECUPERATIVO' && (
              <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">
                Recuperativo
              </span>
            )}
            <span className={`text-xs font-semibold ${cerrado ? 'text-green-600' : 'text-gray-400'}`}>
              {cerrado ? '✓ Cerrado' : semestre.soloLocal ? 'Nuevo' : 'Abierto'}
            </span>
          </div>
        </div>
        <button onClick={onEliminar} title="Eliminar semestre"
          className="p-1 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
        >
          <DeleteIcon sx={{ fontSize: 16 }} />
        </button>
      </div>

      {/* Ramos */}
      <div className="flex-1 p-3 space-y-2">
        {semestre.ramos.length === 0
          ? <p className="text-sm text-gray-400 text-center py-4">Sin ramos registrados</p>
          : semestre.ramos.map(ramo => (
              <RamoCard
                key={ramo.id}
                ramo={ramo}
                semAbierto={!cerrado}
                onEditar={() => onEditarRamo(ramo)}
                onEliminar={() => onEliminarRamo(ramo)}
              />
            ))
        }
      </div>

      {/* Acciones (solo semestre abierto) */}
      {!cerrado && (
        <div className="px-3 pb-3 pt-2 border-t border-gray-100 space-y-2">
          {!ramoLimitAlcanzado ? (
            <button
              onClick={onAgregarRamo}
              className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-semibold text-[#65B39B] hover:bg-[#65B39B]/8 rounded-lg transition-colors"
            >
              <AddIcon sx={{ fontSize: 16 }} />
              Agregar ramo
            </button>
          ) : (
            <p className="text-sm text-center text-gray-400 py-1">Límite: 1 ramo por recuperativo</p>
          )}
          <button
            onClick={onCerrar}
            disabled={!puedesCerrar}
            title={tooltipCierre}
            className="flex items-center justify-center gap-2 w-full py-2 text-sm font-semibold rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <LockIcon sx={{ fontSize: 15 }} />
            Cerrar semestre
          </button>
          {tooltipCierre && (
            <p className="text-xs text-center text-amber-600 leading-snug">{tooltipCierre}</p>
          )}
        </div>
      )}
    </div>
  );
}

interface RamoCardProps {
  ramo: RamoUI;
  semAbierto: boolean;
  onEditar: () => void;
  onEliminar: () => void;
}

function RamoCard({ ramo, semAbierto, onEditar, onEliminar }: RamoCardProps) {
  const chip = ESTADO_CHIP[ramo.estado];
  const notaColor = ramo.nota_final === null
    ? 'text-gray-300'
    : ramo.nota_final >= 4 ? 'text-green-600' : 'text-red-500';

  return (
    <div
      onDoubleClick={semAbierto ? onEditar : undefined}
      title={semAbierto ? 'Doble clic para editar' : undefined}
      className={`
        rounded-xl border bg-white px-3 py-2.5 group transition-all
        ${semAbierto
          ? 'border-gray-200 cursor-pointer hover:border-[#65B39B] hover:shadow-sm hover:bg-[#65B39B]/5'
          : 'border-gray-100 cursor-default'}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-base font-semibold text-gray-800 leading-snug break-words flex-1">
          {ramo.nombre}
        </span>
        {semAbierto && (
          <button
            onClick={e => { e.stopPropagation(); onEliminar(); }}
            title="Eliminar ramo"
            className="shrink-0 p-0.5 text-gray-200 hover:text-red-400 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
          >
            <DeleteIcon sx={{ fontSize: 15 }} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2">
        <span className={`text-lg font-bold tabular-nums leading-none ${notaColor}`}>
          {ramo.nota_final !== null ? ramo.nota_final.toFixed(1) : '—'}
        </span>
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${chip.bg} ${chip.text}`}>
          {chip.label}
        </span>
        {ramo.intento > 1 && (
          <span className="text-sm text-gray-400">· {ramo.intento}° intento</span>
        )}
      </div>

      {semAbierto && (
        <p className="text-xs text-[#65B39B] mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          Doble clic para editar
        </p>
      )}
    </div>
  );
}
