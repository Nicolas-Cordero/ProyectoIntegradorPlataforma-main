import { useState, useCallback } from 'react';
import { informacionAcademicaService } from '../../../../services';
import { logger } from '../../../../config';
import type { Estudiante, InformacionAcademica } from '../../../../types';

interface UseAcademicEditingProps {
    estudiante: Estudiante | null;
}

/**
 * Hook especializado para edición de información académica
 * Maneja campos como: promedios, puntajes, colegio, beneficios, etc.
 */
export const useAcademicEditing = ({ estudiante }: UseAcademicEditingProps) => {
    const [datosAcademicosEditados, setDatosAcademicosEditados] = useState<Partial<InformacionAcademica>>({});

    // Campos que pertenecen a información académica
    const camposInfoAcademica = [
        'año_ingreso_beca', 'colegio', 'especialidad_colegio',
        'comuna_colegio', 'via_acceso', 'beneficios',
        'promedio_1', 'promedio_2', 'promedio_3', 'promedio_4',
        'puntajes_paes', 'puntajes_admision', 'ensayos_paes', 'trayectoria_academica'
    ];

    // Handler para cambios en campos académicos
    const handleCampoChange = useCallback((campo: string, valor: any) => {
        setDatosAcademicosEditados(prev => ({
            ...prev,
            [campo]: valor
        }));
        logger.log(`🎓 Académico - Campo editado: ${campo} =`, valor);
    }, []);

    // Guardar cambios académicos
    const guardarCambios = async (): Promise<void> => {
        const estudianteId = estudiante?.id_estudiante || (estudiante as any)?.id;
        if (!estudianteId || Object.keys(datosAcademicosEditados).length === 0) return;

        const datosInfoAcademica: any = {};

        // Filtrar solo los campos académicos
        Object.keys(datosAcademicosEditados).forEach(campo => {
            if (camposInfoAcademica.includes(campo)) {
                datosInfoAcademica[campo] = (datosAcademicosEditados as any)[campo];
            }
        });

        if (Object.keys(datosInfoAcademica).length === 0) return;

        // Convertir año_ingreso_beca a número si existe
        if (datosInfoAcademica.año_ingreso_beca !== undefined) {
            const valor = parseInt(datosInfoAcademica.año_ingreso_beca);
            datosInfoAcademica.año_ingreso_beca = isNaN(valor) ? null : valor;
        }

        // Convertir promedios a número
        ['promedio_1', 'promedio_2', 'promedio_3', 'promedio_4'].forEach(campo => {
            if (datosInfoAcademica[campo] !== undefined) {
                const valor = parseFloat(datosInfoAcademica[campo]);
                datosInfoAcademica[campo] = isNaN(valor) ? null : valor;
            }
        });

        // Convertir puntajes_paes a puntajes_admision (compatibilidad backend)
        if (datosInfoAcademica.puntajes_paes !== undefined) {
            datosInfoAcademica.puntajes_admision = {
                descripcion: datosInfoAcademica.puntajes_paes
            };
            delete datosInfoAcademica.puntajes_paes;
        }

        // Limpiar valores vacíos para evitar 500 del backend
        Object.keys(datosInfoAcademica).forEach((k) => {
            const v = datosInfoAcademica[k];
            const isEmptyObj = v && typeof v === 'object' && Object.keys(v).length === 0;
            if (v === '' || v === undefined || v === null || isEmptyObj) {
                delete datosInfoAcademica[k];
            }
        });

        if (Object.keys(datosInfoAcademica).length === 0) return;

        // Usar el servicio para actualizar
        await informacionAcademicaService.upsertByEstudiante(estudianteId, datosInfoAcademica);
        logger.log('✅ Información académica actualizada');
    };

    // Limpiar cambios temporales
    const limpiarCambios = () => {
        setDatosAcademicosEditados({});
    };

    // Obtener datos combinados (originales + ediciones)
    const getDatosCombinados = () => {
        // Permitir mostrar ediciones aunque no exista registro previo en informacionAcademica
        const base = Array.isArray(estudiante?.informacionAcademica)
            ? estudiante?.informacionAcademica[0]
            : estudiante?.informacionAcademica;

        const cambiosAcademicos: any = {};
        Object.keys(datosAcademicosEditados).forEach(campo => {
            if (camposInfoAcademica.includes(campo)) {
                cambiosAcademicos[campo] = (datosAcademicosEditados as any)[campo];
            }
        });

        if (!base && Object.keys(cambiosAcademicos).length === 0) {
            return null;
        }

        return {
            ...(base || {}),
            ...cambiosAcademicos
        };
    };

    const hayCambios = Object.keys(datosAcademicosEditados).some(campo =>
        camposInfoAcademica.includes(campo)
    );

    return {
        datosAcademicosEditados,
        hayCambios,
        handleCampoChange,
        guardarCambios,
        limpiarCambios,
        getDatosCombinados
    };
};
