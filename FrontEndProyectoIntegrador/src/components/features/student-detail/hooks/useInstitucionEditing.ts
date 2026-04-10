import { useState, useCallback } from 'react';
import { institucionService, estudianteService } from '../../../../services';
import { logger } from '../../../../config';
import type { Estudiante, Institucion } from '../../../../types';

interface UseInstitucionEditingProps {
    estudiante: Estudiante | null;
}

export const useInstitucionEditing = ({ estudiante }: UseInstitucionEditingProps) => {
    const [datosInstitucionEditados, setDatosInstitucionEditados] = useState<Partial<Institucion>>({});

    const camposInstitucion = [
        'carrera_especialidad', 'duracion', 'nombre', 'tipo_institucion',
        'nivel_educativo', 'anio_de_ingreso', 'anio_de_egreso'
    ];

    const handleInstitucionChange = useCallback((campo: string, valor: any) => {
        setDatosInstitucionEditados(prev => ({
            ...prev,
            [campo]: valor
        }));
        logger.log(`📝 Institucion - Campo editado: ${campo} =`, valor);
    }, []);

    const guardarCambios = async (): Promise<void> => {
        const institucionId = estudiante?.institucion?.id_institucion;
        const estudianteId = estudiante?.id_estudiante || (estudiante as any)?.id;

        if (!estudianteId) {
            logger.warn('⚠️ No hay id de estudiante, no se pueden guardar datos de institución');
            return;
        }

        if (Object.keys(datosInstitucionEditados).length === 0) {
            logger.log('⚠️ No hay cambios en institución para guardar');
            return;
        }

        const datosInstitucion: any = {};

        // Filtrar solo los campos de la institución
        Object.keys(datosInstitucionEditados).forEach(campo => {
            if (camposInstitucion.includes(campo)) {
                const valor = (datosInstitucionEditados as any)[campo];
                datosInstitucion[campo] = valor;
            }
        });

        if (Object.keys(datosInstitucion).length === 0) return;

        if (institucionId) {
            // Actualizar institución existente
            await institucionService.update(institucionId, datosInstitucion);
            logger.log('✅ Datos de la institución actualizados');
        } else {
            // Crear nueva institución y asociarla al estudiante con la clave esperada por el backend
            const nueva = await institucionService.create(datosInstitucion);
            await estudianteService.update(estudianteId, { id_institucion: nueva.id_institucion });
            logger.log('✅ Institución creada y asociada al estudiante');
        }
    };

    const limpiarCambios = () => {
        setDatosInstitucionEditados({});
    };

    // Obtener datos combinados (originales + ediciones)
    const getDatosCombinados = (): Institucion | undefined => {
        const cambiosInstitucion: any = {};
        Object.keys(datosInstitucionEditados).forEach(campo => {
            if (camposInstitucion.includes(campo)) {
                cambiosInstitucion[campo] = (datosInstitucionEditados as any)[campo];
            }
        });

        // Si no hay institución original pero hay cambios, retornar solo los cambios
        if (!estudiante?.institucion && Object.keys(cambiosInstitucion).length > 0) {
            return cambiosInstitucion as Institucion;
        }

        // Si hay institución original, combinarla con los cambios
        if (estudiante?.institucion) {
            return {
                ...estudiante.institucion,
                ...cambiosInstitucion
            };
        }

        // Si no hay institución ni cambios, retornar undefined
        return undefined;
    };

    const hayCambios = Object.keys(datosInstitucionEditados).some(campo =>
        camposInstitucion.includes(campo)
    );

    return {
        datosInstitucionEditados,
        hayCambios,
        handleInstitucionChange,
        guardarCambios,
        limpiarCambios,
        getDatosCombinados
    };
};
