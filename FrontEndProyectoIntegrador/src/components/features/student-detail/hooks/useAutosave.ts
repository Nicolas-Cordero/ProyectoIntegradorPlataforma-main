import { useEffect } from 'react';
import { logger } from '../../../../config';

interface UseAutosaveProps {
    id?: string;
    data: any;
    prefix: string;
    interval?: number;
}

/**
 * Hook genérico para autosave en localStorage
 * Guarda datos periódicamente y los recupera al iniciar
 */
export const useAutosave = ({ id, data, prefix, interval = 30000 }: UseAutosaveProps) => {
    const autosaveKey = id ? `${prefix}${id}` : null;

    useEffect(() => {
        if (!autosaveKey || Object.keys(data).length === 0) return;

        const timer = setInterval(() => {
            localStorage.setItem(autosaveKey, JSON.stringify(data));
            logger.log('💾 Autosave realizado:', prefix);
        }, interval);

        return () => clearInterval(timer);
    }, [autosaveKey, data, interval, prefix]);

    // Recuperar datos guardados
    const recoverAutosave = (): any => {
        if (!autosaveKey) return null;

        const savedData = localStorage.getItem(autosaveKey);
        if (!savedData) return null;

        try {
            const parsed = JSON.parse(savedData);
            logger.log('📦 Datos recuperados de autosave:', prefix, parsed);
            return parsed;
        } catch (err) {
            logger.error('❌ Error al recuperar autosave:', err);
            localStorage.removeItem(autosaveKey);
            return null;
        }
    };

    const clearAutosave = () => {
        if (autosaveKey) {
            localStorage.removeItem(autosaveKey);
            logger.log('🗑️ Autosave limpiado:', prefix);
        }
    };

    return {
        recoverAutosave,
        clearAutosave
    };
};
