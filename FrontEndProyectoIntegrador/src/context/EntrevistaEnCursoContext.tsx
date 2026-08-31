import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { entrevistaService } from '../services/entrevista.service';

// ── Tipos ─────────────────────────────────────────────────────────────────────

// Dónde se ancla el panel cuando está visible:
//  · 'lateral'  — flotante a la derecha, sobre el contenido (el de siempre).
//  · 'inferior' — anclado abajo a media pantalla y a todo el ancho, con la
//                 aplicación reacomodada encima; no tapa nada.
// Se guarda aparte de `minimizado` para que al restaurar desde el pill se
// vuelva al último modo que el tutor estaba usando, y no siempre al inicial.
export type ModoPanel = 'lateral' | 'inferior';

export interface BorradorEntrevista {
  rutEstudiante: string;
  nombreEstudiante: string;
  horaInicio: string; // ISO string (serializable en localStorage)
  // Anotación general de la entrevista: un único texto que se escribe en vivo
  // durante la entrevista. Arranca vacío y se va editando.
  comentario: string;
  minimizado: boolean;
  modo: ModoPanel;
}

interface FinalizarParams {
  fechaHora?: Date;
  duracionS: number;
  resumen?: string;
}

interface EntrevistaEnCursoContextValue {
  borrador: BorradorEntrevista | null;
  iniciar: (rutEstudiante: string, nombreEstudiante: string) => void;
  actualizarComentario: (texto: string) => void;
  alternarModo: () => void;
  minimizar: () => void;
  restaurar: () => void;
  descartar: () => void;
  finalizar: (params: FinalizarParams) => Promise<void>;
  enviando: boolean;
  errorEnvio: string | null;
}

// ── localStorage helpers (robustos ante cuotas o modo incógnito) ──────────────

const STORAGE_KEY = 'entrevista_en_curso_borrador';

// Un borrador guardado con el esquema viejo (lista de comentarios por tópico)
// se normaliza al leerlo, para no romper una entrevista que quedó a medias
// cuando se desplegó este cambio.
interface BorradorLegacy {
  comentarios?: { topico?: string; texto?: string }[];
}

function normalizarModo(valor: unknown): ModoPanel {
  return valor === 'inferior' ? 'inferior' : 'lateral';
}

function safeGet(): BorradorEntrevista | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BorradorEntrevista & BorradorLegacy;
    const modo = normalizarModo(parsed.modo);
    if (typeof parsed.comentario === 'string') return { ...parsed, modo };
    const heredado = (parsed.comentarios ?? [])
      .map((c) => c?.texto?.trim())
      .filter((t): t is string => !!t)
      .join('\n\n');
    return { ...parsed, comentario: heredado, modo };
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
      comentario: '',
      minimizado: false,
      modo: 'lateral',
    };
    setBorrador(nuevo);
    setErrorEnvio(null);
  }, []);

  const actualizarComentario = useCallback((texto: string) => {
    setBorrador((prev) => (prev ? { ...prev, comentario: texto } : prev));
  }, []);

  const alternarModo = useCallback(() => {
    setBorrador((prev) =>
      prev
        ? { ...prev, modo: prev.modo === 'lateral' ? 'inferior' : 'lateral' }
        : prev
    );
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
          comentario: borrador.comentario.trim() || undefined,
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
        actualizarComentario,
        alternarModo,
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
