import { useState } from 'react';
import type { ReactNode } from 'react';

interface InfoCardProps {
  titulo: string;
  children: ReactNode;
  defaultExpanded?: boolean;
}

export function InfoCard({ titulo, children, defaultExpanded = false }: InfoCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
        aria-expanded={expanded}
      >
        <h2 className="text-lg font-bold text-gray-800">{titulo}</h2>
        <span
          className="text-gray-400 text-lg transition-transform duration-200"
          style={{ display: 'inline-block', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▾
        </span>
      </button>
      {expanded && (
        <div className="px-6 pb-5 pt-1 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}
