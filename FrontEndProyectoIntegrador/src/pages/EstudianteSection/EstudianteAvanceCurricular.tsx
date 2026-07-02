import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Add as AddIcon } from '@mui/icons-material';
import { Alert } from '../../components/ui';
import { Spinner } from '../../components/ui';
import { useConfirmDialog } from '../../components/ui';
import { useAuthContext } from '../../context/AuthContext';
import PermissionService from '../../services/permissionService';
import type { EstudianteOutletContext } from './EstudianteDetail';
import {
  universidadService,
  carreraAvanceService,
  semestreAvanceService,
  ramoAvanceService,
  historialEstadoCarreraService,
} from '../../services';
import type { EstadoEstudiante } from '../../types';
import type { UniversidadDto } from '../../services/universidad.service';
import type { CreateCarreraAvanceDto, ViaAcceso } from '../../services/carrera-avance.service';
import type { SemestreDto, CreateSemestreDto } from '../../services/semestre-avance.service';
import type { EstadoRamoAvance } from '../../services/ramo-avance.service';
import type { CarreraUI, RamoUI, SemestreUI } from '../../components/features/estudiante-detalles/avance-curricular';
import {
  UI_TO_BACKEND, BACKEND_TO_UI, ORDEN_SEMESTRE,
  normalizarNota, esCerrado,
  CarreraAcordeon,
  ModalCarrera, type FormCarrera,
  ModalSemestre, type FormSemestre,
  ModalRamo, type FormRamo,
} from '../../components/features/estudiante-detalles/avance-curricular';

