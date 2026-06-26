import type { Entrevista } from '../../types';
import { formatDateTime, formatDate } from '../../utils/dateUtils';

export function formatSemestre(semestre?: { year: number; semestre: string }): string {
  if (!semestre) return '';
  return semestre.semestre === 'PRIMER_SEMESTRE'
    ? `1er Semestre ${semestre.year}`
    : `2do Semestre ${semestre.year}`;
}

export function formatDuracion(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}min ${sec}s`;
  if (m > 0) return `${m}min ${sec}s`;
  return `${sec}s`;
}

interface EntrevistaCardProps {
  entrevista: Entrevista;
  onClick: () => void;
}

export function EntrevistaCard({ entrevista, onClick }: EntrevistaCardProps) {
  const entrevistador = entrevista.entrevistador
    ? `${entrevista.entrevistador.nombre} ${entrevista.entrevistador.apellido}`
    : '—';
  const semestre = formatSemestre(entrevista.semestre);
  const resumenPreview = entrevista.resumen
    ? entrevista.resumen.length > 80
      ? `${entrevista.resumen.slice(0, 80)}…`
      : entrevista.resumen
    : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-start gap-4 border border-gray-100 rounded-xl p-4 hover:bg-[#65B39B]/5 hover:border-[#65B39B]/30 transition-colors"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#65B39B]/15 flex items-center justify-center text-[#65B39B]">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <p className="text-base font-semibold text-gray-800">
            {formatDateTime(entrevista.fecha_hora)}
          </p>
          {semestre && (
            <span className="text-sm text-[#3a7a6b] font-medium bg-[#65B39B]/10 px-2 py-0.5 rounded-full">
              {semestre}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-0.5">
          <span className="font-medium text-gray-600">{entrevistador}</span>
          <span className="mx-1.5 text-gray-300">·</span>
          {formatDuracion(entrevista.duracion_s)}
        </p>
        <p className="text-sm text-gray-400 mt-0.5">
          Registrada el {formatDate(entrevista.created_at)}
        </p>
        {resumenPreview && (
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{resumenPreview}</p>
        )}
      </div>
    </button>
  );
}
