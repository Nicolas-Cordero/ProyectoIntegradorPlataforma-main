import { useMemo, useRef, useState } from 'react';
import {
  HandshakeOutlined as HandshakeIcon,
  EditOutlined as EditIcon,
  SaveOutlined as SaveIcon,
  CloseOutlined as CloseIcon,
  CheckCircle as CheckCircleIcon,
  PictureAsPdf as PdfIcon,
  AddCircleOutline as AddIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import { TypingText } from '../components/common/TypingText';
import { Select, Input, Textarea, Button, DateLabel } from '../components/ui';
import { useConfirmDialog } from '../components/ui/ConfirmDialog';
import { useSnackbar } from '../hooks/useSnackbar';

// ── Formato del backend (DTO) ───────────────────────────────────────────────────
// Estructura fija tal como el acuerdo será almacenado/entregado por el backend:
// titulo + subtitulo + abstract y exactamente 4 tópicos, cada uno con nombre y
// hasta 4 puntos (puntoA..puntoD). Un campo `null` significa "ausente".

interface TopicoDTO {
  nombre: string | null;
  puntoA: string | null;
  puntoB: string | null;
  puntoC: string | null;
  puntoD: string | null;
}

interface AcuerdoDTO {
  titulo: string;
  subtitulo: string;
  abstract: string;
  topico1: TopicoDTO;
  topico2: TopicoDTO;
  topico3: TopicoDTO;
  topico4: TopicoDTO;
}

const TOPICO_KEYS = ['topico1', 'topico2', 'topico3', 'topico4'] as const;
const PUNTO_KEYS = ['puntoA', 'puntoB', 'puntoC', 'puntoD'] as const;

const MAX_TOPICOS = TOPICO_KEYS.length;
const MAX_PUNTOS = PUNTO_KEYS.length;

// ── Modelo interno (ergonómico para la UI) ──────────────────────────────────────
// Internamente trabajamos con arrays; la conversión a/desde el DTO ocurre solo en
// los límites (carga y guardado), para mapear arrays ↔ topico1..4 / puntoA..D.

interface Punto {
  id: number;
  texto: string;
}

interface Topico {
  id: number;
  nombre: string;
  puntos: Punto[];
}

interface Acuerdo {
  titulo: string;
  subtitulo: string;
  abstract: string;
  topicos: Topico[];
}

// Contador monotónico de ids para tópicos y puntos (claves estables de React).
let _idSeq = 0;
const nextId = () => ++_idSeq;

// DTO → modelo interno: descarta tópicos/puntos en `null` y compacta a arrays.
const fromDTO = (dto: AcuerdoDTO): Acuerdo => ({
  titulo: dto.titulo,
  subtitulo: dto.subtitulo,
  abstract: dto.abstract,
  topicos: TOPICO_KEYS.map((k) => dto[k])
    .filter((t): t is TopicoDTO => !!t && t.nombre !== null)
    .map((t) => ({
      id: nextId(),
      nombre: t.nombre ?? '',
      puntos: PUNTO_KEYS.map((pk) => t[pk])
        .filter((p): p is string => p !== null && p !== undefined)
        .map((texto) => ({ id: nextId(), texto })),
    })),
});

// Modelo interno → DTO: compacta (descarta vacíos) y rellena con `null` los huecos
// hasta completar topico1..4 / puntoA..D, replicando el formato del backend.
const toDTO = (acuerdo: Acuerdo): AcuerdoDTO => {
  const topicoVacio = (): TopicoDTO => ({
    nombre: null, puntoA: null, puntoB: null, puntoC: null, puntoD: null,
  });

  const topicoToDTO = (topico?: Topico): TopicoDTO => {
    if (!topico) return topicoVacio();
    const dto = topicoVacio();
    dto.nombre = topico.nombre.trim() || null;
    topico.puntos
      .map((p) => p.texto.trim())
      .filter((texto) => texto.length > 0)
      .slice(0, MAX_PUNTOS)
      .forEach((texto, i) => { dto[PUNTO_KEYS[i]] = texto; });
    return dto;
  };

  const topicosLlenos = acuerdo.topicos
    .filter((t) => t.nombre.trim() || t.puntos.some((p) => p.texto.trim()))
    .slice(0, MAX_TOPICOS);

  return {
    titulo: acuerdo.titulo,
    subtitulo: acuerdo.subtitulo,
    abstract: acuerdo.abstract,
    topico1: topicoToDTO(topicosLlenos[0]),
    topico2: topicoToDTO(topicosLlenos[1]),
    topico3: topicoToDTO(topicosLlenos[2]),
    topico4: topicoToDTO(topicosLlenos[3]),
  };
};

// ── Datos mockeados (en el formato del backend) ─────────────────────────────────
// TODO: reemplazar por el acuerdo proveniente del backend (GET por año).

const AÑO_ACTUAL = new Date().getFullYear();

const acuerdoDTOInicial: AcuerdoDTO = {
  titulo: 'Renovación compromiso Becarias y Becarios',
  subtitulo: `Beca Carmen Goudie año ${AÑO_ACTUAL}`,
  abstract:
    'El presente documento expone los compromisos que adquiere un/a estudiante para ' +
    'mantener la beca Carmen Goudie durante la realización de sus estudios superiores.',
  topico1: {
    nombre: 'Compromisos académicos',
    puntoA: '-Mantenerse como alumna/o regular de su establecimiento de educación superior.',
    puntoB: '-Presentar una alta asistencia a clases.',
    puntoC: '-Participar de las instancias de apoyo académico, psicopedagógico y psicológico que ofrece el Establecimiento de Educación Superior en el que está matriculada/o, en el caso de que sea requerido.',
    puntoD: '-Comunicar con anticipación a la Fundación en caso de que exista voluntad de suspensión de estudios, cambio de carrera o de abandono de la carrera.',
  },
  topico2: {
    nombre: 'Compromisos de comunicación',
    puntoA: '-Responder oportunamente (en un plazo de 48 horas) a las comunicaciones que establece la Fundación en sus distintas modalidades: telefónica, whatsapp (personal y grupal) y correo electrónico.',
    puntoB: '-Asistir a las entrevistas individuales convocadas por la Fundación en una fecha mutuamente acordada (mínimo 2 a 3 entrevistas por semestre).',
    puntoC: '-Avisar con anticipación y justificar las ausencias a las entrevistas individuales agendadas.',
    puntoD: null,
  },
  topico3: {
    nombre: 'Compromisos de participación',
    puntoA: '-Participar de los encuentros grupales convocados por la Fundación (mínimo 1 vez por semestre).',
    puntoB: '-Participar de la red de becarios, colaborando con los becarios que requieran apoyo académico, orientación vocacional, apoyo en la inserción en una nueva ciudad, etc.',
    puntoC: '-Participar del Paseo Anual de Becarios, a realizarse en el mes de diciembre.',
    puntoD: null,
  },
  topico4: {
    nombre: null,
    puntoA: null,
    puntoB: null,
    puntoC: null,
    puntoD: null,
  },
};

const acuerdoMock = fromDTO(acuerdoDTOInicial);

// ── Página ────────────────────────────────────────────────────────────────────

export function AcuerdoCompromiso() {
  const { showSuccess, showInfo, SnackbarComponent } = useSnackbar();
  const { showConfirm, ConfirmDialog } = useConfirmDialog();

  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(AÑO_ACTUAL);
  const [fechaActualizacion, setFechaActualizacion] = useState<string>(`${AÑO_ACTUAL}-03-15`);
  const [acuerdo, setAcuerdo] = useState<Acuerdo>(acuerdoMock);

  // Edición global del acuerdo completo. `borrador` es una copia profunda editable
  // que se confirma al guardar y se descarta al cancelar.
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState<Acuerdo | null>(null);

  // Resalte/indicador momentáneo tras guardar el acuerdo.
  const [recienGuardado, setRecienGuardado] = useState(false);
  const guardadoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Opciones de la combobox agrupadas por año. En esta versión placeholder solo
  // existe el año actual; el componente queda preparado para recibir la lista
  // completa de años desde el backend.
  const opcionesAño = useMemo(
    () => [{ valor: AÑO_ACTUAL, etiqueta: `Acuerdo ${AÑO_ACTUAL}` }],
    [],
  );

  const hayCambiosSinGuardar =
    editando && !!borrador && JSON.stringify(borrador) !== JSON.stringify(acuerdo);

  // ── Helpers de edición sobre el borrador ──────────────────────────────────────

  const updateBorrador = (fn: (b: Acuerdo) => Acuerdo) =>
    setBorrador((prev) => (prev ? fn(prev) : prev));

  const updateTopico = (topicoId: number, fn: (t: Topico) => Topico) =>
    updateBorrador((b) => ({
      ...b,
      topicos: b.topicos.map((t) => (t.id === topicoId ? fn(t) : t)),
    }));

  const actualizarCampo = (campo: 'titulo' | 'subtitulo' | 'abstract', valor: string) =>
    updateBorrador((b) => ({ ...b, [campo]: valor }));

  const actualizarNombreTopico = (topicoId: number, valor: string) =>
    updateTopico(topicoId, (t) => ({ ...t, nombre: valor }));

  const actualizarPunto = (topicoId: number, puntoId: number, valor: string) =>
    updateTopico(topicoId, (t) => ({
      ...t,
      puntos: t.puntos.map((p) => (p.id === puntoId ? { ...p, texto: valor } : p)),
    }));

  const agregarTopico = () =>
    updateBorrador((b) =>
      b.topicos.length >= MAX_TOPICOS
        ? b
        : { ...b, topicos: [...b.topicos, { id: nextId(), nombre: '', puntos: [{ id: nextId(), texto: '' }] }] },
    );

  const eliminarTopico = (topicoId: number) => {
    const topico = borrador?.topicos.find((t) => t.id === topicoId);
    const quitar = () =>
      updateBorrador((b) => ({ ...b, topicos: b.topicos.filter((t) => t.id !== topicoId) }));

    const vacio = !topico?.nombre.trim() && !topico?.puntos.some((p) => p.texto.trim());
    if (vacio) {
      quitar();
      return;
    }

    showConfirm({
      title: 'Eliminar tópico',
      message: `¿Eliminar "${topico?.nombre || 'este tópico'}" y sus puntos? El cambio se aplicará al guardar el acuerdo.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      confirmColor: 'error',
      onConfirm: quitar,
    });
  };

  const agregarPunto = (topicoId: number) =>
    updateTopico(topicoId, (t) =>
      t.puntos.length >= MAX_PUNTOS
        ? t
        : { ...t, puntos: [...t.puntos, { id: nextId(), texto: '' }] },
    );

  const eliminarPunto = (topicoId: number, puntoId: number) => {
    const topico = borrador?.topicos.find((t) => t.id === topicoId);
    const punto = topico?.puntos.find((p) => p.id === puntoId);
    const quitar = () =>
      updateTopico(topicoId, (t) => ({ ...t, puntos: t.puntos.filter((p) => p.id !== puntoId) }));

    if (!punto?.texto.trim()) {
      quitar();
      return;
    }

    showConfirm({
      title: 'Eliminar punto',
      message: '¿Eliminar este punto? El cambio se aplicará al guardar el acuerdo.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      confirmColor: 'error',
      onConfirm: quitar,
    });
  };

  // ── Acciones globales ─────────────────────────────────────────────────────────

  const iniciarEdicion = () => {
    setBorrador(structuredClone(acuerdo));
    setEditando(true);
  };

  const salirDeEdicion = () => {
    setEditando(false);
    setBorrador(null);
  };

  const cancelarEdicion = () => {
    if (hayCambiosSinGuardar) {
      showConfirm({
        title: 'Cambios sin guardar',
        message: 'Tienes cambios sin guardar en el acuerdo. Si continúas, se descartarán.',
        confirmText: 'Descartar cambios',
        cancelText: 'Volver',
        confirmColor: 'warning',
        onConfirm: salirDeEdicion,
      });
      return;
    }

    salirDeEdicion();
  };

  const guardarEdicion = () => {
    if (!borrador) return;

    // TODO: llamar al endpoint de actualización y notificar a estudiantes.
    // Se envía en el formato del backend (topico1..4 / puntoA..D, null = ausente).
    console.log('Guardando acuerdo (placeholder) — formato backend:', toDTO(borrador));

    setAcuerdo(borrador);
    setFechaActualizacion(new Date().toISOString().slice(0, 10));
    setEditando(false);
    setBorrador(null);

    showSuccess('Acuerdo guardado correctamente.');

    setRecienGuardado(true);
    if (guardadoTimer.current) clearTimeout(guardadoTimer.current);
    guardadoTimer.current = setTimeout(() => setRecienGuardado(false), 2500);
  };

  const descargarPDF = () => {
    // TODO: solicitar el PDF al backend (endpoint de generación de PDF del acuerdo).
    // La generación de PDF se centralizará en el backend, ya que varias vistas del
    // sistema necesitan exportar documentos. Por ahora es solo un placeholder.
    console.log('Descargar PDF del acuerdo (placeholder):', { año: añoSeleccionado });
    showInfo('La descarga en PDF estará disponible próximamente.');
  };

  return (
    <div className="min-h-screen bg-[#FFFBF0]/90 py-8 rounded-2xl">
      <div className="max-w-5xl mx-auto px-4">

        {/* Header — refleja el título/subtítulo del documento guardado */}
        <div
          className="rounded-2xl p-6 md:p-10 mb-8 text-white relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #65B39B 0%, #4a9e87 40%, #C7654F 100%)',
            boxShadow: '0 8px 32px rgba(101,179,155,0.35)',
          }}
        >
          <div className="absolute -top-10 -right-10 w-[200px] h-[200px] rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-[60px] -left-5 w-[250px] h-[250px] rounded-full bg-white/[0.04] pointer-events-none" />
          <div className="flex items-center gap-4 mb-2">
            <HandshakeIcon style={{ fontSize: 36 }} />
            <TypingText
              component="h1"
              text={acuerdo.titulo}
              startDelayMs={0}
              charDelayMs={1}
              sx={{ fontSize: { xs: '1.6rem', md: '2.2rem' }, fontWeight: 800, m: 0 }}
            />
          </div>
          <p className="text-white/85 text-base">{acuerdo.subtitulo}</p>
        </div>

        {/* Controles: selección por año + fecha de última actualización */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="w-full sm:w-72">
            <Select
              etiqueta="Acuerdo"
              opciones={opcionesAño}
              valor={añoSeleccionado}
              onChange={(v) => setAñoSeleccionado(Number(v))}
              deshabilitado={editando}
              tamano="small"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Última actualización:</span>
            <DateLabel fecha={fechaActualizacion}/>
          </div>
        </div>

        {/* Barra de acciones global */}
        <div className="flex items-center justify-end gap-3 mb-4">
          {recienGuardado && (
            <span className="flex items-center gap-1 text-sm font-medium" style={{ color: '#65B39B' }}>
              <CheckCircleIcon style={{ fontSize: 18 }} />
              Acuerdo guardado
            </span>
          )}

          <Button
            variante="secondary"
            tamano="sm"
            onClick={descargarPDF}
            deshabilitado={editando}
            startIcon={<PdfIcon style={{ fontSize: 18 }} />}
          >
            Descargar PDF
          </Button>

          {editando ? (
            <div className="flex items-center gap-2">
              <Button variante="outline" tamano="sm" onClick={cancelarEdicion}>
                <CloseIcon style={{ fontSize: 18 }} />
                Cancelar
              </Button>
              <Button variante="primary" tamano="sm" onClick={guardarEdicion}>
                <SaveIcon style={{ fontSize: 18 }} />
                Guardar acuerdo
              </Button>
            </div>
          ) : (
            <Button
              variante="primary"
              tamano="sm"
              onClick={iniciarEdicion}
              startIcon={<EditIcon style={{ fontSize: 18 }} />}
            >
              Editar acuerdo
            </Button>
          )}
        </div>

        {editando && borrador ? (
          /* ── Modo edición ───────────────────────────────────────────────── */
          <div className="flex flex-col gap-4">

            {/* Encabezado del documento */}
            <div
              className="rounded-xl bg-white p-6 flex flex-col gap-4"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)' }}
            >
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Encabezado</p>
              <Input
                etiqueta="Título"
                valor={borrador.titulo}
                onChange={(v) => actualizarCampo('titulo', v)}
                tamano="small"
              />
              <Input
                etiqueta="Subtítulo"
                valor={borrador.subtitulo}
                onChange={(v) => actualizarCampo('subtitulo', v)}
                tamano="small"
              />
              <Textarea
                etiqueta="Resumen (abstract)"
                valor={borrador.abstract}
                onChange={(v) => actualizarCampo('abstract', v)}
                filas={3}
              />
            </div>

            {/* Tópicos */}
            {borrador.topicos.map((topico) => (
              <div
                key={topico.id}
                className="rounded-xl bg-white p-6"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)' }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-1">
                    <Input
                      etiqueta="Nombre del tópico"
                      valor={topico.nombre}
                      onChange={(v) => actualizarNombreTopico(topico.id, v)}
                      tamano="small"
                    />
                  </div>
                  <Button
                    variante="danger"
                    tamano="sm"
                    onClick={() => eliminarTopico(topico.id)}
                    startIcon={<DeleteIcon style={{ fontSize: 18 }} />}
                  >
                    Eliminar
                  </Button>
                </div>

                <div className="flex flex-col gap-3">
                  {topico.puntos.map((punto, i) => (
                    <div key={punto.id} className="flex items-start gap-2">
                      <div className="flex-1">
                        <Textarea
                          etiqueta={`Punto ${i + 1}`}
                          valor={punto.texto}
                          onChange={(v) => actualizarPunto(topico.id, punto.id, v)}
                          filas={2}
                        />
                      </div>
                      <Button
                        variante="outline"
                        tamano="sm"
                        onClick={() => eliminarPunto(topico.id, punto.id)}
                        aria-label="Eliminar punto"
                      >
                        <DeleteIcon style={{ fontSize: 18 }} />
                      </Button>
                    </div>
                  ))}
                  {topico.puntos.length === 0 && (
                    <p className="text-sm text-gray-400">Este tópico no tiene puntos.</p>
                  )}
                </div>

                <div className="mt-3">
                  <Button
                    variante="outline"
                    tamano="sm"
                    onClick={() => agregarPunto(topico.id)}
                    deshabilitado={topico.puntos.length >= MAX_PUNTOS}
                    startIcon={<AddIcon style={{ fontSize: 18 }} />}
                  >
                    Agregar punto
                  </Button>
                  {topico.puntos.length >= MAX_PUNTOS && (
                    <span className="ml-2 text-xs text-gray-400">Máximo {MAX_PUNTOS} puntos.</span>
                  )}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-2">
              <Button
                variante="outline"
                tamano="sm"
                onClick={agregarTopico}
                deshabilitado={borrador.topicos.length >= MAX_TOPICOS}
                startIcon={<AddIcon style={{ fontSize: 18 }} />}
              >
                Agregar tópico
              </Button>
              {borrador.topicos.length >= MAX_TOPICOS && (
                <span className="text-xs text-gray-400">Máximo {MAX_TOPICOS} tópicos.</span>
              )}
            </div>
          </div>
        ) : (
          /* ── Modo lectura ───────────────────────────────────────────────── */
          <div className="flex flex-col gap-4">

            {/* Resumen / abstract */}
            <div
              className="rounded-xl bg-white p-6 transition-all duration-300"
              style={{
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                border: recienGuardado ? '1px solid #65B39B' : '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {acuerdo.abstract || 'Sin resumen.'}
              </p>
            </div>

            {/* Tópicos */}
            {acuerdo.topicos.map((topico) => (
              <div
                key={topico.id}
                className="rounded-xl bg-white p-6 transition-all duration-300"
                style={{
                  boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                  border: recienGuardado ? '1px solid #65B39B' : '1px solid rgba(0,0,0,0.05)',
                }}
              >
                <p className="text-base font-bold text-gray-800 mb-3">{topico.nombre}</p>
                <div className="flex flex-col gap-2">
                  {topico.puntos.map((punto) => (
                    <p
                      key={punto.id}
                      className="text-sm text-gray-600 leading-relaxed whitespace-pre-line"
                    >
                      {punto.texto}
                    </p>
                  ))}
                  {topico.puntos.length === 0 && (
                    <p className="text-sm text-gray-400">Sin puntos.</p>
                  )}
                </div>
              </div>
            ))}

            {acuerdo.topicos.length === 0 && (
              <div
                className="rounded-xl bg-white p-8 text-center text-sm text-gray-400"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
              >
                El acuerdo no tiene tópicos.
              </div>
            )}
          </div>
        )}

      </div>

      <SnackbarComponent />
      <ConfirmDialog />
    </div>
  );
}

export default AcuerdoCompromiso;
