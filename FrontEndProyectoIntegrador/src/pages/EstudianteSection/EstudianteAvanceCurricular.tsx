import { useState } from 'react';
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

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TipoSem    = 'REGULAR' | 'RECUPERATIVO';
type CodigoSem  = '1' | '2' | 'INVIERNO' | 'VERANO';
type EstadoRamo = 'APROBADO' | 'REPROBADO' | 'CURSANDO' | 'ELIMINADO';

interface RamoMock {
  id: number;
  nombre: string;
  nota_final: number | null;
  estado: EstadoRamo;
}

interface SemestreMock {
  id: number;
  year: number;
  codigo: CodigoSem;
  tipo: TipoSem;
  ramos: RamoMock[];
  cerrado: boolean;
}

interface CarreraMock {
  id: number;
  nombre: string;
  universidad: string;
  semestres: SemestreMock[];
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const UNIVERSIDADES_MOCK = [
  'Universidad Católica del Norte',
  'Universidad de Chile',
  'Universidad de Concepción',
  'Universidad Técnica Federico Santa María',
  'Universidad de Santiago de Chile',
  'Pontificia Universidad Católica de Chile',
  'Otra',
];

const ESTADO_RAMO_OPTS: { valor: EstadoRamo; etiqueta: string }[] = [
  { valor: 'APROBADO',  etiqueta: 'Aprobado'  },
  { valor: 'REPROBADO', etiqueta: 'Reprobado' },
  { valor: 'CURSANDO',  etiqueta: 'Cursando'  },
  { valor: 'ELIMINADO', etiqueta: 'Eliminado' },
];

const ESTADO_CHIP: Record<EstadoRamo, { bg: string; text: string; label: string }> = {
  APROBADO:  { bg: 'bg-green-100', text: 'text-green-700', label: 'Aprobado'  },
  REPROBADO: { bg: 'bg-red-100',   text: 'text-red-700',   label: 'Reprobado' },
  CURSANDO:  { bg: 'bg-blue-100',  text: 'text-blue-700',  label: 'Cursando'  },
  ELIMINADO: { bg: 'bg-gray-100',  text: 'text-gray-500',  label: 'Eliminado' },
};

let _uid = 1;
const uid = () => _uid++;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function semLabel(s: SemestreMock): string {
  if (s.tipo === 'REGULAR') return `${s.year} — Semestre ${s.codigo}`;
  return `${s.year} — Rec. ${s.codigo === 'INVIERNO' ? 'Invierno' : 'Verano'}`;
}

function resolverEstado(nota: number | null, estadoActual: EstadoRamo): EstadoRamo {
  if (estadoActual !== 'CURSANDO' || nota === null) return estadoActual;
  return nota >= 4 ? 'APROBADO' : 'REPROBADO';
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function EstudianteAvanceCurricular() {
  const [carreras, setCarreras] = useState<CarreraMock[]>([]);
  const { showConfirm, ConfirmDialog } = useConfirmDialog();

  // Modal: Nueva carrera
  const [modalCarrera, setModalCarrera] = useState(false);
  const [formCarrera, setFormCarrera] = useState({ nombre: '', universidad: '' });
  const [errCarrera, setErrCarrera] = useState('');

  // Modal: Nuevo semestre
  const [modalSemestre, setModalSemestre] = useState<number | null>(null);
  const [formSem, setFormSem] = useState<{ year: number; tipo: TipoSem; codigo: CodigoSem }>({
    year: new Date().getFullYear(), tipo: 'REGULAR', codigo: '1',
  });
  const [errSem, setErrSem] = useState('');

  // Modal: Crear / editar ramo
  const [modalRamo, setModalRamo] = useState<{ carreraId: number; semestreId: number; editRamoId?: number } | null>(null);
  const [formRamo, setFormRamo] = useState({ nombre: '', nota_final: '', estado: 'CURSANDO' as EstadoRamo });
  const [errRamo, setErrRamo] = useState('');

  // ── Carrera ───────────────────────────────────────────────────────────────
  const abrirModalCarrera = () => {
    setFormCarrera({ nombre: '', universidad: '' });
    setErrCarrera('');
    setModalCarrera(true);
  };

  const agregarCarrera = () => {
    if (!formCarrera.universidad)   { setErrCarrera('Selecciona una universidad'); return; }
    if (!formCarrera.nombre.trim()) { setErrCarrera('El nombre de la carrera es requerido'); return; }
    setCarreras(cs => [...cs, { id: uid(), nombre: formCarrera.nombre.trim(), universidad: formCarrera.universidad, semestres: [] }]);
    setModalCarrera(false);
  };

  const eliminarCarrera = (id: number) => {
    showConfirm({
      title: 'Eliminar carrera',
      message: 'Se eliminarán todos los semestres y ramos asociados.',
      confirmText: 'Eliminar',
      confirmColor: 'error',
      onConfirm: () => setCarreras(cs => cs.filter(c => c.id !== id)),
    });
  };

  // ── Semestre ──────────────────────────────────────────────────────────────
  const abrirModalSemestre = (carreraId: number) => {
    setFormSem({ year: new Date().getFullYear(), tipo: 'REGULAR', codigo: '1' });
    setErrSem('');
    setModalSemestre(carreraId);
  };

  const agregarSemestre = () => {
    if (modalSemestre === null) return;
    const carrera = carreras.find(c => c.id === modalSemestre);
    if (!carrera) return;
    if (formSem.tipo === 'RECUPERATIVO' && !carrera.semestres.some(s => s.tipo === 'REGULAR' && s.cerrado)) {
      setErrSem('Se requiere al menos un semestre regular cerrado para agregar uno recuperativo.');
      return;
    }
    const duplicado = carrera.semestres.some(s => s.year === formSem.year && s.codigo === formSem.codigo);
    if (duplicado) {
      const label = formSem.tipo === 'REGULAR'
        ? `Semestre ${formSem.codigo} de ${formSem.year}`
        : `Recuperativo de ${formSem.codigo === 'INVIERNO' ? 'Invierno' : 'Verano'} ${formSem.year}`;
      setErrSem(`Ya existe el ${label} en esta carrera.`);
      return;
    }
    setCarreras(cs => cs.map(c => c.id === modalSemestre
      ? { ...c, semestres: [...c.semestres, { id: uid(), year: formSem.year, codigo: formSem.codigo, tipo: formSem.tipo, ramos: [], cerrado: false }] }
      : c
    ));
    setModalSemestre(null);
  };

  const cerrarSemestre = (carreraId: number, semestreId: number) => {
    setCarreras(cs => cs.map(c => c.id === carreraId ? {
      ...c,
      semestres: c.semestres.map(s => s.id === semestreId ? {
        ...s,
        cerrado: true,
        ramos: s.ramos.map(r => ({ ...r, estado: resolverEstado(r.nota_final, r.estado) })),
      } : s),
    } : c));
  };

  const eliminarSemestre = (carreraId: number, semestreId: number) => {
    showConfirm({
      title: 'Eliminar semestre',
      message: 'Se eliminarán todos los ramos asociados.',
      confirmText: 'Eliminar',
      confirmColor: 'error',
      onConfirm: () => setCarreras(cs => cs.map(c => c.id === carreraId
        ? { ...c, semestres: c.semestres.filter(s => s.id !== semestreId) }
        : c
      )),
    });
  };

  // ── Ramo ──────────────────────────────────────────────────────────────────
  const abrirNuevoRamo = (carreraId: number, semestreId: number) => {
    setFormRamo({ nombre: '', nota_final: '', estado: 'CURSANDO' });
    setErrRamo('');
    setModalRamo({ carreraId, semestreId });
  };

  const abrirEditarRamo = (carreraId: number, semestreId: number, ramo: RamoMock) => {
    setFormRamo({ nombre: ramo.nombre, nota_final: ramo.nota_final !== null ? String(ramo.nota_final) : '', estado: ramo.estado });
    setErrRamo('');
    setModalRamo({ carreraId, semestreId, editRamoId: ramo.id });
  };

  const guardarRamo = () => {
    if (!modalRamo) return;
    if (!formRamo.nombre.trim()) { setErrRamo('El nombre del ramo es requerido'); return; }
    const nota = formRamo.nota_final !== '' ? parseFloat(formRamo.nota_final) : null;
    if (nota !== null && (isNaN(nota) || nota < 1 || nota > 7)) { setErrRamo('La nota debe estar entre 1.0 y 7.0'); return; }

    if (modalRamo.editRamoId !== undefined) {
      const rid = modalRamo.editRamoId;
      setCarreras(cs => cs.map(c => c.id === modalRamo.carreraId ? {
        ...c,
        semestres: c.semestres.map(s => s.id === modalRamo.semestreId ? {
          ...s, ramos: s.ramos.map(r => r.id === rid ? { ...r, nombre: formRamo.nombre.trim(), nota_final: nota, estado: formRamo.estado } : r),
        } : s),
      } : c));
    } else {
      setCarreras(cs => cs.map(c => c.id === modalRamo.carreraId ? {
        ...c,
        semestres: c.semestres.map(s => s.id === modalRamo.semestreId
          ? { ...s, ramos: [...s.ramos, { id: uid(), nombre: formRamo.nombre.trim(), nota_final: nota, estado: formRamo.estado }] }
          : s
        ),
      } : c));
    }
    setModalRamo(null);
  };

  const eliminarRamo = (carreraId: number, semestreId: number, ramoId: number) => {
    setCarreras(cs => cs.map(c => c.id === carreraId ? {
      ...c,
      semestres: c.semestres.map(s => s.id === semestreId ? { ...s, ramos: s.ramos.filter(r => r.id !== ramoId) } : s),
    } : c));
  };

  // ── Datos derivados para modales ───────────────────────────────────────────
  const carreraDelSem = modalSemestre !== null ? (carreras.find(c => c.id === modalSemestre) ?? null) : null;
  const hayRegularCerrado = carreraDelSem?.semestres.some(s => s.tipo === 'REGULAR' && s.cerrado) ?? false;

  const semDelRamo = modalRamo
    ? (carreras.find(c => c.id === modalRamo.carreraId)?.semestres.find(s => s.id === modalRamo.semestreId) ?? null)
    : null;
  const ramoLimitAlcanzado = !modalRamo?.editRamoId && semDelRamo?.tipo === 'RECUPERATIVO' && (semDelRamo?.ramos.length ?? 0) >= 1;
  const esEdicion = modalRamo?.editRamoId !== undefined;

  return (
    <div>
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Avance Curricular</h2>
          <p className="text-base text-gray-500 mt-1">
            {carreras.length === 0
              ? 'Sin carreras registradas'
              : `${carreras.length} carrera${carreras.length > 1 ? 's' : ''} registrada${carreras.length > 1 ? 's' : ''}`}
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
          <p className="text-base text-gray-400 mb-6">Agrega una carrera para comenzar a registrar el avance curricular.</p>
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
            key={carrera.id}
            carrera={carrera}
            onEliminarCarrera={() => eliminarCarrera(carrera.id)}
            onAgregarSemestre={() => abrirModalSemestre(carrera.id)}
            onCerrarSemestre={semId => cerrarSemestre(carrera.id, semId)}
            onEliminarSemestre={semId => eliminarSemestre(carrera.id, semId)}
            onAgregarRamo={semId => abrirNuevoRamo(carrera.id, semId)}
            onEditarRamo={(semId, ramo) => abrirEditarRamo(carrera.id, semId, ramo)}
            onEliminarRamo={(semId, ramoId) => eliminarRamo(carrera.id, semId, ramoId)}
          />
        ))}
      </div>

