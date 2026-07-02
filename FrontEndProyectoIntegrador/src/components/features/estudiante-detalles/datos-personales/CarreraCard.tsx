import { useState, useEffect } from 'react';
import { InfoCard } from '../InfoCard';
import { InlineField } from './InlineField';
import { Select } from '../../../ui';
import type { Carrera } from '../../../../types';

interface CarreraCardProps {
  carreras: Carrera[] | undefined;
  rutEstudiante: string;
}

// Solo lectura a propósito: la carrera se administra desde Avance Curricular,
// no desde esta página, por lo que ningún InlineField aquí recibe `editable` ni `onSave`.
export function CarreraCard({ carreras: carrerasProp, rutEstudiante }: CarreraCardProps) {
  const carreras = carrerasProp ?? [];
  const [codigoSeleccionado, setCodigoSeleccionado] = useState<number | null>(carreras[0]?.codigo_carrera ?? null);

  useEffect(() => {
    setCodigoSeleccionado(carrerasProp?.[0]?.codigo_carrera ?? null);
  }, [rutEstudiante]);

  const carreraActual = carreras.find(c => c.codigo_carrera === codigoSeleccionado) ?? carreras[0] ?? null;

  return (
    <InfoCard titulo="Carrera">
      {carreraActual ? (
        <>
          {carreras.length > 1 && (
            <div className="pb-4 mb-1 border-b border-gray-100 max-w-xs">
              <Select
                etiqueta="Carrera"
                valor={codigoSeleccionado ?? ''}
                onChange={v => setCodigoSeleccionado(Number(v))}
                opciones={carreras.map(c => ({ valor: c.codigo_carrera, etiqueta: c.nombre }))}
                tamano="small"
              />
            </div>
          )}
          <InlineField label="Nombre"         value={carreraActual.nombre}                    readOnly />
          <InlineField label="Institución"    value={carreraActual.universidad?.nombre}       readOnly />
          <InlineField label="Año de Ingreso" value={carreraActual.anio_ingreso}               readOnly />
          <InlineField label="Duración"       value={`${carreraActual.duracion_sem} semestres`} readOnly />
          <InlineField label="Estado"         value={carreraActual.estado}                    readOnly />
        </>
      ) : (
        <p className="text-sm text-gray-400 italic">Sin carrera registrada</p>
      )}
    </InfoCard>
  );
}
