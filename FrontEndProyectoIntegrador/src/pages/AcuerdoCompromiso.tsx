import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { acuerdoService } from '../services';
import type { AcuerdoResponse, DocumentoCompromiso } from '../services/acuerdo.service';
import { descargarPdf } from '../utils/pdfDownload';

// ── Modelo interno (ergonómico para la UI) ──────────────────────────────────────
// El backend entrega/recibe el documento como { titulo, subtitulo, abstract,
// topicos: [{ nombre, puntos: string[] }] }. Internamente trabajamos con ids
// estables para las claves de React; la conversión ocurre solo en los límites
// (carga y guardado) vía fromBackend / toBackend.

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

// Límites de la UI: deshabilitan los botones "agregar" y se respetan al guardar.
const MAX_TOPICOS = 4;
const MAX_PUNTOS = 4;

// Contador monotónico de ids para tópicos y puntos (claves estables de React).
let _idSeq = 0;
const nextId = () => ++_idSeq;

// documento backend → modelo interno: asigna ids estables a tópicos y puntos.
const fromBackend = (doc: DocumentoCompromiso): Acuerdo => ({
  titulo: doc.titulo,
  subtitulo: doc.subtitulo,
  abstract: doc.abstract,
  topicos: (doc.topicos ?? []).map((t) => ({
    id: nextId(),
    nombre: t.nombre ?? '',
    puntos: (t.puntos ?? []).map((texto) => ({ id: nextId(), texto })),
  })),
});

// modelo interno → documento backend: descarta nombres/puntos vacíos y respeta los
// máximos. Un tópico sin nombre se envía con `nombre: null`.
const toBackend = (acuerdo: Acuerdo): DocumentoCompromiso => ({
  titulo: acuerdo.titulo,
  subtitulo: acuerdo.subtitulo,
  abstract: acuerdo.abstract,
  topicos: acuerdo.topicos
    .map((t) => ({
      nombre: t.nombre.trim() || null,
      puntos: t.puntos
        .map((p) => p.texto.trim())
        .filter((texto) => texto.length > 0)
        .slice(0, MAX_PUNTOS),
    }))
    .filter((t) => t.nombre !== null || t.puntos.length > 0)
    .slice(0, MAX_TOPICOS),
});

// Etiqueta legible de una versión a partir de su createdAt (fecha + hora, para
// distinguir versiones creadas el mismo día).
const formatVersionLabel = (createdAt: string): string =>
  new Date(createdAt).toLocaleString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// ── Página ────────────────────────────────────────────────────────────────────

