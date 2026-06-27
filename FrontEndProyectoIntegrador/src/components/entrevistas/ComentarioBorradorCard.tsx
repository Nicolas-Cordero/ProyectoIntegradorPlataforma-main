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
        <span className="text-sm font-semibold text-[#65B39B] uppercase tracking-wide">
          {TOPICO_LABELS[topico]}
        </span>
        <div className="flex gap-1">
          {!editando && (
            <button
              onClick={() => { setDraft(texto); setEditando(true); }}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded hover:bg-gray-200 transition-colors"
              title="Editar comentario"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414A2 2 0 018.586 12.586z" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onEliminar(topico)}
            className="text-red-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
            title="Eliminar comentario"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {editando ? (
        <div className="mt-1 space-y-2">
          <textarea
            className="w-full text-base border border-gray-300 rounded p-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#65B39B]"
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={cancelarEdicion}
              className="text-sm px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarEdicion}
              disabled={!draft.trim()}
              className="text-sm px-2 py-1 rounded bg-[#65B39B] text-white hover:bg-[#4A9B7D] disabled:opacity-50 transition-colors"
            >
              Guardar
            </button>
          </div>
        </div>
      ) : (
        <p className="text-base text-gray-700 whitespace-pre-wrap">{texto}</p>
      )}
    </div>
  );
}
