import { useState, useCallback } from 'react';
import { familiaService } from '../../../../services';
import { logger } from '../../../../config';
import type { Estudiante } from '../../../../types';

interface UseFamiliaEditingProps {
    estudiante: Estudiante | null;
}

export const useFamiliaEditing = ({ estudiante }: UseFamiliaEditingProps) => {
    const [datosFamiliaEditados, setDatosFamiliaEditados] = useState<Record<string, any>>({});

    const handleFamiliaChange = useCallback((campo: string, valor: any) => {
        setDatosFamiliaEditados(prev => ({
            ...prev,
            [campo]: valor
        }));
        logger.log(`👨‍👩‍👧‍👦 Familia - Campo editado: ${campo} =`, valor);
    }, []);

    const guardarCambios = async (): Promise<void> => {
        const familiaId = estudiante?.familia?.id_familia;
        if (!familiaId || Object.keys(datosFamiliaEditados).length === 0) return;

        const familiaPayload: any = {};

        if (datosFamiliaEditados.nombre_madre !== undefined) {
            familiaPayload.nombre_madre = datosFamiliaEditados.nombre_madre;
        }
        if (datosFamiliaEditados.nombre_padre !== undefined) {
            familiaPayload.nombre_padre = datosFamiliaEditados.nombre_padre;
        }
        if (datosFamiliaEditados.hermanos !== undefined) {
            familiaPayload.hermanos = datosFamiliaEditados.hermanos;
        }
        if (datosFamiliaEditados.otros_familiares !== undefined) {
            familiaPayload.otros_familiares = datosFamiliaEditados.otros_familiares;
        }
        if (datosFamiliaEditados.observaciones_hermanos !== undefined) {
            familiaPayload.observaciones_hermanos = datosFamiliaEditados.observaciones_hermanos;
        }
        if (datosFamiliaEditados.observaciones_otros_familiares !== undefined) {
            familiaPayload.observaciones_otros_familiares = datosFamiliaEditados.observaciones_otros_familiares;
        }
        if (datosFamiliaEditados.observaciones !== undefined) {
            familiaPayload.observaciones = datosFamiliaEditados.observaciones;
        }

        // Manejar descripciones incrementales (arrays)
        if (datosFamiliaEditados.descripcion_madre !== undefined) {
            familiaPayload.descripcion_madre = Array.isArray(datosFamiliaEditados.descripcion_madre)
                ? datosFamiliaEditados.descripcion_madre
                : [datosFamiliaEditados.descripcion_madre];
        }

        if (datosFamiliaEditados.descripcion_padre !== undefined) {
            familiaPayload.descripcion_padre = Array.isArray(datosFamiliaEditados.descripcion_padre)
                ? datosFamiliaEditados.descripcion_padre
                : [datosFamiliaEditados.descripcion_padre];
        }

        await familiaService.update(familiaId, familiaPayload);
        logger.log('✅ Información familiar actualizada');
    };

    const limpiarCambios = () => {
        setDatosFamiliaEditados({});
    };

    // Obtener datos combinados (originales + ediciones)
    const getDatosCombinados = () => {
        if (!estudiante?.familia) return null;

        return {
            ...estudiante.familia,
            ...datosFamiliaEditados
        };
    };

    const hayCambios = Object.keys(datosFamiliaEditados).length > 0;

    return {
        datosFamiliaEditados,
        hayCambios,
        handleFamiliaChange,
        guardarCambios,
        limpiarCambios,
        getDatosCombinados
    };
};
