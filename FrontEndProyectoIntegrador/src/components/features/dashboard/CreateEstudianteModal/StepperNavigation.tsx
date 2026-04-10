import React from 'react';
import { Box, Button, DialogActions } from '@mui/material';

interface StepperNavigationProps {
    activeStep: number;
    totalSteps: number;
    loading: boolean;
    onBack: () => void;
    onNext: () => void;
    onCancel: () => void;
    onSubmit: () => void;
}

export const StepperNavigation: React.FC<StepperNavigationProps> = ({
    activeStep,
    totalSteps,
    loading,
    onBack,
    onNext,
    onCancel,
    onSubmit
}) => {
    const isLastStep = activeStep === totalSteps - 1;

    return (
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
            <Box>
                {activeStep > 0 && (
                    <Button onClick={onBack} disabled={loading}>
                        Atrás
                    </Button>
                )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={onCancel} color="inherit" disabled={loading}>
                    Cancelar
                </Button>

                {isLastStep ? (
                    <Button
                        onClick={onSubmit}
                        variant="contained"
                        disabled={loading}
                        sx={{
                            bgcolor: 'var(--color-turquoise)',
                            '&:hover': {
                                bgcolor: 'var(--color-turquoise-dark)'
                            }
                        }}
                    >
                        {loading ? 'Guardando...' : 'Crear Estudiante'}
                    </Button>
                ) : (
                    <Button
                        onClick={onNext}
                        variant="contained"
                        sx={{
                            bgcolor: 'var(--color-turquoise)',
                            '&:hover': {
                                bgcolor: 'var(--color-turquoise-dark)'
                            }
                        }}
                    >
                        Siguiente
                    </Button>
                )}
            </Box>
        </DialogActions>
    );
};
