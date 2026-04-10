import React from 'react';
import { Box, Table, TableBody, TableContainer, Paper } from '@mui/material';
import type { Estudiante } from '../../../types';
import { SectionDivider, EditableField, EditableTextarea } from './components';
import { personalDataConfig, type FieldConfig } from './config/personalDataFields';
import { 
  getEstudianteEmail,
  getEstudianteTelefono,
  getEstudianteDireccion
} from '../../../utils/migration-helpers';

interface PersonalDataSectionProps {
  estudiante: Estudiante;
  modoEdicion: boolean;
  onCampoChange?: (campo: string, valor: any) => void;
}

export const PersonalDataSection: React.FC<PersonalDataSectionProps> = ({ 
  estudiante, 
  modoEdicion,
  onCampoChange 
}) => {
  const getFieldValue = (field: FieldConfig): string => {
    let value: any = '';

    // Normalizar informacionAcademica: la relación puede venir como array por el mapeo de TypeORM
    const infoAcad = Array.isArray(estudiante.informacionAcademica)
      ? estudiante.informacionAcademica[0]
      : estudiante.informacionAcademica;
    
    // Campos especiales de informacion_contacto (migrados)
    if (field.key === 'email') {
      value = getEstudianteEmail(estudiante);
    } else if (field.key === 'telefono') {
      value = getEstudianteTelefono(estudiante);
    } else if (field.key === 'direccion') {
      value = getEstudianteDireccion(estudiante);
    } else if (field.source === 'root') {
      value = estudiante[field.key as keyof Estudiante];
    } else if (field.source === 'informacionAcademica') {
      value = infoAcad?.[field.key as keyof typeof infoAcad];
    } else if (field.source === 'institucion') {
      if (field.key === 'institucion_nombre') {
        value = estudiante.institucion?.nombre;
      } else {
        value = estudiante.institucion?.[field.key as keyof typeof estudiante.institucion];
      }
    }
    
    // Formatear fecha si es necesario
    if (field.type === 'date' && value) {
      value = typeof value === 'string' 
        ? value.split('T')[0]
        : new Date(value).toISOString().split('T')[0];
    }
    
    // Convertir a string si es necesario
    return value !== null && value !== undefined ? String(value) : '';
  };

  // Handler para cambios en inputs - Solo notifica al padre
  const handleFieldChange = (campo: string, valor: any) => {
    console.log(`📝 PersonalDataSection - Cambiando campo: ${campo}, valor:`, valor);
    
    // Notificar al componente padre
    if (onCampoChange) {
      onCampoChange(campo, valor);
    }
  };

  // Helpers para renders especiales
  const calcularEdad = (fechaNacimiento?: Date | string) => {
    if (!fechaNacimiento) return 'Sin definir';
    const fecha = typeof fechaNacimiento === 'string' ? new Date(fechaNacimiento) : fechaNacimiento;
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
      edad--;
    }
    return edad.toString();
  };

  // Nota: PAES ahora se trata como texto plano (sin formatear) para evitar sobrescrituras al tipear

  const getTrayectoriaAcademica = () => {
    const historiales = estudiante.historialesAcademicos;
    if (!historiales || historiales.length === 0) return 'Sin definir';
    
    const trayectorias = historiales
      .flatMap(h => h.trayectoria_academica || [])
      .filter(Boolean);
    
    return trayectorias.length > 0 ? trayectorias.join(', ') : 'Sin definir';
  };

  const getBeneficiosInfo = () => {
    const infoAcad = Array.isArray(estudiante.informacionAcademica)
      ? estudiante.informacionAcademica[0]
      : estudiante.informacionAcademica;
    return infoAcad?.beneficios || 'Sin definir';
  };

  // Función para renderizar campos según configuración
  const renderField = (field: FieldConfig) => {
    const value = getFieldValue(field);
    
    // Campos con render especial
    if (field.customRender === 'textarea') {
      return (
        <EditableTextarea
          key={field.key}
          label={field.label}
          value={value}
          modoEdicion={modoEdicion}
          onChange={(val) => handleFieldChange(field.key, val)}
          placeholder={field.placeholder || `Agregar ${field.label.toLowerCase()}...`}
        />
      );
    }

    if (field.computed) {
      if (field.key === 'edad') {
        return (
          <EditableField
            key={field.key}
            label={field.label}
            value={calcularEdad(estudiante.fecha_de_nacimiento)}
            modoEdicion={false}
            onChange={() => {}}
            readOnly
          />
        );
      }
    }

    if (field.customRender === 'trayectoria') {
      return (
        <EditableField
          key={field.key}
          label={field.label}
          value={getTrayectoriaAcademica()}
          modoEdicion={false}
          onChange={() => {}}
          readOnly
        />
      );
    }

    if (field.key === 'beneficios') {
      return (
        <EditableField
          key={field.key}
          label={field.label}
          value={getBeneficiosInfo()}
          modoEdicion={false}
          onChange={() => {}}
          readOnly
        />
      );
    }

    // Campo normal
    return (
      <EditableField
        key={field.key}
        label={field.label}
        value={value}
        type={field.type}
        modoEdicion={modoEdicion && !field.readOnly}
        onChange={(val) => handleFieldChange(field.key, val)}
        options={field.options}
        placeholder={field.placeholder}
        maxLength={field.maxLength}
        inputMode={field.inputMode}
        readOnly={field.readOnly}
      />
    );
  };

  return (
    <>
      {personalDataConfig.map((section) => (
        <Box key={section.id} sx={{ mb: 4 }}>
          {section.titulo && <SectionDivider titulo={section.titulo} />}
          <TableContainer component={Paper} elevation={2}>
            <Table size="small">
              <TableBody>
                {section.campos.map(field => renderField(field))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </>
  );
};
