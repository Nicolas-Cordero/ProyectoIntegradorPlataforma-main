import { useState, useEffect } from 'react';
import { Delete as DeleteIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useAuthContext } from '../../context/AuthContext';
import { entrevistaService } from '../../services/entrevista.service';
import PermissionService from '../../services/permissionService';
import { ComentarioEditable } from './ComentarioEditable';
import { DuracionHmsInput } from './DuracionHmsInput';
import { formatSemestre, formatDuracion } from './EntrevistaCard';
import { formatDate } from '../../utils/dateUtils';
import { descargarPdf } from '../../utils/pdfDownload';
import type { Entrevista, ComentarioEntrevista } from '../../types';

type Vista = 'general' | 'comentarios';

function toDatetimeLocal(date: Date | string): string {
  const d = new Date(date);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface ModalDetalleEntrevistaProps {
  entrevistaId: number | null;
  onCerrar: () => void;
  onEliminada: () => void;
  onActualizada: (entrevista: Entrevista) => void; // Fix 5
}

export function ModalDetalleEntrevista({
  entrevistaId,
  onCerrar,
  onEliminada,
  onActualizada,
}: ModalDetalleEntrevistaProps) {
  const { usuario } = useAuthContext();
  const esAdmin    = PermissionService.isAdmin(usuario);
  const puedeEditar = PermissionService.canEditStudent(usuario); // Admin + Tutor

  const [entrevista, setEntrevista] = useState<Entrevista | null>(null);
  const [comentarios, setComentarios] = useState<ComentarioEntrevista[]>([]);
  const [cargando, setCargando] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [vista, setVista] = useState<Vista>('general');

  const [fechaHoraInput, setFechaHoraInput] = useState('');
  const [duracionS, setDuracionS] = useState(0);
  const [resumenInput, setResumenInput] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [descargandoPdf, setDescargandoPdf] = useState(false);

  // Fix 6 — un único ConfirmDialog y Snackbar al nivel del modal
  const { showConfirm, ConfirmDialog } = useConfirmDialog();
  const { showSuccess, showError, SnackbarComponent } = useSnackbar();

  useEffect(() => {
    if (!entrevistaId) {
      setEntrevista(null);
      setComentarios([]);
      return;
    }
    setVista('general');
    setCargando(true);
    setErrorCarga(null);
    entrevistaService.getById(String(entrevistaId))
      .then((data) => {
        setEntrevista(data);
        setComentarios(data.comentarios ?? []);
        setFechaHoraInput(toDatetimeLocal(data.fecha_hora));
        setDuracionS(data.duracion_s);
        setResumenInput(data.resumen ?? '');
      })
      .catch(() => setErrorCarga('No se pudo cargar el detalle de la entrevista'))
      .finally(() => setCargando(false));
  }, [entrevistaId]);

  async function handleGuardarCambios() {
    if (!entrevista) return;
    setGuardando(true);
    try {
      const updated = await entrevistaService.actualizarEntrevista(entrevista.id, {
        fecha_hora: new Date(fechaHoraInput).toISOString(),
        duracion_s: duracionS,
        resumen: resumenInput || undefined,
      });
      setEntrevista(updated);
      setComentarios(updated.comentarios ?? comentarios);
      onActualizada(updated); // Fix 5
      showSuccess('Entrevista actualizada');
      onCerrar();
    } catch {
      showError('Error al guardar los cambios');
    } finally {
      setGuardando(false);
    }
  }

  function handleEliminarEntrevista() {
    if (!entrevista) return;
    showConfirm({
      title: 'Eliminar entrevista',
      message: 'Esta acción eliminará la entrevista y todos sus comentarios. No se puede deshacer.',
      confirmText: 'Eliminar',
      confirmColor: 'error',
      onConfirm: async () => {
        await entrevistaService.eliminarEntrevista(entrevista.id);
        onCerrar();
        onEliminada();
      },
    });
  }

  async function handleDescargarPdf() {
    if (!entrevista) return;
    setDescargandoPdf(true);
    try {
      await descargarPdf(
        '/pdf-generator/entrevista',
        { id_entrevista: entrevista.id },
        `informe-entrevista-${entrevista.rut_estudiante}.pdf`,
      );
    } catch {
      showError('Error al generar el informe PDF');
    } finally {
      setDescargandoPdf(false);
    }
  }

  const semestre = entrevista ? formatSemestre(entrevista.semestre) : '';
  const entrevistador = entrevista?.entrevistador
    ? `${entrevista.entrevistador.nombre} ${entrevista.entrevistador.apellido}`
    : '—';

  return (
    <>
      <Modal
        titulo="Detalle de entrevista"
        abierto={!!entrevistaId}
        onCerrar={onCerrar}
        tamanio="lg"
        acciones={entrevista ? (
          <div className="flex items-center justify-between flex-wrap gap-2 w-full">
            <button
              onClick={handleDescargarPdf}
              disabled={descargandoPdf}
              className="flex items-center gap-1.5 px-3 py-2 text-base text-[#3a7a6b] border border-[#65B39B]/40 rounded-lg hover:bg-[#65B39B]/10 disabled:opacity-50 transition-colors"
            >
              <PdfIcon sx={{ fontSize: 18 }} />
              {descargandoPdf ? 'Generando…' : 'Generar informe PDF'}
            </button>

            <div className="flex items-center gap-2">
              {esAdmin && (
                <button
                  onClick={handleEliminarEntrevista}
                  className="flex items-center gap-1.5 px-3 py-2 text-base text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <DeleteIcon sx={{ fontSize: 18 }} />
                  Eliminar entrevista
                </button>
              )}
              {puedeEditar && (
                <button
                  onClick={handleGuardarCambios}
                  disabled={guardando}
                  className="px-4 py-2 text-base bg-[#65B39B] text-white rounded-lg hover:bg-[#4A9B7D] disabled:opacity-50 transition-colors font-medium"
                >
                  {guardando ? 'Guardando…' : 'Guardar cambios'}
                </button>
              )}
            </div>
          </div>
        ) : undefined}
      >
        {cargando ? (
          <div className="flex justify-center py-10">
            <Spinner message="Cargando detalle..." />
          </div>
        ) : errorCarga ? (
          <p className="text-center text-red-500 py-6">{errorCarga}</p>
        ) : entrevista ? (
          <div className="space-y-5">
            {/* Navegación general / comentarios */}
            <div className="flex justify-center gap-1 border-b border-gray-100 -mt-2">
              {(['general', 'comentarios'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVista(v)}
                  className={`px-4 py-2 text-sm transition-colors border-b-2 ${
                    vista === v
                      ? 'text-[#65B39B] font-bold border-[#65B39B]'
                      : 'text-gray-500 font-medium border-transparent hover:text-[#65B39B]'
                  }`}
                >
                  {v === 'general' ? 'General' : `Comentarios${comentarios.length ? ` (${comentarios.length})` : ''}`}
                </button>
              ))}
            </div>

            {vista === 'general' ? (
              <div className="space-y-5">
                {/* Metadatos */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-0.5">Entrevistador</p>
                    <p className="text-base font-medium text-gray-700">{entrevistador}</p>
                  </div>
                  {semestre && (
                    <div>
                      <p className="text-sm text-gray-400 uppercase tracking-wide mb-0.5">Semestre</p>
                      <p className="text-base font-medium text-gray-700">{semestre}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-0.5">Registrada en el sistema</p>
                    <p className="text-base font-medium text-gray-700">{formatDate(entrevista.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-0.5">Fecha de celebración</p>
                    <p className="text-base font-medium text-gray-700">{formatDate(entrevista.fecha_hora)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Cuándo se realizó la entrevista</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-0.5">Duración</p>
                    <p className="text-base font-medium text-gray-700">{formatDuracion(entrevista.duracion_s)}</p>
                  </div>
                </div>

                {/* Formulario de edición — solo Admin/Tutor */}
                {puedeEditar && (
                  <>
                    <hr className="border-gray-100" />
                    <div>
                      <h3 className="text-base font-semibold text-gray-700 mb-3">Editar datos</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-gray-500 block mb-1">
                            Fecha de celebración <span className="text-gray-400 font-normal">· no cuándo se guardó</span>
                          </label>
                          <input
                            type="datetime-local"
                            value={fechaHoraInput}
                            onChange={(e) => setFechaHoraInput(e.target.value)}
                            className="w-full text-base border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#65B39B] focus:ring-1 focus:ring-[#65B39B]/30"
                          />
                        </div>
                        <DuracionHmsInput totalSegundos={duracionS} onChange={setDuracionS} />
                        <div>
                          <label className="text-sm text-gray-500 block mb-1">Resumen</label>
                          <textarea
                            value={resumenInput}
                            onChange={(e) => setResumenInput(e.target.value)}
                            rows={3}
                            className="w-full text-base border border-gray-200 rounded-lg px-3 py-2 resize-y focus:outline-none focus:border-[#65B39B] focus:ring-1 focus:ring-[#65B39B]/30"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div>
                {comentarios.length > 0 ? (
                  <div className="space-y-2">
                    {comentarios.map((c) => (
                      <ComentarioEditable
                        key={c.id}
                        comentario={c}
                        esAdmin={esAdmin}
                        onActualizado={(updated) =>
                          setComentarios((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
                        }
                        onEliminado={(id) =>
                          setComentarios((prev) => prev.filter((x) => x.id !== id))
                        }
                        showConfirm={showConfirm}
                        showSuccess={showSuccess}
                        showError={showError}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-10">Sin comentarios registrados.</p>
                )}
              </div>
            )}
          </div>
        ) : null}
      </Modal>
      <ConfirmDialog />
      <SnackbarComponent />
    </>
  );
}
