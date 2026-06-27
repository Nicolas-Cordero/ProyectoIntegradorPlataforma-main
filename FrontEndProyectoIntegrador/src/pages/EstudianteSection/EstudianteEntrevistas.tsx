import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useEntrevistaEnCurso } from '../../context/EntrevistaEnCursoContext';
import { entrevistaService } from '../../services/entrevista.service';
import { Spinner } from '../../components/ui';
import { EntrevistaCard } from '../../components/entrevistas/EntrevistaCard';
import { ModalDetalleEntrevista } from '../../components/entrevistas/ModalDetalleEntrevista';
import { descargarPdf } from '../../utils/pdfDownload';
import { useSnackbar } from '../../hooks/useSnackbar';
import type { EstudianteOutletContext } from './EstudianteDetail';
import type { Entrevista } from '../../types';

export default function EstudianteEntrevistas() {
  const { canEdit, estudiante } = useOutletContext<EstudianteOutletContext>();
  const { borrador, iniciar, restaurar } = useEntrevistaEnCurso();

  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entrevistaSeleccionadaId, setEntrevistaSeleccionadaId] = useState<number | null>(null);
  const [descargandoResumen, setDescargandoResumen] = useState(false);
  const { showError, SnackbarComponent } = useSnackbar();

  const rutEstudiante = estudiante.rut_estudiante;
  const nombreEstudiante = `${estudiante.nombre} ${estudiante.apellido}`;

  useEffect(() => {
    if (!canEdit) return;
    setCargando(true);
    entrevistaService
      .getByEstudiante(rutEstudiante)
      .then(setEntrevistas)
      .catch(() => setError('No se pudieron cargar las entrevistas'))
      .finally(() => setCargando(false));
  }, [rutEstudiante, canEdit, borrador]);

  async function handleDescargarResumen() {
    setDescargandoResumen(true);
    try {
      await descargarPdf(
        '/pdf-generator/entrevista-resumen',
        { rut_estudiante: rutEstudiante, nombre_estudiante: nombreEstudiante },
        'resumen-entrevistas.pdf',
      );
    } catch {
      showError('Error al generar el informe resumen');
    } finally {
      setDescargandoResumen(false);
    }
  }

  function handleNuevaEntrevista() {
    if (!borrador) {
      iniciar(rutEstudiante, nombreEstudiante);
      return;
    }
    restaurar();
  }

  if (!canEdit) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-4xl mb-3">🔒</p>
        <h2 className="text-lg font-bold text-gray-700">Acceso restringido</h2>
        <p className="text-gray-400 mt-2">Solo administradores y tutores pueden ver las entrevistas.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h2 className="text-xl font-bold text-gray-800">Entrevistas</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDescargarResumen}
            disabled={descargandoResumen}
            className="px-3 py-2 rounded-lg border border-[#65B39B]/40 text-[#3a7a6b] text-sm font-medium hover:bg-[#65B39B]/10 disabled:opacity-50 transition-colors"
          >
            {descargandoResumen ? 'Generando…' : '📄 Informe resumen'}
          </button>
          <button
            onClick={handleNuevaEntrevista}
            className="px-4 py-2 rounded-lg bg-[#65B39B] text-white text-sm font-semibold hover:bg-[#4A9B7D] transition-colors shadow-sm"
          >
            {borrador && borrador.rutEstudiante === rutEstudiante
              ? '▶ Continuar entrevista'
              : borrador
              ? '⚠ Ver entrevista en curso'
              : '+ Nueva entrevista'}
          </button>
        </div>
      </div>

      {borrador && borrador.rutEstudiante !== rutEstudiante && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-base text-amber-700">
          Hay una entrevista en curso para <strong>{borrador.nombreEstudiante}</strong>.
          Finalízala o descártala antes de iniciar una nueva.
        </div>
      )}

      {/* Lista de entrevistas */}
      {cargando ? (
        <div className="flex justify-center py-10">
          <Spinner message="Cargando entrevistas..." />
        </div>
      ) : error ? (
        <div className="text-center py-10 text-base text-red-500">{error}</div>
      ) : entrevistas.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-base">No hay entrevistas registradas para este estudiante.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entrevistas
            .slice()
            .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())
            .map((e) => (
              <EntrevistaCard
                key={e.id}
                entrevista={e}
                onClick={() => setEntrevistaSeleccionadaId(e.id)}
              />
            ))}
        </div>
      )}

      <ModalDetalleEntrevista
        entrevistaId={entrevistaSeleccionadaId}
        onCerrar={() => setEntrevistaSeleccionadaId(null)}
        onEliminada={() => {
          setEntrevistaSeleccionadaId(null);
          entrevistaService.getByEstudiante(rutEstudiante).then(setEntrevistas).catch(() => {});
        }}
        onActualizada={(actualizada) => {
          setEntrevistas((prev) => prev.map((e) => (e.id === actualizada.id ? actualizada : e)));
        }}
      />
      <SnackbarComponent />
    </div>
  );
}
