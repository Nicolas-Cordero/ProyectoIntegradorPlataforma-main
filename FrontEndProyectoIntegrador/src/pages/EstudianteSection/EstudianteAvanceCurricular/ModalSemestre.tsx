import { Modal, Input, Select, Alert } from '../../../components/ui';
import type { TipoSemestre } from '../../../services/semestre-avance.service';
import type { CodigoSemUI } from './types';

export interface FormSemestre {
  year: number;
  tipo: TipoSemestre;
  codigo: CodigoSemUI;
}

interface ModalSemestreProps {
  abierto: boolean;
  onCerrar: () => void;
  form: FormSemestre;
  setForm: (fn: (f: FormSemestre) => FormSemestre) => void;
  hayRegularCerrado: boolean;
  error: string;
  guardando: boolean;
  onGuardar: () => void;
}

export function ModalSemestre({
  abierto, onCerrar, form, setForm, hayRegularCerrado, error, guardando, onGuardar,
}: ModalSemestreProps) {
  return (
    <Modal
      titulo="Nuevo semestre"
      abierto={abierto}
      onCerrar={onCerrar}
      tamanio="sm"
      acciones={
        <div className="flex gap-2 justify-end w-full">
          <button onClick={onCerrar} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={onGuardar}
            disabled={guardando}
            className="px-4 py-2 text-sm rounded-lg bg-[#65B39B] text-white font-semibold hover:bg-[#4a9e87] disabled:opacity-50 transition-colors"
          >
            {guardando ? 'Guardando…' : 'Agregar'}
          </button>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        {error && <Alert tipo="error" mensaje={error} />}
        <Input
          etiqueta="Año"
          tipo="number"
          valor={form.year}
          onChange={v => setForm(f => ({ ...f, year: Number(v) || f.year }))}
        />
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Tipo</p>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="tipoSem" checked={form.tipo === 'REGULAR'}
                onChange={() => setForm(f => ({ ...f, tipo: 'REGULAR', codigo: '1' }))}
                className="accent-[#65B39B] w-4 h-4"
              />
              <span className="text-sm text-gray-700">Regular</span>
            </label>
            <label className={`flex items-center gap-2 ${!hayRegularCerrado ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
              <input type="radio" name="tipoSem" checked={form.tipo === 'RECUPERATIVO'}
                disabled={!hayRegularCerrado}
                onChange={() => setForm(f => ({ ...f, tipo: 'RECUPERATIVO', codigo: 'INVIERNO' }))}
                className="accent-[#65B39B] w-4 h-4"
              />
              <span className="text-sm text-gray-700">Recuperativo</span>
            </label>
          </div>
          {!hayRegularCerrado && (
            <p className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Requiere al menos un semestre regular cerrado.
            </p>
          )}
        </div>
        {form.tipo === 'REGULAR' && (
          <Select
            etiqueta="Semestre"
            valor={form.codigo}
            onChange={v => setForm(f => ({ ...f, codigo: v as '1' | '2' }))}
            opciones={[
              { valor: '1', etiqueta: 'Primer semestre' },
              { valor: '2', etiqueta: 'Segundo semestre' },
            ]}
          />
        )}
        {form.tipo === 'RECUPERATIVO' && (
          <Select
            etiqueta="Período"
            valor={form.codigo}
            onChange={v => setForm(f => ({ ...f, codigo: v as 'INVIERNO' | 'VERANO' }))}
            opciones={[
              { valor: 'INVIERNO', etiqueta: 'Invierno' },
              { valor: 'VERANO',   etiqueta: 'Verano'   },
            ]}
          />
        )}
      </div>
    </Modal>
  );
}
