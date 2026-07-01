import { fmtNum, fmtPct } from './shared';

interface SegmentedBarProps {
  data: { label: string; count: number; color: string }[];
  total: number;
}

export function SegmentedBar({ data, total }: SegmentedBarProps) {
  const filtered = data.filter(d => d.count > 0);
  if (filtered.length === 0) return <p className="text-sm text-gray-400">Sin datos de género.</p>;
  return (
    <div>
      <div className="flex h-7 rounded-lg overflow-hidden gap-px" role="img" aria-label="Distribución por género">
        {filtered.map(d => (
          <div
            key={d.label}
            style={{ width: `${(d.count / total) * 100}%`, backgroundColor: d.color }}
            title={`${d.label}: ${fmtNum(d.count)} (${fmtPct((d.count / total) * 100)})`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
        {filtered.map(d => (
          <div key={d.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-sm text-gray-600">{d.label}</span>
            <span className="text-sm font-bold text-gray-800 ml-0.5">{fmtNum(d.count)}</span>
            <span className="text-xs text-gray-400">({fmtPct((d.count / total) * 100)})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