export function AcuerdoCompromiso() {
  const { showSuccess, showError, SnackbarComponent } = useSnackbar();
  const { showConfirm, ConfirmDialog } = useConfirmDialog();

  // Todas las versiones (filas de `acuerdo`) y la seleccionada. `versionId` es a la
  // vez la opción activa de la combo y la base del PATCH al guardar.
  const [versiones, setVersiones] = useState<AcuerdoResponse[]>([]);
  const [versionId, setVersionId] = useState<number | null>(null);
  const [fechaActualizacion, setFechaActualizacion] = useState<string>('');
  const [acuerdo, setAcuerdo] = useState<Acuerdo | null>(null);

  // Estado de la carga inicial / recarga por fecha.
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [descargandoPdf, setDescargandoPdf] = useState(false);

  // Edición global del acuerdo completo. `borrador` es una copia profunda editable
  // que se confirma al guardar y se descarta al cancelar.
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState<Acuerdo | null>(null);

  // Resalte/indicador momentáneo tras guardar el acuerdo.
  const [recienGuardado, setRecienGuardado] = useState(false);
  const guardadoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Aplica una versión a la vista: combo, documento mostrado y fecha.
  const seleccionarVersion = useCallback((version: AcuerdoResponse) => {
    setVersionId(version.id);
    setAcuerdo(fromBackend(version.documento));
    setFechaActualizacion(version.createdAt.slice(0, 10));
  }, []);

  // Carga todas las versiones y selecciona la más reciente (la vigente).
  const cargarVersiones = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const lista = await acuerdoService.getAcuerdos();
      setVersiones(lista);
      if (lista.length > 0) {
        seleccionarVersion(lista[0]);
      } else {
        setVersionId(null);
        setAcuerdo(null);
        setError('No hay acuerdos registrados.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el acuerdo.');
    } finally {
      setCargando(false);
    }
  }, [seleccionarVersion]);

  useEffect(() => {
    cargarVersiones();
  }, [cargarVersiones]);

  // Cada versión existente como opción de la combo; la primera (más reciente) se
  // marca como vigente.
  const opcionesVersiones = useMemo(
    () =>
      versiones.map((version, i) => ({
        valor: version.id,
        etiqueta:
          i === 0
            ? `${formatVersionLabel(version.createdAt)} (vigente)`
            : formatVersionLabel(version.createdAt),
      })),
    [versiones],
  );

  // Cambiar de versión no requiere petición: el documento ya viene en la lista.
  const cambiarVersion = (valor: number | string) => {
    const id = Number(valor);
    const version = versiones.find((v) => v.id === id);
    if (version) seleccionarVersion(version);
  };

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

  const guardarEdicion = async () => {
    if (!borrador || versionId === null) return;

    setGuardando(true);
    try {
      // El backend versiona: cada PATCH crea una fila nueva (nuevo id y createdAt)
      // a partir del documento enviado, sin mutar la original.
      const res = await acuerdoService.updateAcuerdo(versionId, {
        documento: toBackend(borrador),
      });

      // La nueva versión es la más reciente: encabeza la lista y queda activa.
      setVersiones((prev) => [res, ...prev]);
      seleccionarVersion(res);
      setEditando(false);
      setBorrador(null);

      showSuccess('Acuerdo guardado correctamente.');

      setRecienGuardado(true);
      if (guardadoTimer.current) clearTimeout(guardadoTimer.current);
      guardadoTimer.current = setTimeout(() => setRecienGuardado(false), 2500);
    } catch (e) {
      // Se mantiene el modo edición activo para que el usuario pueda reintentar.
      showError(e instanceof Error ? e.message : 'No se pudo guardar el acuerdo.');
    } finally {
      setGuardando(false);
    }
  };

  const descargarPDF = async () => {
    if (!acuerdo || versionId === null) return;

    const versionActual = versiones.find((v) => v.id === versionId);
    setDescargandoPdf(true);
    try {
      await descargarPdf(
        '/pdf-generator/acuerdo',
        {
          titulo: acuerdo.titulo,
          subtitulo: acuerdo.subtitulo,
          abstract: acuerdo.abstract,
          topicos: acuerdo.topicos.map((t) => ({
            nombre: t.nombre.trim() || 'Sin título',
            puntos: t.puntos.map((p) => p.texto.trim()).filter((texto) => texto.length > 0),
          })),
          version: versionActual ? formatVersionLabel(versionActual.createdAt) : 'Vigente',
        },
        'acuerdo-compromiso.pdf',
      );
    } catch (e) {
      showError(e instanceof Error ? e.message : 'No se pudo generar el PDF del acuerdo.');
    } finally {
      setDescargandoPdf(false);
    }
  };

  // Carga inicial: todavía no hay un acuerdo disponible (cargando o falló la carga).
  if (!acuerdo) {
    return (
      <div className="min-h-screen bg-[#FFFBF0]/90 py-8 rounded-2xl">
        <div className="max-w-5xl mx-auto px-4">
          {cargando ? (
            <div
              className="rounded-xl bg-white p-8 text-center text-sm text-gray-500"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
            >
              Cargando acuerdo…
            </div>
          ) : (
            <div
              className="rounded-xl bg-white p-8 flex flex-col items-center gap-4 text-center"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
            >
              <p className="text-sm text-red-600">
                {error ?? 'No se pudo cargar el acuerdo.'}
              </p>
              <Button variante="primary" tamano="sm" onClick={() => cargarVersiones()}>
                Reintentar
              </Button>
            </div>
          )}
        </div>
        <SnackbarComponent />
      </div>
    );
  }

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
              etiqueta="Versión"
              opciones={opcionesVersiones}
              valor={versionId ?? ''}
              onChange={cambiarVersion}
              deshabilitado={editando || cargando}
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
            deshabilitado={editando || descargandoPdf}
            startIcon={<PdfIcon style={{ fontSize: 18 }} />}
          >
            {descargandoPdf ? 'Generando…' : 'Descargar PDF'}
          </Button>

          {editando ? (
            <div className="flex items-center gap-2">
              <Button
                variante="outline"
                tamano="sm"
                onClick={cancelarEdicion}
                deshabilitado={guardando}
              >
                <CloseIcon style={{ fontSize: 18 }} />
                Cancelar
              </Button>
              <Button
                variante="primary"
                tamano="sm"
                onClick={guardarEdicion}
                deshabilitado={guardando}
              >
                <SaveIcon style={{ fontSize: 18 }} />
                {guardando ? 'Guardando…' : 'Guardar acuerdo'}
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

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-4 text-sm text-red-700">
            {error}
          </div>
        )}

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
