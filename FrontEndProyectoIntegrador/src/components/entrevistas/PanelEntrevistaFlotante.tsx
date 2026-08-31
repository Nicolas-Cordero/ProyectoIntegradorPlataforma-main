import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEntrevistaEnCurso } from '../../context/EntrevistaEnCursoContext';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ModalFinalizarEntrevista } from './ModalFinalizarEntrevista';

// ── Timer ─────────────────────────────────────────────────────────────────────

function useTimer(horaInicio: Date): string {
  const [elapsed, setElapsed] = useState(
    Math.max(0, Math.floor((Date.now() - horaInicio.getTime()) / 1000))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - horaInicio.getTime()) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [horaInicio]);

  const h = Math.floor(elapsed / 3600).toString().padStart(2, '0');
  const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
  const s = (elapsed % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// ── Panel principal ───────────────────────────────────────────────────────────

export function PanelEntrevistaFlotante() {
  const {
    borrador,
    actualizarComentario,
    alternarModo,
    minimizar,
    restaurar,
    descartar,
    finalizar,
    enviando,
    errorEnvio,
  } = useEntrevistaEnCurso();

  const navigate = useNavigate();
  const location = useLocation();
  const { showConfirm, ConfirmDialog } = useConfirmDialog();
  const { showSuccess, showError, SnackbarComponent } = useSnackbar();

  const [mostrandoFinalizar, setMostrandoFinalizar] = useState(false);

  const modoInferior =
    borrador !== null && !borrador.minimizado && borrador.modo === 'inferior';

  // El hueco de la mitad inferior lo reserva una regla global sobre #root (ver
  // index.css): así vale para cualquier ruta sin tocar cada shell de layout.
  useEffect(() => {
    document.body.classList.toggle('entrevista-panel-inferior', modoInferior);
    return () => document.body.classList.remove('entrevista-panel-inferior');
  }, [modoInferior]);

  const handleRestaurar = useCallback(() => {
    if (!borrador) return;
    const enPaginaEstudiante = location.pathname.startsWith(`/estudiante/${borrador.rutEstudiante}`);
    if (!enPaginaEstudiante) {
      navigate(`/estudiante/${borrador.rutEstudiante}/entrevistas`);
    }
    restaurar();
  }, [borrador, location.pathname, navigate, restaurar]);

  const handleDescartar = useCallback(() => {
    showConfirm({
      title: 'Descartar entrevista',
      message: '¿Seguro que quieres descartar la entrevista en curso? Se perderá la anotación escrita.',
      confirmText: 'Descartar',
      confirmColor: 'error',
      onConfirm: descartar,
    });
  }, [showConfirm, descartar]);

  const handleFinalizar = useCallback(
    async (params: { fechaHora?: Date; duracionS: number; resumen?: string }) => {
      try {
        await finalizar(params);
        setMostrandoFinalizar(false);
        showSuccess('Entrevista guardada correctamente');
      } catch {
        showError(errorEnvio ?? 'Error al guardar la entrevista');
      }
    },
    [finalizar, showSuccess, showError, errorEnvio]
  );

  if (!borrador) return null;

  const horaInicio = new Date(borrador.horaInicio);

  // Lateral: flotante a la derecha, superpuesto. Inferior: anclado al pie a
  // todo el ancho, con la app reacomodada encima (no tapa nada).
  const clasesPanel = modoInferior
    ? 'fixed bottom-0 left-0 right-0 rounded-t-2xl border-t'
    : 'fixed top-4 bottom-4 right-4 rounded-2xl border';
  const estiloPanel = modoInferior
    ? { height: 'var(--alto-panel-entrevista)' }
    : { width: '600px' };

  // ── Panel minimizado (Fix 9: sin botón de descartar) ─────────────────────
  if (borrador.minimizado) {
    return (
      <>
        <div
          className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-[#2D4A3E] text-white rounded-full px-4 py-2.5 shadow-xl cursor-pointer hover:bg-[#3a5c4e] transition-colors"
          role="button"
          tabIndex={0}
          onClick={handleRestaurar}
          onKeyDown={(e) => e.key === 'Enter' && handleRestaurar()}
          title="Restaurar entrevista en curso"
        >
          <MinimizedTimer horaInicio={horaInicio} />
          <span className="text-base font-medium max-w-[160px] truncate">{borrador.nombreEstudiante}</span>
        </div>
        <ConfirmDialog />
        <SnackbarComponent />
      </>
    );
  }

  // ── Panel expandido ──
  return (
    <>
      <div className={`${clasesPanel} z-50 bg-white shadow-2xl border-gray-200 flex flex-col overflow-hidden`}
           style={estiloPanel}>
        {/* Encabezado */}
        <div className="bg-[#2D4A3E] text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white/70 font-medium">Entrevista en curso</p>
            <p className="text-base font-semibold truncate">{borrador.nombreEstudiante}</p>
          </div>
          <ExpandedTimer horaInicio={horaInicio} />
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={alternarModo}
              className="text-white/70 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
              title={modoInferior
                ? 'Volver al panel lateral'
                : 'Anclar abajo para navegar sin tapar el software'}
              aria-label={modoInferior ? 'Panel lateral' : 'Panel inferior'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v14H4z" />
                <path
                  strokeLinecap="round"
                  d={modoInferior ? 'M15 5v14' : 'M4 13h16'}
                />
              </svg>
            </button>
            <button
              onClick={minimizar}
              className="text-white/70 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
              title="Minimizar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
            </button>
            <button
              onClick={handleDescartar}
              className="text-white/70 hover:text-red-300 p-1 rounded hover:bg-white/10 transition-colors"
              title="Descartar entrevista"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Cuerpo — la anotación de la entrevista, escribible desde el primer
            segundo: ya no hay que pulsar nada para empezar a tomar notas. */}
        <div className="flex-1 min-w-0 flex flex-col px-3 pt-3 pb-1">
          <label htmlFor="anotacion-entrevista" className="text-sm font-semibold text-gray-600 mb-1.5">
            Anotaciones de la entrevista
          </label>
          <textarea
            id="anotacion-entrevista"
            className="flex-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-base resize-none focus:outline-none focus:border-[#65B39B] focus:ring-1 focus:ring-[#65B39B]"
            value={borrador.comentario}
            onChange={(e) => actualizarComentario(e.target.value)}
            placeholder="Escribe aquí lo conversado durante la entrevista…"
            autoFocus
          />
        </div>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
          <button
            onClick={() => setMostrandoFinalizar(true)}
            className="flex-1 text-base bg-[#65B39B] text-white rounded-lg py-2 hover:bg-[#4A9B7D] transition-colors font-medium"
          >
            Finalizar
          </button>
        </div>
      </div>

      <ModalFinalizarEntrevista
        abierto={mostrandoFinalizar}
        horaInicio={horaInicio}
        onCancelar={() => setMostrandoFinalizar(false)}
        onConfirmar={handleFinalizar}
        enviando={enviando}
        errorEnvio={errorEnvio}
      />

      <ConfirmDialog />
      <SnackbarComponent />
    </>
  );
}

// ── Timers (separados para no re-renderizar el panel completo) ────────────────

function MinimizedTimer({ horaInicio }: { horaInicio: Date }) {
  const tiempo = useTimer(horaInicio);
  return <span className="text-sm font-mono text-white/80">{tiempo}</span>;
}

function ExpandedTimer({ horaInicio }: { horaInicio: Date }) {
  const tiempo = useTimer(horaInicio);
  return (
    <span className="text-base font-mono text-white/90 bg-white/10 px-2 py-0.5 rounded">
      {tiempo}
    </span>
  );
}
