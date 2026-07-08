import { BaseHttpClient } from './base.http';

// ── Forma del documento tal como lo almacena/entrega el backend ──────────────────
// El acuerdo guarda un único `documento` con titulo/subtitulo/abstract y una lista
// de tópicos; cada tópico tiene un nombre (o `null`) y una lista de puntos.

export interface TopicoCompromiso {
  nombre: string | null;
  puntos: string[];
}

export interface DocumentoCompromiso {
  titulo: string;
  subtitulo: string;
  abstract: string;
  topicos: TopicoCompromiso[];
}

// Fila de la tabla `acuerdo` (lo que devuelven GET /acuerdo/vigente y PATCH).
export interface AcuerdoResponse {
  id: number;
  createdAt: string;
  documento: DocumentoCompromiso;
}

// ── Cuerpo de PATCH /acuerdo/:id ─────────────────────────────────────────────────
// Refleja exactamente UpdateAcuerdoDto del backend: todo opcional y anidado bajo
// `documento` (UpdateDocumentoCompromisoDto / UpdateTopicoDto).

export interface UpdateTopicoCompromisoDto {
  nombre?: string | null;
  puntos?: string[];
}

export interface UpdateDocumentoCompromisoDto {
  titulo?: string;
  subtitulo?: string;
  abstract?: string;
  topicos?: UpdateTopicoCompromisoDto[];
}

export interface UpdateAcuerdoDto {
  documento?: UpdateDocumentoCompromisoDto;
}

// Fila de `firma_acuerdo` enriquecida con datos básicos del estudiante
// (lo que devuelve GET /acuerdo/:id/firmas).
export interface FirmanteAcuerdo {
  rut_estudiante: string;
  nombre: string;
  apellido: string;
  firmadoAt: string;
}

class AcuerdoService extends BaseHttpClient {
  /**
   * GET /acuerdo
   * Lista todas las versiones del acuerdo (cada fila con su documento completo),
   * de la más reciente a la más antigua (orden por createdAt desc en el backend).
   */
  async getAcuerdos(): Promise<AcuerdoResponse[]> {
    return this.request<AcuerdoResponse[]>('/acuerdo');
  }

  /**
   * GET /acuerdo/vigente?fecha=YYYY-MM-DD
   * Retorna el acuerdo cuyo `createdAt` está más cercano a la fecha indicada.
   * Sin fecha, el backend usa la fecha de hoy por defecto (no se envía la query).
   */
  async getAcuerdoVigente(fecha?: string): Promise<AcuerdoResponse> {
    const query = fecha ? `?fecha=${encodeURIComponent(fecha)}` : '';
    return this.request<AcuerdoResponse>(`/acuerdo/vigente${query}`);
  }

  /**
   * PATCH /acuerdo/:id
   * El backend versiona: aplica los cambios sobre el documento del acuerdo `id` y
   * persiste una fila nueva (con su propio id y createdAt), sin mutar la original.
   */
  async updateAcuerdo(id: number | string, data: UpdateAcuerdoDto): Promise<AcuerdoResponse> {
    return this.request<AcuerdoResponse>(`/acuerdo/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * GET /acuerdo/:id/firmas
   * Estudiantes que firmaron esa versión concreta del acuerdo, con la fecha de firma.
   */
  async getFirmantes(id: number | string): Promise<FirmanteAcuerdo[]> {
    return this.request<FirmanteAcuerdo[]>(`/acuerdo/${id}/firmas`);
  }
}

export const acuerdoService = new AcuerdoService();
