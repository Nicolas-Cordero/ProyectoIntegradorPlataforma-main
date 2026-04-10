import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  Box,
  Typography
} from '@mui/material';
import { estudianteService } from '../../../../services';
import { PersonalDataForm } from './PersonalDataForm';
import { StepperNavigation } from './StepperNavigation';

interface CreateEstudianteModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  generacion: number;
}

interface FormData {
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  fecha_de_nacimiento: string;
  tipo_de_estudiante: 'media' | 'universitario';
  generacion: string;
}

const INITIAL_FORM_STATE = (generacion: number): FormData => ({
  nombre: '',
  rut: '',
  email: '',
  telefono: '',
  fecha_de_nacimiento: '',
  tipo_de_estudiante: 'universitario',
  generacion: generacion.toString()
});

export const CreateEstudianteModal: React.FC<CreateEstudianteModalProps> = ({
  open,
  onClose,
  onSuccess,
  generacion
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE(generacion));

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Si cambia el tipo de estudiante a media, el sistema lo detecta
      // (en futuro se puede usar para crear institución de tipo Liceo automáticamente)
      return updated;
    });
  };

  const validateStep = (step: number): boolean => {
    setError('');

    if (step === 0) {
      if (!formData.nombre.trim()) {
        setError('El nombre es obligatorio');
        return false;
      }
      if (!formData.rut.trim()) {
        setError('El RUT es obligatorio');
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setError('Ingresa un email válido');
        return false;
      }
      if (!formData.telefono.trim()) {
        setError('El teléfono es obligatorio');
        return false;
      }
      if (!formData.fecha_de_nacimiento) {
        setError('La fecha de nacimiento es obligatoria');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const estudianteData = {
        nombre: formData.nombre,
        rut: formData.rut,
        email: formData.email,
        telefono: formData.telefono,
        fecha_de_nacimiento: formData.fecha_de_nacimiento,
        tipo_de_estudiante: formData.tipo_de_estudiante,
        generacion: formData.generacion
      };

      await estudianteService.create(estudianteData);

      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Error al crear estudiante:', err);
      setError(err.message || 'Error al crear el estudiante');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setFormData(INITIAL_FORM_STATE(generacion));
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Agregar Nuevo Estudiante - Generación {generacion}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <PersonalDataForm
            formData={{
              nombre: formData.nombre,
              rut: formData.rut,
              email: formData.email,
              telefono: formData.telefono,
              fecha_de_nacimiento: formData.fecha_de_nacimiento,
              tipo_de_estudiante: formData.tipo_de_estudiante
            }}
            onChange={handleFieldChange}
          />
        </Box>
      </DialogContent>

      <StepperNavigation
        activeStep={0}
        totalSteps={1}
        loading={loading}
        onBack={handleBack}
        onNext={handleNext}
        onCancel={handleClose}
        onSubmit={handleSubmit}
      />
    </Dialog>
  );
};
