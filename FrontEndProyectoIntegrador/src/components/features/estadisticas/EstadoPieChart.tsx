import { PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, ResponsiveContainer } from 'recharts';
import { fmtNum, fmtPct } from './shared';
import type { PieItem } from './shared';

function PieTooltip({ active, payload }: { active?: boolean; payload?: { payload: PieItem }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-gray-800">{d.label}</p>
      <p className="text-gray-600">
        {fmtNum(d.count)}{' '}
        <span className="text-gray-400">({fmtPct(d.pct)})</span>
      </p>
    </div>
  );
}

export function EstadoPieChart({ data }: { data: PieItem[] }) {
  if (data.length === 0) return <p className="text-sm text-gray-400">Sin datos de estado.</p>;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={2}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <ReTooltip content={<PieTooltip />} />
        <Legend formatter={(value) => <span className="text-sm text-gray-600">{value}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}