export default function EstudianteAvanceCurricular() {
  const { estudiante, canEdit } = useOutletContext<EstudianteOutletContext>();
  const { usuario } = useAuthContext();
  const canAdmin = PermissionService.isAdmin(usuario);
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
  const [formCarrera, setFormCarrera] = useState<FormCarrera>({
    nombre: '', codigo_universidad: null, universidad_nombre: '', duracion_sem: '8', via_acceso: 'REGULAR' as ViaAcceso, anio_ingreso: '',
  });
  const [errCarrera, setErrCarrera] = useState('');
  const [guardandoCarrera, setGuardandoCarrera] = useState(false);

  // ── Modal: Nuevo semestre ─────────────────────────────────────────────────
  const [modalSemestre, setModalSemestre] = useState<number | null>(null);
  const [todosLosSemestres, setTodosLosSemestres] = useState<SemestreDto[]>([]);
  const [formSem, setFormSem] = useState<FormSemestre>({
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
  const [formRamo, setFormRamo] = useState<FormRamo>({
    nombre: '', estado: 'CURSANDO', comentario: '', intento: '1', nota_final: '',
  });
  const [errRamo, setErrRamo] = useState('');
  const [guardandoRamo, setGuardandoRamo] = useState(false);

  // ── Cargar historial de una carrera ───────────────────────────────────────
  const cargarHistorial = useCallback(async (codigo_carrera: number) => {
    setCarreras(cs => cs.map(c => c.codigo_carrera === codigo_carrera
      ? { ...c, historialCargando: true }
      : c
    ));
    try {
      const historial = await historialEstadoCarreraService.getByCarrera(codigo_carrera);
      setCarreras(cs => cs.map(c => c.codigo_carrera === codigo_carrera
        ? { ...c, historial, historialCargando: false }
        : c
      ));
    } catch {
      setCarreras(cs => cs.map(c => c.codigo_carrera === codigo_carrera
        ? { ...c, historialCargando: false }
        : c
      ));
    }
  }, []);

  // ── Cargar semestres de una carrera ───────────────────────────────────────
  const cargarSemestres = useCallback(async (codigo_carrera: number) => {
    setCarreras(cs => cs.map(c => c.codigo_carrera === codigo_carrera
      ? { ...c, cargando: true, error: null }
      : c
    ));
    try {
      const [ramos, linkedSemestres] = await Promise.all([
        ramoAvanceService.getByCarrera(codigo_carrera),
        semestreAvanceService.getByCarrera(codigo_carrera),
      ]);

      const semestresMap = new Map<number, SemestreUI>();

      for (const s of linkedSemestres) {
        semestresMap.set(s.semestre_id, {
          semestre_id: s.semestre_id,
          year:        s.year,
          codigo:      BACKEND_TO_UI[s.semestre as keyof typeof BACKEND_TO_UI],
          tipo:        s.tipo as SemestreUI['tipo'],
          ramos:       [],
          soloLocal:   false,
        });
      }

      for (const r of ramos) {
        const { semestre_id, year, semestre, tipo } = r.semestre;
        if (!semestresMap.has(semestre_id)) {
          semestresMap.set(semestre_id, {
            semestre_id, year,
            codigo: BACKEND_TO_UI[semestre],
            tipo,
            ramos: [],
            soloLocal: false,
          });
        }
        semestresMap.get(semestre_id)!.ramos.push({
          id:              r.id,
          nombre:          r.nombre,
          estado:          r.estado,
          comentario:      r.comentario,
          intento:         r.intento,
          nota_final:      normalizarNota(r.nota_final),
          url_certificado: r.url_certificado ?? null,
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

  // ── Carga inicial ─────────────────────────────────────────────────────────
  const cargarCarreras = useCallback(async () => {
    setCargandoCarreras(true);
    setErrorCarreras(null);
    try {
      const data = await carreraAvanceService.getByEstudiante(rut);
      setCarreras(data.map(c => ({ ...c, semestres: [], cargando: true, error: null, historial: [], historialCargando: true })));
      data.forEach(c => {
        cargarSemestres(c.codigo_carrera);
        cargarHistorial(c.codigo_carrera);
      });
    } catch {
      setErrorCarreras('No se pudieron cargar las carreras. Intenta de nuevo.');
    } finally {
      setCargandoCarreras(false);
    }
  }, [rut, cargarSemestres, cargarHistorial]);

  useEffect(() => { cargarCarreras(); }, [cargarCarreras]);

  // ── Carrera: crear ────────────────────────────────────────────────────────
  const abrirModalCarrera = () => {
    setFormCarrera({ nombre: '', codigo_universidad: null, universidad_nombre: '', duracion_sem: '8', via_acceso: 'REGULAR', anio_ingreso: '' });
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

    const anioActual = new Date().getFullYear();
    const anio_ingreso = formCarrera.anio_ingreso.trim() ? parseInt(formCarrera.anio_ingreso, 10) : anioActual;
    if (isNaN(anio_ingreso) || anio_ingreso < 1990 || anio_ingreso > 2100) {
      setErrCarrera('El año de ingreso debe estar entre 1990 y 2100');
      return;
    }

    setGuardandoCarrera(true);
    setErrCarrera('');
    try {
      const payload: CreateCarreraAvanceDto = {
        nombre:             formCarrera.nombre.trim(),
        rut_estudiante:     rut,
        duracion_sem:       dur,
        codigo_universidad: formCarrera.codigo_universidad,
        via_acceso:         formCarrera.via_acceso,
        anio_ingreso,
      };
      const nueva = await carreraAvanceService.create(payload);
      setCarreras(cs => [...cs, { ...nueva, semestres: [], cargando: false, error: null, historial: [], historialCargando: true }]);
      cargarHistorial(nueva.codigo_carrera);
      setModalCarrera(false);
    } catch (e: unknown) {
      setErrCarrera(e instanceof Error ? e.message : 'Error al crear la carrera.');
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
        } catch (e: unknown) {
          setErrorCarreras(e instanceof Error ? e.message : 'Error al eliminar la carrera.');
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
      } catch { /* continúa; el backend maneja find-or-create */ }
    }
  };

  const agregarSemestre = async () => {
    if (modalSemestre === null) return;
    const carrera = carreras.find(c => c.codigo_carrera === modalSemestre);
    if (!carrera) return;

    const backendCodigo = UI_TO_BACKEND[formSem.codigo];

    if (formSem.tipo === 'RECUPERATIVO') {
      const hayRegularCerrado = carrera.semestres.some(s => s.tipo === 'REGULAR' && esCerrado(s.ramos));
      if (!hayRegularCerrado) {
        setErrSem('Se requiere al menos un semestre regular cerrado para agregar uno recuperativo.');
        return;
      }
    }

    const duplicadoLocal = carrera.semestres.some(s => s.year === formSem.year && s.codigo === formSem.codigo);
    if (duplicadoLocal) {
      setErrSem(`Ya existe ${formSem.year} — Semestre ${formSem.codigo} en esta carrera.`);
      return;
    }

    setGuardandoSem(true);
    setErrSem('');
    try {
      let semestre = todosLosSemestres.find(
        s => s.year === formSem.year && s.semestre === backendCodigo && s.tipo === formSem.tipo
      );
      if (!semestre) {
        const payload: CreateSemestreDto = { year: formSem.year, semestre: backendCodigo, tipo: formSem.tipo };
        semestre = await semestreAvanceService.create(payload);
        setTodosLosSemestres(prev => [...prev, semestre!]);
      }
      await semestreAvanceService.linkCarrera(semestre.semestre_id, modalSemestre);

      const nuevoSem: SemestreUI = {
        semestre_id: semestre.semestre_id,
        year:        formSem.year,
        codigo:      formSem.codigo,
        tipo:        formSem.tipo,
        ramos:       [],
        soloLocal:   false,
      };
      setCarreras(cs => cs.map(c => c.codigo_carrera === modalSemestre
        ? { ...c, semestres: [...c.semestres, nuevoSem] }
        : c
      ));
      setModalSemestre(null);
    } catch (e: unknown) {
      setErrSem(e instanceof Error ? e.message : 'Error al crear el semestre.');
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
          await Promise.all([
            ...sem.ramos.map(r => ramoAvanceService.remove(r.id)),
            semestreAvanceService.unlinkCarrera(semestre_id, codigo_carrera),
          ]);
          setCarreras(cs => cs.map(c => c.codigo_carrera === codigo_carrera
            ? { ...c, semestres: c.semestres.filter(s => s.semestre_id !== semestre_id) }
            : c
          ));
        } catch (e: unknown) {
          setErrorCarreras(e instanceof Error ? e.message : 'Error al eliminar el semestre.');
        }
      },
    });
  };

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
            id: r.id, estado: nuevoEstado, res,
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
    } catch (e: unknown) {
      setErrorCarreras(e instanceof Error ? e.message : 'Error al cerrar el semestre.');
    }
  };

  // ── Ramo: crear / editar / eliminar ───────────────────────────────────────
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

    let notaFinal: number | null = null;
    if (formRamo.estado !== 'ELIMINADO' && formRamo.nota_final.trim() !== '') {
      notaFinal = Number(formRamo.nota_final.replace(',', '.'));
      if (isNaN(notaFinal) || notaFinal < 1 || notaFinal > 7) {
        setErrRamo('La nota final debe ser un número entre 1.0 y 7.0');
        return;
      }
      notaFinal = Math.round(notaFinal * 10) / 10;
    }

    const carreraUI = carreras.find(c => c.codigo_carrera === modalRamo.carreraId);
    const semUI     = carreraUI?.semestres.find(s => s.semestre_id === modalRamo.semestreId);
    if (semUI?.tipo === 'RECUPERATIVO' && !modalRamo.editRamo && (semUI?.ramos.length ?? 0) >= 1) {
      setErrRamo('Los semestres recuperativos solo pueden contener un ramo.');
      return;
    }

    setGuardandoRamo(true);
    setErrRamo('');
    try {
      if (modalRamo.editRamo) {
        const updated = await ramoAvanceService.update(modalRamo.editRamo.id, {
          nombre: formRamo.nombre.trim(), estado: formRamo.estado,
          comentario: formRamo.comentario, intento, nota_final: notaFinal,
        });
        setCarreras(cs => cs.map(c => c.codigo_carrera === modalRamo.carreraId ? {
          ...c,
          semestres: c.semestres.map(s => s.semestre_id === modalRamo.semestreId ? {
            ...s,
            ramos: s.ramos.map(r => r.id === modalRamo.editRamo!.id
              ? { ...r, nombre: updated.nombre, estado: updated.estado, comentario: updated.comentario, intento: updated.intento, nota_final: normalizarNota(updated.nota_final), url_certificado: r.url_certificado }
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
          id:              created.id,
          nombre:          created.nombre,
          estado:          created.estado,
          comentario:      created.comentario,
          intento:         created.intento,
          nota_final:      normalizarNota(created.nota_final),
          url_certificado: created.url_certificado ?? null,
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
    } catch (e: unknown) {
      setErrRamo(e instanceof Error ? e.message : 'Error al guardar el ramo.');
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
        } catch (e: unknown) {
          setErrorCarreras(e instanceof Error ? e.message : 'Error al eliminar el ramo.');
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

  // ─────────────────────────────────────────────────────────────────────────

  if (!canEdit && !canAdmin) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-4xl mb-3">🔒</p>
        <h2 className="text-lg font-bold text-gray-700">Acceso restringido</h2>
        <p className="text-gray-400 mt-2">Solo administradores y tutores pueden ver el avance curricular.</p>
      </div>
    );
  }

  if (cargandoCarreras) {
    return <div className="flex justify-center py-20"><Spinner message="Cargando carreras..." /></div>;
  }

  return (
    <div>
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
        {canEdit && (
          <button
            onClick={abrirModalCarrera}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#65B39B] text-white text-sm font-semibold rounded-xl hover:bg-[#4a9e87] transition-colors"
          >
            <AddIcon fontSize="small" />
            Agregar carrera
          </button>
        )}
      </div>

      {/* Estado vacío */}
      {carreras.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <p className="text-5xl mb-4">🎓</p>
          <h3 className="text-lg font-bold text-gray-700 mb-2">Sin carrera asociada</h3>
          <p className="text-base text-gray-400 mb-6">
            {canEdit
              ? 'Agrega una carrera para comenzar a registrar el avance curricular.'
              : 'No hay carreras registradas para este estudiante.'}
          </p>
          {canEdit && (
            <button
              onClick={abrirModalCarrera}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#65B39B] text-white text-sm font-semibold rounded-xl hover:bg-[#4a9e87] transition-colors"
            >
              <AddIcon fontSize="small" />
              Agregar primera carrera
            </button>
          )}
        </div>
      )}

      {/* Carreras */}
      <div className="space-y-4">
        {carreras.map(carrera => (
          <CarreraAcordeon
            key={carrera.codigo_carrera}
            carrera={carrera}
            canEdit={canEdit}
            canAdmin={canAdmin}
            onEliminarCarrera={() => eliminarCarrera(carrera.codigo_carrera, carrera.nombre)}
            onAgregarSemestre={() => abrirModalSemestre(carrera.codigo_carrera)}
            onCerrarSemestre={semId => cerrarSemestre(carrera.codigo_carrera, semId)}
            onEliminarSemestre={semId => eliminarSemestreLocal(carrera.codigo_carrera, semId)}
            onAgregarRamo={semId => abrirNuevoRamo(carrera.codigo_carrera, semId)}
            onEditarRamo={(semId, ramo) => abrirEditarRamo(carrera.codigo_carrera, semId, ramo)}
            onEliminarRamo={(semId, ramo) => eliminarRamo(carrera.codigo_carrera, semId, ramo)}
            onEstadoCambiado={(nuevoEstado: EstadoEstudiante) => {
              setCarreras(cs => cs.map(c => c.codigo_carrera === carrera.codigo_carrera
                ? { ...c, estado: nuevoEstado }
                : c
              ));
              cargarHistorial(carrera.codigo_carrera);
            }}
          />
        ))}
      </div>

      <ModalCarrera
        abierto={modalCarrera}
        onCerrar={() => setModalCarrera(false)}
        form={formCarrera}
        setForm={setFormCarrera}
        universidades={universidades}
        cargandoUniversidades={cargandoUniversidades}
        busquedaUniv={busquedaUniv}
        setBusquedaUniv={setBusquedaUniv}
        error={errCarrera}
        guardando={guardandoCarrera}
        onGuardar={agregarCarrera}
      />

      <ModalSemestre
        abierto={modalSemestre !== null}
        onCerrar={() => setModalSemestre(null)}
        form={formSem}
        setForm={setFormSem}
        hayRegularCerrado={hayRegularCerrado}
        error={errSem}
        guardando={guardandoSem}
        onGuardar={agregarSemestre}
      />

      <ModalRamo
        abierto={modalRamo !== null}
        esEdicion={!!modalRamo?.editRamo}
        onCerrar={() => setModalRamo(null)}
        form={formRamo}
        setForm={setFormRamo}
        error={errRamo}
        guardando={guardandoRamo}
        onGuardar={guardarRamo}
      />

      <ConfirmDialog />
    </div>
  );
}
