/**
 * Modal para crear nuevo semestre
 */
import { Box } from '@mui/material';
import { Modal, Input, Select, Button } from '../../../ui';

interface NuevoSemestreData {
  año: number;
  semestre: number;
  nivel_educativo: string;
  ramos_aprobados: number;
  ramos_reprobados: number;
  ramos_eliminados: number;
  promedio_semestre: number;
  trayectoria_academica: any[];
}

interface NuevoSemestreModalProps {
  open: boolean;
  onClose: () => void;
  nuevoSemestreData: NuevoSemestreData;
  setNuevoSemestreData: React.Dispatch<React.SetStateAction<NuevoSemestreData>>;
  onCrearSemestre: () => void;
}

export function NuevoSemestreModal({ 
  open, 
  onClose, 
  nuevoSemestreData, 
  setNuevoSemestreData, 
  onCrearSemestre 
}: NuevoSemestreModalProps) {
  const SEMESTRES = [
    { valor: '1', etiqueta: 'Primer Semestre' },
    { valor: '2', etiqueta: 'Segundo Semestre' }
  ];

  return (
    <Modal
      titulo="➕ Crear Nuevo Semestre"
      abierto={open}
      onCerrar={onClose}
      tamanio="sm"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Input
            etiqueta="Año"
            tipo="number"
            valor={String(nuevoSemestreData.año)}
            onChange={(v) => setNuevoSemestreData(prev => ({
              ...prev,
              año: parseInt(v) || new Date().getFullYear()
            }))}
            requerido
          />

          <Select
            etiqueta="Semestre"
            opciones={SEMESTRES}
            valor={String(nuevoSemestreData.semestre)}
            onChange={(v) => setNuevoSemestreData(prev => ({
              ...prev,
              semestre: parseInt(v as string)
            }))}
            requerido
          />
        </Box>

        <Input
          etiqueta="Nivel Educativo"
          valor={nuevoSemestreData.nivel_educativo}
          onChange={(v) => setNuevoSemestreData(prev => ({
            ...prev,
            nivel_educativo: v
          }))}
          placeholder="Ej: Superior, Media, Técnico"
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
          <Input
            etiqueta="Ramos Aprobados"
            tipo="number"
            valor={String(nuevoSemestreData.ramos_aprobados)}
            onChange={(v) => setNuevoSemestreData(prev => ({
              ...prev,
              ramos_aprobados: parseInt(v) || 0
            }))}
          />

          <Input
            etiqueta="Ramos Reprobados"
            tipo="number"
            valor={String(nuevoSemestreData.ramos_reprobados)}
            onChange={(v) => setNuevoSemestreData(prev => ({
              ...prev,
              ramos_reprobados: parseInt(v) || 0
            }))}
          />

          <Input
            etiqueta="Ramos Eliminados"
            tipo="number"
            valor={String(nuevoSemestreData.ramos_eliminados)}
            onChange={(v) => setNuevoSemestreData(prev => ({
              ...prev,
              ramos_eliminados: parseInt(v) || 0
            }))}
          />
        </Box>

        <Input
          etiqueta="Promedio del Semestre"
          tipo="number"
          valor={String(nuevoSemestreData.promedio_semestre)}
          onChange={(v) => setNuevoSemestreData(prev => ({
            ...prev,
            promedio_semestre: parseFloat(v) || 0
          }))}
          placeholder="Ej: 5.5"
        />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
          <Button variante="outline" tamano="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button variante="primary" tamano="md" onClick={onCrearSemestre}>
            Crear Semestre
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
