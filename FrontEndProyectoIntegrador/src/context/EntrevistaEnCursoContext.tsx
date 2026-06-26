import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { entrevistaService } from '../services/entrevista.service';
import type { Topico } from '../types';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface ComentarioBorrador {
  topico: Topico;
  texto: string;
}

export interface BorradorEntrevista {
  rutEstudiante: string;
  nombreEstudiante: string;
  horaInicio: string; // ISO string (serializable en localStorage)
  comentarios: ComentarioBorrador[];
  minimizado: boolean;
}

interface FinalizarParams {
  fechaHora?: Date;
  duracionS: number;
  resumen?: string;
}

interface EntrevistaEnCursoContextValue {
  borrador: BorradorEntrevista | null;
  iniciar: (rutEstudiante: string, nombreEstudiante: string) => void;
  agregarComentario: (comentario: ComentarioBorrador) => void;
  editarComentario: (topico: Topico, texto: string) => void;
  eliminarComentario: (topico: Topico) => void;
  minimizar: () => void;
  restaurar: () => void;
  descartar: () => void;
  finalizar: (params: FinalizarParams) => Promise<void>;
  enviando: boolean;
  errorEnvio: string | null;
}

// ── localStorage helpers (robustos ante cuotas o modo incógnito) ──────────────

const STORAGE_KEY = 'entrevista_en_curso_borrador';

function safeGet(): BorradorEntrevista | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BorradorEntrevista;
  } catch {
    return null;
  }
}

function safeSet(borrador: BorradorEntrevista): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(borrador));
  } catch {
    // localStorage lleno o deshabilitado: el borrador vive solo en memoria
  }
}

function safeRemove(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignorar
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

const EntrevistaEnCursoContext = createContext<EntrevistaEnCursoContextValue | null>(null);

export function EntrevistaEnCursoProvider({ children }: { children: ReactNode }) {
  const [borrador, setBorrador] = useState<BorradorEntrevista | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  // Hidratación desde localStorage al montar — panel en estado minimizado
  useEffect(() => {
    const guardado = safeGet();
    if (guardado) {
      setBorrador({ ...guardado, minimizado: true });
    }
  }, []);

  // Persiste cualquier cambio en localStorage
  useEffect(() => {
    if (borrador) {
      safeSet(borrador);
    }
  }, [borrador]);

  const iniciar = useCallback((rutEstudiante: string, nombreEstudiante: string) => {
    const nuevo: BorradorEntrevista = {
      rutEstudiante,
      nombreEstudiante,
      horaInicio: new Date().toISOString(),
      comentarios: [],
      minimizado: false,
    };
    setBorrador(nuevo);
    setErrorEnvio(null);
  }, []);

  const agregarComentario = useCallback((comentario: ComentarioBorrador) => {
    setBorrador((prev) => {
      if (!prev) return prev;
      return { ...prev, comentarios: [...prev.comentarios, comentario] };
    });
  }, []);

  const editarComentario = useCallback((topico: Topico, texto: string) => {
    setBorrador((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        comentarios: prev.comentarios.map((c) =>
          c.topico === topico ? { ...c, texto } : c
        ),
      };
    });
  }, []);

  const eliminarComentario = useCallback((topico: Topico) => {
    setBorrador((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        comentarios: prev.comentarios.filter((c) => c.topico !== topico),
      };
    });
  }, []);

  const minimizar = useCallback(() => {
    setBorrador((prev) => (prev ? { ...prev, minimizado: true } : prev));
  }, []);

  const restaurar = useCallback(() => {
    setBorrador((prev) => (prev ? { ...prev, minimizado: false } : prev));
  }, []);

  const descartar = useCallback(() => {
    safeRemove();
    setBorrador(null);
    setErrorEnvio(null);
  }, []);

  const finalizar = useCallback(
    async ({ fechaHora, duracionS, resumen }: FinalizarParams) => {
      if (!borrador) return;
      setEnviando(true);
      setErrorEnvio(null);

      try {
        // Si el admin dejó fecha_hora en blanco, se envía horaInicio.
        // NUNCA omitir el campo: el backend usaría el momento del request,
        // que es la hora de finalización, no de inicio.
        const fechaFinal = fechaHora ?? new Date(borrador.horaInicio);

        await entrevistaService.crearEntrevista({
          rut_estudiante: borrador.rutEstudiante,
          fecha_hora: fechaFinal.toISOString(),
          duracion_s: duracionS,
          resumen: resumen || undefined,
          comentarios: borrador.comentarios,
        });

        safeRemove();
        setBorrador(null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al guardar la entrevista';
        setErrorEnvio(msg);
        throw err; // re-throw para que el modal muestre el error sin cerrarse
      } finally {
        setEnviando(false);
      }
    },
    [borrador]
  );

  return (
    <EntrevistaEnCursoContext.Provider
      value={{
        borrador,
        iniciar,
        agregarComentario,
        editarComentario,
        eliminarComentario,
        minimizar,
        restaurar,
        descartar,
        finalizar,
        enviando,
        errorEnvio,
      }}
    >
      {children}
    </EntrevistaEnCursoContext.Provider>
  );
}

export function useEntrevistaEnCurso(): EntrevistaEnCursoContextValue {
  const ctx = useContext(EntrevistaEnCursoContext);
  if (!ctx) throw new Error('useEntrevistaEnCurso debe usarse dentro de EntrevistaEnCursoProvider');
  return ctx;
}