      {/* Modal: Nueva carrera */}
      <Modal
        titulo="Nueva carrera"
        abierto={modalCarrera}
        onCerrar={() => setModalCarrera(false)}
        tamanio="sm"
        acciones={
          <div className="flex gap-2 justify-end w-full">
            <button onClick={() => setModalCarrera(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
            <button onClick={agregarCarrera} className="px-4 py-2 text-sm rounded-lg bg-[#65B39B] text-white font-semibold hover:bg-[#4a9e87] transition-colors">Agregar</button>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          {errCarrera && <Alert tipo="error" mensaje={errCarrera} />}
          <Select etiqueta="Universidad" valor={formCarrera.universidad} onChange={v => setFormCarrera(f => ({ ...f, universidad: v as string }))} opciones={UNIVERSIDADES_MOCK.map(u => ({ valor: u, etiqueta: u }))} />
          <Input etiqueta="Nombre de la carrera" valor={formCarrera.nombre} onChange={v => setFormCarrera(f => ({ ...f, nombre: v }))} placeholder="Ej: Ingeniería Civil en Informática" />
        </div>
      </Modal>

      {/* Modal: Nuevo semestre */}
      <Modal
        titulo="Nuevo semestre"
        abierto={modalSemestre !== null}
        onCerrar={() => setModalSemestre(null)}
        tamanio="sm"
        acciones={
          <div className="flex gap-2 justify-end w-full">
            <button onClick={() => setModalSemestre(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
            <button onClick={agregarSemestre} className="px-4 py-2 text-sm rounded-lg bg-[#65B39B] text-white font-semibold hover:bg-[#4a9e87] transition-colors">Agregar</button>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          {errSem && <Alert tipo="error" mensaje={errSem} />}
          <Input etiqueta="Año" tipo="number" valor={formSem.year} onChange={v => setFormSem(f => ({ ...f, year: Number(v) || f.year }))} />
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Tipo</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="tipoSem" checked={formSem.tipo === 'REGULAR'} onChange={() => setFormSem(f => ({ ...f, tipo: 'REGULAR', codigo: '1' }))} className="accent-[#65B39B] w-4 h-4" />
                <span className="text-sm text-gray-700">Regular</span>
              </label>
              <label className={`flex items-center gap-2 ${!hayRegularCerrado ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                <input type="radio" name="tipoSem" checked={formSem.tipo === 'RECUPERATIVO'} disabled={!hayRegularCerrado} onChange={() => setFormSem(f => ({ ...f, tipo: 'RECUPERATIVO', codigo: 'INVIERNO' }))} className="accent-[#65B39B] w-4 h-4" />
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
            <Select etiqueta="Semestre" valor={formSem.codigo} onChange={v => setFormSem(f => ({ ...f, codigo: v as '1' | '2' }))}
              opciones={[{ valor: '1', etiqueta: 'Primer semestre' }, { valor: '2', etiqueta: 'Segundo semestre' }]}
            />
          )}
          {formSem.tipo === 'RECUPERATIVO' && (
            <Select etiqueta="Subtipo" valor={formSem.codigo} onChange={v => setFormSem(f => ({ ...f, codigo: v as 'INVIERNO' | 'VERANO' }))}
              opciones={[{ valor: 'INVIERNO', etiqueta: 'Invierno' }, { valor: 'VERANO', etiqueta: 'Verano' }]}
            />
          )}
        </div>
      </Modal>

      {/* Modal: Crear / editar ramo */}
      <Modal
        titulo={esEdicion ? 'Editar ramo' : 'Nuevo ramo'}
        abierto={modalRamo !== null}
        onCerrar={() => setModalRamo(null)}
        tamanio="sm"
        acciones={
          <div className="flex gap-2 justify-end w-full">
            <button onClick={() => setModalRamo(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
            <button onClick={guardarRamo} disabled={ramoLimitAlcanzado} className="px-4 py-2 text-sm rounded-lg bg-[#65B39B] text-white font-semibold hover:bg-[#4a9e87] disabled:opacity-50 transition-colors">
              {esEdicion ? 'Guardar cambios' : 'Agregar ramo'}
            </button>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          {errRamo && <Alert tipo="error" mensaje={errRamo} />}
          {ramoLimitAlcanzado && <Alert tipo="advertencia" mensaje="Los semestres recuperativos solo pueden contener un ramo." />}
          <Input etiqueta="Nombre del ramo" valor={formRamo.nombre} onChange={v => setFormRamo(f => ({ ...f, nombre: v }))} placeholder="Ej: Cálculo I" deshabilitado={ramoLimitAlcanzado} />
          <Input etiqueta="Nota final (1.0 — 7.0)" tipo="number" valor={formRamo.nota_final} onChange={v => setFormRamo(f => ({ ...f, nota_final: v }))} placeholder="Ej: 5.5" ayuda="Dejar vacío si aún no tiene nota final" deshabilitado={ramoLimitAlcanzado} />
          <Select etiqueta="Estado" valor={formRamo.estado} onChange={v => setFormRamo(f => ({ ...f, estado: v as EstadoRamo }))} opciones={ESTADO_RAMO_OPTS.map(o => ({ valor: o.valor, etiqueta: o.etiqueta }))} deshabilitado={ramoLimitAlcanzado} />
        </div>
      </Modal>

      <ConfirmDialog />
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

interface CarreraAcordeonProps {
  carrera: CarreraMock;
  onEliminarCarrera: () => void;
  onAgregarSemestre: () => void;
  onCerrarSemestre: (semId: number) => void;
  onEliminarSemestre: (semId: number) => void;
  onAgregarRamo: (semId: number) => void;
  onEditarRamo: (semId: number, ramo: RamoMock) => void;
  onEliminarRamo: (semId: number, ramoId: number) => void;
}

function CarreraAcordeon({ carrera, onEliminarCarrera, onAgregarSemestre, onCerrarSemestre, onEliminarSemestre, onAgregarRamo, onEditarRamo, onEliminarRamo }: CarreraAcordeonProps) {
  const [expandido, setExpandido] = useState(true);
  const ultimoSem = carrera.semestres.at(-1) ?? null;
  const puedeAgregarSem = !ultimoSem || ultimoSem.cerrado;

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
            <p className="text-sm text-gray-400 truncate">{carrera.universidad}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4" onClick={e => e.stopPropagation()}>
          <button
            onClick={onAgregarSemestre}
            disabled={!puedeAgregarSem}
            title={!puedeAgregarSem ? 'Cierra el semestre actual antes de agregar uno nuevo' : 'Agregar nuevo semestre'}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-[#65B39B] text-white hover:bg-[#4a9e87] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <AddIcon sx={{ fontSize: 16 }} />
            Nuevo semestre
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

      {/* Contenido expandido */}
      {expandido && (
        <div className="border-t border-gray-100 px-6 py-5">
          {!puedeAgregarSem && ultimoSem && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
              <span>⚠️</span>
              <span>Cierra <strong>{semLabel(ultimoSem)}</strong> antes de agregar el siguiente semestre.</span>
            </div>
          )}

          {carrera.semestres.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
              <p className="text-base text-gray-400 mb-4">Este carrera no tiene semestres registrados aún.</p>
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
                    key={sem.id}
                    semestre={sem}
                    onCerrar={() => onCerrarSemestre(sem.id)}
                    onEliminar={() => onEliminarSemestre(sem.id)}
                    onAgregarRamo={() => onAgregarRamo(sem.id)}
                    onEditarRamo={ramo => onEditarRamo(sem.id, ramo)}
                    onEliminarRamo={ramoId => onEliminarRamo(sem.id, ramoId)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface SemestreColumnaProps {
  semestre: SemestreMock;
  onCerrar: () => void;
  onEliminar: () => void;
  onAgregarRamo: () => void;
  onEditarRamo: (ramo: RamoMock) => void;
  onEliminarRamo: (ramoId: number) => void;
}

function SemestreColumna({ semestre, onCerrar, onEliminar, onAgregarRamo, onEditarRamo, onEliminarRamo }: SemestreColumnaProps) {
  const ramoLimitAlcanzado = semestre.tipo === 'RECUPERATIVO' && semestre.ramos.length >= 1;
  const todosConNota = semestre.ramos.length > 0 && semestre.ramos.every(r => r.estado === 'ELIMINADO' || r.nota_final !== null);
  const puedesCerrar = semestre.ramos.length > 0 && todosConNota;
  const tooltipCierre = semestre.ramos.length === 0
    ? 'Agrega al menos un ramo antes de cerrar'
    : !todosConNota
      ? 'Todos los ramos deben tener nota final'
      : undefined;

  return (
    <div className={`w-64 flex-none flex flex-col rounded-xl border-2 overflow-hidden transition-colors ${semestre.cerrado ? 'border-green-200' : 'border-gray-200'}`}>
      {/* Encabezado de columna */}
      <div className={`px-4 py-3 flex items-center justify-between ${semestre.cerrado ? 'bg-green-50' : 'bg-gray-50'}`}>
        <div>
          <p className="text-sm font-bold text-gray-800">{semLabel(semestre)}</p>
          <div className="flex items-center gap-2 mt-1">
            {semestre.tipo === 'RECUPERATIVO' && (
              <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">Recuperativo</span>
            )}
            <span className={`text-xs font-semibold ${semestre.cerrado ? 'text-green-600' : 'text-gray-400'}`}>
              {semestre.cerrado ? '✓ Cerrado' : 'Abierto'}
            </span>
          </div>
        </div>
        <button
          onClick={onEliminar}
          title="Eliminar semestre"
          className="p-1 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
        >
          <DeleteIcon sx={{ fontSize: 16 }} />
        </button>
      </div>

      {/* Ramos */}
      <div className="flex-1 p-3 space-y-2">
        {semestre.ramos.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Sin ramos registrados</p>
        ) : (
          semestre.ramos.map(ramo => (
            <RamoCard
              key={ramo.id}
              ramo={ramo}
              semAbierto={!semestre.cerrado}
              onEditar={() => onEditarRamo(ramo)}
              onEliminar={() => onEliminarRamo(ramo.id)}
            />
          ))
        )}
      </div>

      {/* Acciones del semestre abierto */}
      {!semestre.cerrado && (
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
            <p className="text-sm text-center text-gray-400 py-1">Límite: 1 ramo por semestre recuperativo</p>
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
  ramo: RamoMock;
  semAbierto: boolean;
  onEditar: () => void;
  onEliminar: () => void;
}

function RamoCard({ ramo, semAbierto, onEditar, onEliminar }: RamoCardProps) {
  const chip = ESTADO_CHIP[ramo.estado];
  const notaColor = ramo.nota_final === null
    ? 'text-gray-300'
    : ramo.nota_final >= 4
      ? 'text-green-600'
      : 'text-red-500';

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
      {/* Nombre + botón eliminar */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-gray-800 leading-snug break-words flex-1">
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

      {/* Nota + estado */}
      <div className="flex items-center gap-2 mt-2">
        <span className={`text-base font-bold tabular-nums leading-none ${notaColor}`}>
          {ramo.nota_final !== null ? ramo.nota_final.toFixed(1) : '—'}
        </span>
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${chip.bg} ${chip.text}`}>
          {chip.label}
        </span>
      </div>

      {/* Hint de doble clic (solo visible al hacer hover en semestres abiertos) */}
      {semAbierto && (
        <p className="text-xs text-[#65B39B] mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          Doble clic para editar
        </p>
      )}
    </div>
  );
}
