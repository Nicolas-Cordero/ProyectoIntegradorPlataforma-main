import type { ElementType } from 'react';
import { fmtNum } from './shared';

interface KpiCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: ElementType;
  color: string;
  bg: string;
}

export function KpiCard({ label, value, subtitle, icon: Icon, color, bg }: KpiCardProps) {
  const display = typeof value === 'number' ? fmtNum(value) : value;
  return (
    <div
      className="rounded-xl bg-white border border-black/5"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
      role="region"
      aria-label={`${label}: ${display}`}
    >
      <div className="flex flex-col gap-3 p-5">
        <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg }}>
          <Icon style={{ color, fontSize: 24 }} />
        </div>
        <p className="text-[2.125rem] font-extrabold text-gray-800 leading-none">{display}</p>
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
