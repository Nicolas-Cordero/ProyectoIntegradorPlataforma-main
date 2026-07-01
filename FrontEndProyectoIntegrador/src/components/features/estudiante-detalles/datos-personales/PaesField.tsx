import { useState, useRef } from 'react';
import type { UpdatePaesDto } from '../../../../services/paes.service';

type PaesFieldKey = keyof UpdatePaesDto;

interface PaesFieldProps {
  label: string;
  value: number | undefined | null;
  paesKey?: PaesFieldKey;
  editable?: boolean;
  onSave?: (key: PaesFieldKey, value: string) => Promise<boolean>;
}

export function PaesField({ label, value, paesKey, editable, onSave }: PaesFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [displayOverride, setDisplayOverride] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const baseValue = displayOverride ?? (value !== null && value !== undefined ? String(value) : 'No especificado');

  const startEdit = () => {
    if (!editable || !paesKey) return;
    setDraft(value !== null && value !== undefined ? String(value) : '');
    setEditing(true);
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);
  };

  const save = async () => {
    if (!paesKey || !onSave) { setEditing(false); return; }
    const ok = await onSave(paesKey, draft);
    if (ok) setDisplayOverride(draft || 'No especificado');
    setEditing(false);
  };

  const cancel = () => {
    setEditing(false);
    setDraft('');
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); save(); }
    if (e.key === 'Escape') cancel();
  };

  return (
    <div className="py-3 grid grid-cols-[210px_1fr] gap-4 items-center border-b border-gray-50 last:border-0 group">
      <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">{label}</span>
      {editing && paesKey ? (
        <input
          ref={inputRef}
          type="number"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={onKeyDown}
          className="text-base border-2 border-[#65B39B] rounded-md px-2 py-1.5 focus:outline-none w-full max-w-xs"
        />
      ) : (
        <span
          onDoubleClick={startEdit}
          title={editable ? 'Doble clic para editar' : undefined}
          className={`text-base font-semibold text-gray-800 select-none ${
            editable
              ? 'cursor-pointer rounded px-1 -mx-1 group-hover:bg-[#65B39B]/10 group-hover:text-[#3a7a6b] transition-colors'
              : ''
          }`}
        >
          {baseValue}
        </span>
      )}
    </div>
  );
}
