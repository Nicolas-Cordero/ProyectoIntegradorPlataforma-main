import { useState } from 'react';
import { TOPICO_LABELS } from '../../types';
import type { Topico } from '../../types';

interface Props {
  topico: Topico;
  texto: string;
  onEditar: (topico: Topico, texto: string) => void;
  onEliminar: (topico: Topico) => void;
}

export function ComentarioBorradorCard({ topico, texto, onEditar, onEliminar }: Props) {
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState(texto);

  function confirmarEdicion() {
    if (draft.trim()) {
      onEditar(topico, draft.trim());
    }
    setEditando(false);
  }

  function cancelarEdicion() {
    setDraft(texto);
    setEditando(false);
  }

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 mb-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-[#65B39B] uppercase tracking-wide">
          {TOPICO_LABELS[topico]}
        </span>
        <div className="flex gap-1">
          {!editando && (
            <button
              onClick={() => { setDraft(texto); setEditando(true); }}
              className="text-xs text-gray-400 hover:text-gray-600 px-1.5 py-0.5 rounded hover:bg-gray-200 transition-colors"
              title="Editar comentario"
            >
              ✎
            </button>
          )}
          <button
            onClick={() => onEliminar(topico)}
            className="text-xs text-red-400 hover:text-red-600 px-1.5 py-0.5 rounded hover:bg-red-50 transition-colors"
            title="Eliminar comentario"
          >
            ✕
          </button>
        </div>
      </div>

      {editando ? (
        <div className="mt-1 space-y-2">
          <textarea
            className="w-full text-sm border border-gray-300 rounded p-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#65B39B]"
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={cancelarEdicion}
              className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarEdicion}
              disabled={!draft.trim()}
              className="text-xs px-2 py-1 rounded bg-[#65B39B] text-white hover:bg-[#4A9B7D] disabled:opacity-50 transition-colors"
            >
              Guardar
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{texto}</p>
      )}
    </div>
  );
}
