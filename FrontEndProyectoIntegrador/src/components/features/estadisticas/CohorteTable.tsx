import type { EstadoEstudiante } from '../../../types';
import { fmtNum, fmtPct, ESTADO_COLORS, ESTADO_LABELS } from './shared';
import type { CohorteRow } from './shared';

interface CohorteTableProps {
  presentStates: EstadoEstudiante[];
  rows: CohorteRow[];
}

export function CohorteTable({ presentStates, rows }: CohorteTableProps) {
  if (rows.length === 0) return <p className="text-sm text-gray-400">Sin datos de cohortes.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 pr-4 font-semibold text-gray-600 whitespace-nowrap">Cohorte</th>
            <th className="text-right py-2 px-2 font-semibold text-gray-600 whitespace-nowrap">Total</th>
            {presentStates.map(est => (
              <th
                key={est}
                className="text-right py-2 px-2 font-semibold whitespace-nowrap"
                style={{ color: ESTADO_COLORS[est] }}
              >
                {ESTADO_LABELS[est]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ año, total, counts }) => (
            <tr key={año} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td className="py-2 pr-4 font-bold text-gray-800">{año}</td>
              <td className="py-2 px-2 text-right font-semibold text-gray-700">{fmtNum(total)}</td>
              {presentStates.map(est => {
                const count = counts[est] ?? 0;
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <td key={est} className="py-2 px-2 text-right">
                    {count > 0 ? (
                      <>
                        <span className="font-semibold text-gray-800">{fmtNum(count)}</span>
                        <span className="text-xs text-gray-400 ml-1">({fmtPct(pct)})</span>
                      </>
                    ) : (
                      <span className="text-gray-300">–</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
