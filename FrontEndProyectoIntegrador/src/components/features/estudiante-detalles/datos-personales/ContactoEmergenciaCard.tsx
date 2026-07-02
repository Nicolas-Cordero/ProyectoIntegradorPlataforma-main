import { InfoCard } from '../InfoCard';
import { InlineField } from './InlineField';
import type { Familiar } from '../../../../types';

interface ContactoEmergenciaCardProps {
  contacto: Familiar | null;
}

export function ContactoEmergenciaCard({ contacto }: ContactoEmergenciaCardProps) {
  return (
    <InfoCard titulo="Contacto de Emergencia">
      {contacto ? (
        <>
          <InlineField label="Nombre"      value={contacto.nombre}      readOnly />
          <InlineField label="Parentesco"  value={contacto.parentesco}  readOnly />
          <InlineField label="Teléfono"    value={contacto.telefono}    readOnly />
          {contacto.observacion && (
            <InlineField label="Observación" value={contacto.observacion} readOnly />
          )}
        </>
      ) : (
        <p className="text-sm text-gray-400 italic">Sin contacto de emergencia designado</p>
      )}
    </InfoCard>
  );
}
