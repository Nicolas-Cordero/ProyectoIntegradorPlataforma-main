import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  children: ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <div className="rounded-xl bg-white" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
      <div className="p-6">
        <p className="text-base font-bold text-gray-800 mb-4">{title}</p>
        {children}
      </div>
    </div>
  );
}
