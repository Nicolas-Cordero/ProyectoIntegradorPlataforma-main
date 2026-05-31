import { useState, useCallback } from 'react';
import { estudianteService, informacionContactoService } from '../../../../services';
import { logger } from '../../../../config';
import type { Estudiante } from '../../../../types';

interface UseEstudianteEditingProps {
    estudiante: Estudiante | null;
    id?: string;
}

export const useEstudianteEditing = ({ estudiante, id }: UseEstudianteEditingProps) => {
    const [datosEditados, setDatosEditados] = useState<Partial<Estudiante>>({});

    // Campos que pertenecen a la tabla Estudiante (sin email, telefono y direccion)
    const camposEstudiante = [
        'nombre', 'rut', 'genero',
        'fecha_de_nacimiento', 'tipo_de_estudiante', 'status', 'generacion',
        'numero_carrera', 'observaciones', 'status_detalle',
        'semestres_suspendidos', 'semestres_total_carrera'
    ];

    // Campos que pertenecen a informacion_contacto
    const camposContacto = ['email', 'telefono', 'direccion'];

    const handleCampoChange = useCallback((campo: string, valor: any) => {
        setDatosEditados(prev => ({
            ...prev,
            [campo]: valor
        }));
        logger.log(`📝 Estudiante - Campo editado: ${campo} =`, valor);
    }, []);

    const guardarCambios = async (): Promise<void> => {
        if (!id || Object.keys(datosEditados).length === 0) return;

        const datosEstudiante: any = {};
        const datosContacto: any = {};

        // Separar los datos según su tabla
        Object.keys(datosEditados).forEach(campo => {
            if (camposEstudiante.includes(campo)) {
                datosEstudiante[campo] = (datosEditados as any)[campo];
            } else if (camposContacto.includes(campo)) {
                datosContacto[campo] = (datosEditados as any)[campo];
            }
        });

        // Guardar datos del estudiante si hay cambios
        if (Object.keys(datosEstudiante).length > 0) {
            await estudianteService.update(id, datosEstudiante);
            logger.log('✅ Datos del estudiante actualizados');
        }

        // Guardar datos de contacto si hay cambios
        if (Object.keys(datosContacto).length > 0) {
            try {
                await informacionContactoService.upsertByEstudiante(id, datosContacto);
                logger.log('✅ Datos de contacto actualizados');
            } catch (error) {
                logger.error('❌ Error al actualizar datos de contacto:', error);
                throw error;
            }
        }
    };

    const limpiarCambios = () => {
        setDatosEditados({});
    };

    // Obtener datos combinados (originales + ediciones)
    const getDatosCombinados = () => {
        if (!estudiante) return null;

        const cambiosEstudiante: any = {};
        Object.keys(datosEditados).forEach(campo => {
            if (camposEstudiante.includes(campo) || camposContacto.includes(campo)) {
                cambiosEstudiante[campo] = (datosEditados as any)[campo];
            }
        });

        return {
            ...estudiante,
            ...cambiosEstudiante
        };
    };

    const hayCambios = Object.keys(datosEditados).some(campo =>
        camposEstudiante.includes(campo) || camposContacto.includes(campo)
    );

    return {
        datosEditados,
        hayCambios,
        handleCampoChange,
        guardarCambios,
        limpiarCambios,
        getDatosCombinados
    };
};
