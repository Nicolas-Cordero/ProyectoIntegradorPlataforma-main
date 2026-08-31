import { useState } from 'react';
import { Edit as EditIcon, Delete as DeleteIcon, Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import type { ComentarioEntrevista } from '../../types';
import type { ConfirmDialogOptions } from '../ui/ConfirmDialog';
import { comentarioService } from '../../services';

interface ComentarioEditableProps {
  comentario: ComentarioEntrevista;
  esAdmin: boolean;
  onActualizado: (comentario: ComentarioEntrevista) => void;
  onEliminado: (id: number) => void;
  // Hooks de notificación y confirmación provistos por el padre (Fix 6)
  showConfirm: (options: ConfirmDialogOptions) => void;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

export function ComentarioEditable({
  comentario,
  esAdmin,
  onActualizado,
  onEliminado,
  showConfirm,
  showSuccess,
  showError,
}: ComentarioEditableProps) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(comentario.texto);
  const [guardando, setGuardando] = useState(false);

  async function handleGuardar() {
    if (!texto.trim()) return;
    setGuardando(true);
    try {
      const updated = await comentarioService.actualizar(comentario.id, texto.trim());
      onActualizado(updated);
      setEditando(false);
      showSuccess('Anotación actualizada');
    } catch {
      showError('Error al guardar la anotación');
    } finally {
      setGuardando(false);
    }
  }

  function handleCancelar() {
    setTexto(comentario.texto);
    setEditando(false);
  }

  function handleEliminar() {
    showConfirm({
      title: 'Eliminar anotación',
      message: '¿Seguro que deseas eliminar la anotación de esta entrevista? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      confirmColor: 'error',
      onConfirm: async () => {
        await comentarioService.eliminar(comentario.id);
        onEliminado(comentario.id);
      },
    });
  }

  return (
    <div
      className={`border rounded-lg p-3 transition-colors ${
        editando
          ? 'border-[#65B39B]/50 bg-[#65B39B]/5 shadow-sm'
          : 'border-gray-300'
      }`}
    >
      <div className="flex items-center justify-end mb-1.5">
        {!editando && (
          <div className="flex gap-1">
            <button
              onClick={() => setEditando(true)}
              className="p-1 rounded text-gray-400 hover:text-[#65B39B] hover:bg-[#65B39B]/10 transition-colors"
              title="Editar anotación"
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </button>
            {esAdmin && (
              <button
                onClick={handleEliminar}
                className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Eliminar anotación"
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </button>
            )}
          </div>
        )}
      </div>
      {editando ? (
        <div>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={10}
            className="w-full text-base border border-gray-200 rounded-md p-2 resize-y focus:outline-none focus:border-[#65B39B] focus:ring-1 focus:ring-[#65B39B]/30"
          />
          <div className="flex gap-2 mt-1.5 justify-end">
            <button
              onClick={handleCancelar}
              disabled={guardando}
              className="flex items-center gap-1 px-2 py-1 text-sm text-gray-500 hover:text-gray-700 rounded"
            >
              <CloseIcon sx={{ fontSize: 14 }} /> Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={guardando || !texto.trim()}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-[#65B39B] text-white rounded hover:bg-[#4A9B7D] disabled:opacity-50 transition-colors"
            >
              <CheckIcon sx={{ fontSize: 14 }} /> Guardar
            </button>
          </div>
        </div>
      ) : (
        <p className="text-base text-gray-700 whitespace-pre-wrap">{comentario.texto}</p>
      )}
    </div>
  );
}
