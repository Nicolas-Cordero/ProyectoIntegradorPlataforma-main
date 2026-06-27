import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEntrevistaEnCurso } from '../../context/EntrevistaEnCursoContext';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ComentarioBorradorCard } from './ComentarioBorradorCard';
import { ModalFinalizarEntrevista } from './ModalFinalizarEntrevista';
import { TOPICO_LABELS, TODOS_LOS_TOPICOS } from '../../types';
import type { Topico } from '../../types';

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

// ── Formulario de agregar comentario ─────────────────────────────────────────

interface AgregarComentarioFormProps {
  topicosUsados: Topico[];
  onAgregar: (topico: Topico, texto: string) => void;
  onCancelar: () => void;
}

function AgregarComentarioForm({ topicosUsados, onAgregar, onCancelar }: AgregarComentarioFormProps) {
  const topicosDisponibles = TODOS_LOS_TOPICOS.filter((t) => !topicosUsados.includes(t));
  const [topico, setTopico] = useState<Topico>(topicosDisponibles[0]);
  const [texto, setTexto] = useState('');

  return (
    <div className="border border-[#65B39B]/40 rounded-lg p-3 bg-[#65B39B]/5 mt-2">
      <div className="mb-2">
        <label className="block text-sm font-semibold text-gray-600 mb-1">Tópico</label>
        <select
          className="w-full border border-gray-300 rounded px-2 py-2 text-base focus:outline-none focus:ring-1 focus:ring-[#65B39B] bg-white"
          value={topico}
          onChange={(e) => setTopico(e.target.value as Topico)}
        >
          {topicosDisponibles.map((t) => (
            <option key={t} value={t}>{TOPICO_LABELS[t]}</option>
          ))}
        </select>
      </div>
      <div className="mb-2">
        <label className="block text-sm font-semibold text-gray-600 mb-1">Texto</label>
        <textarea
          className="w-full border border-gray-300 rounded px-2 py-2 text-base resize-none focus:outline-none focus:ring-1 focus:ring-[#65B39B]"
          rows={3}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe el comentario..."
          autoFocus
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancelar}
          className="text-sm px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={() => { if (texto.trim()) onAgregar(topico, texto.trim()); }}
          disabled={!texto.trim()}
          className="text-sm px-3 py-1.5 rounded bg-[#65B39B] text-white hover:bg-[#4A9B7D] disabled:opacity-50 transition-colors"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}

// ── Panel principal ───────────────────────────────────────────────────────────

export function PanelEntrevistaFlotante() {
  const {
    borrador,
    agregarComentario,
    editarComentario,
    eliminarComentario,
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

  const [mostrandoAgregar, setMostrandoAgregar] = useState(false);
  const [mostrandoFinalizar, setMostrandoFinalizar] = useState(false);

  // Cierra el form de agregar cuando ya no quedan tópicos disponibles
  useEffect(() => {
    if (!borrador) return;
    if (borrador.comentarios.length >= TODOS_LOS_TOPICOS.length) {
      setMostrandoAgregar(false);
    }
  }, [borrador]);

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
      message: '¿Seguro que quieres descartar la entrevista en curso? Se perderán todos los comentarios escritos.',
      confirmText: 'Descartar',
      confirmColor: 'error',
      onConfirm: descartar,
    });
  }, [showConfirm, descartar]);

  const handleAgregarComentario = useCallback(
    (topico: Topico, texto: string) => {
      agregarComentario({ topico, texto });
      setMostrandoAgregar(false);
    },
    [agregarComentario]
  );

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
  const topicosUsados = borrador.comentarios.map((c) => c.topico);
  const puedeAgregarMas = topicosUsados.length < TODOS_LOS_TOPICOS.length;

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

  // ── Panel expandido (Fix 7: 460px ancho, 80vh alto; Fix 8: texto más grande) ──
  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
           style={{ width: '460px', maxHeight: '80vh' }}>
        {/* Encabezado */}
        <div className="bg-[#2D4A3E] text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white/70 font-medium">Entrevista en curso</p>
            <p className="text-base font-semibold truncate">{borrador.nombreEstudiante}</p>
          </div>
          <ExpandedTimer horaInicio={horaInicio} />
          <div className="flex items-center gap-1 ml-2">
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

        {/* Cuerpo — lista de comentarios (scroll interno) */}
        <div className="flex-1 overflow-y-auto px-3 pt-3 pb-1">
          {borrador.comentarios.length === 0 ? (
            <p className="text-base text-gray-400 text-center py-6">
              Sin comentarios aún. Agrega el primero.
            </p>
          ) : (
            borrador.comentarios.map((c) => (
              <ComentarioBorradorCard
                key={c.topico}
                topico={c.topico}
                texto={c.texto}
                onEditar={editarComentario}
                onEliminar={eliminarComentario}
              />
            ))
          )}

          {mostrandoAgregar && (
            <AgregarComentarioForm
              topicosUsados={topicosUsados}
              onAgregar={handleAgregarComentario}
              onCancelar={() => setMostrandoAgregar(false)}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
          {!mostrandoAgregar && (
            <button
              onClick={() => setMostrandoAgregar(true)}
              disabled={!puedeAgregarMas}
              className="flex-1 text-base border border-[#65B39B] text-[#65B39B] rounded-lg py-2 hover:bg-[#65B39B]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title={!puedeAgregarMas ? 'Ya se usaron todos los tópicos' : undefined}
            >
              + Comentario
            </button>
          )}
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
