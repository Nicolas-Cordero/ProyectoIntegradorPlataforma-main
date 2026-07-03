import { useEffect, useState } from 'react';

interface DuracionHmsInputProps {
  totalSegundos: number;
  onChange: (totalSegundos: number) => void;
  disabled?: boolean;
  etiqueta?: string;
}

const CASILLA_CLASS =
  'w-16 text-center border border-gray-300 rounded px-2 py-2 text-base focus:outline-none focus:ring-1 focus:ring-[#65B39B]';

/** Input de duración en tres casillas horas:minutos:segundos, sincronizadas con un total en segundos. */
export function DuracionHmsInput({ totalSegundos, onChange, disabled, etiqueta = 'Duración' }: DuracionHmsInputProps) {
  const [horas, setHoras] = useState(String(Math.floor(totalSegundos / 3600)));
  const [minutos, setMinutos] = useState(String(Math.floor((totalSegundos % 3600) / 60)));
  const [segundos, setSegundos] = useState(String(totalSegundos % 60));

  // Re-sincroniza las casillas cuando el total cambia por una razón externa
  // (ej. al abrir el modal con un valor inicial distinto).
  useEffect(() => {
    setHoras(String(Math.floor(totalSegundos / 3600)));
    setMinutos(String(Math.floor((totalSegundos % 3600) / 60)));
    setSegundos(String(totalSegundos % 60));
  }, [totalSegundos]);

  const emitirCambio = (h: string, m: string, s: string) => {
    const hh = Math.max(0, parseInt(h, 10) || 0);
    const mm = Math.max(0, parseInt(m, 10) || 0);
    const ss = Math.max(0, parseInt(s, 10) || 0);
    onChange(hh * 3600 + mm * 60 + ss);
  };

  return (
    <div>
      <label className="block text-base font-medium text-gray-600 mb-1">{etiqueta}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={0}
          value={horas}
          onChange={(e) => { setHoras(e.target.value); emitirCambio(e.target.value, minutos, segundos); }}
          disabled={disabled}
          className={CASILLA_CLASS}
          aria-label="Horas"
        />
        <span className="text-gray-400 font-semibold">:</span>
        <input
          type="number"
          min={0}
          max={59}
          value={minutos}
          onChange={(e) => { setMinutos(e.target.value); emitirCambio(horas, e.target.value, segundos); }}
          disabled={disabled}
          className={CASILLA_CLASS}
          aria-label="Minutos"
        />
        <span className="text-gray-400 font-semibold">:</span>
        <input
          type="number"
          min={0}
          max={59}
          value={segundos}
          onChange={(e) => { setSegundos(e.target.value); emitirCambio(horas, minutos, e.target.value); }}
          disabled={disabled}
          className={CASILLA_CLASS}
          aria-label="Segundos"
        />
        <span className="text-gray-400 text-sm ml-1">hh : mm : ss</span>
      </div>
    </div>
  );
}
