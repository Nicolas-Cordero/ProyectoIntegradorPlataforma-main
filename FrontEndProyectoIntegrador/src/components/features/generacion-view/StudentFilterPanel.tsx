const SELECT_CLASS =
  'text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#65B39B] focus:ring-1 focus:ring-[#65B39B] transition-colors flex-1 min-w-[140px]';

interface StudentFilterPanelProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedEstado: string;
  onEstadoChange: (value: string) => void;
  estados: string[];
}

export function StudentFilterPanel({
  searchTerm,
  onSearchChange,
  selectedEstado,
  onEstadoChange,
  estados,
}: StudentFilterPanelProps) {
  return (
    <div
      className="bg-white rounded-xl px-5 py-4 space-y-3"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
    >
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Búsqueda y filtros</p>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Nombre, apellido o RUT..."
          className="w-56 text-sm border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#65B39B] focus:ring-1 focus:ring-[#65B39B] transition-colors bg-gray-50 focus:bg-white"
        />
        <select
          value={selectedEstado}
          onChange={(e) => onEstadoChange(e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="">Todos los estados</option>
          {estados.map((estado) => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
