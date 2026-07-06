import { BaseHttpClient } from './base.http';
import type { Beneficio, BeneficioEstudiante } from '../types';

/**
 * Servicio para gestionar beneficios y beneficios de estudiantes
 */
class BeneficiosService extends BaseHttpClient {
  // ============================================
  // BENEFICIOS
  // ============================================

  /**
   * Obtener todos los beneficios (catálogo)
   */
  async getBeneficios(): Promise<Beneficio[]> {
    return this.request<Beneficio[]>('/beneficios', {
      method: 'GET',
      requireAuth: true,
    });
  }

  /**
   * Obtener un beneficio por ID
   */
  async getBeneficioById(id: number): Promise<Beneficio> {
    return this.request<Beneficio>(`/beneficios/${id}`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  /**
   * Crear un nuevo beneficio
   */
  async createBeneficio(data: Omit<Beneficio, 'codigo_beneficio'>): Promise<Beneficio> {
    return this.request<Beneficio>('/beneficios', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  }

  /**
   * Actualizar un beneficio existente
   */
  async updateBeneficio(id: number, data: Partial<Beneficio>): Promise<Beneficio> {
    return this.request<Beneficio>(`/beneficios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      requireAuth: true,
    });
  }

  /**
   * Eliminar un beneficio del catálogo (el backend lo rechaza siempre:
   * un beneficio referenciado históricamente no se puede borrar)
   */
  async deleteBeneficio(id: number): Promise<void> {
    return this.request<void>(`/beneficios/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  }

  // ============================================
  // BENEFICIOS DE ESTUDIANTES
  // ============================================

  /**
   * Obtener todos los beneficios asignados a un estudiante.
   *
   * `GET /beneficios/estudiantes/rut/:rut` solo devuelve el catálogo (nombre,
   * proveedor, tipo...) de los beneficios asignados, sin estado/inicio/fin de
   * la asociación real. Para obtener esos datos hay que pedir cada asociación
   * individualmente por su llave compuesta (codigo_beneficio + rut_estudiante).
   */
  async getBeneficiosByEstudiante(rutEstudiante: string): Promise<BeneficioEstudiante[]> {
    const asignados = await this.request<Beneficio[]>(
      `/beneficios/estudiantes/rut/${rutEstudiante}`,
      { method: 'GET', requireAuth: true }
    );

    return Promise.all(
      asignados.map(b =>
        this.request<BeneficioEstudiante>(
          `/beneficios/estudiantes/${b.codigo_beneficio}/${rutEstudiante}`,
          { method: 'GET', requireAuth: true }
        )
      )
    );
  }

  /**
   * Asignar un beneficio a un estudiante
   */
  async asignarBeneficioEstudiante(
    data: BeneficioEstudiante
  ): Promise<BeneficioEstudiante> {
    return this.request<BeneficioEstudiante>(
      `/beneficios/estudiantes/${data.codigo_beneficio}/${data.rut_estudiante}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
        requireAuth: true,
      }
    );
  }

  /**
   * Actualizar un beneficio asignado a un estudiante (llave compuesta: no existe un id propio)
   */
  async updateBeneficioEstudiante(
    codigoBeneficio: number,
    rutEstudiante: string,
    data: Partial<Pick<BeneficioEstudiante, 'inicio' | 'fin' | 'estado'>>
  ): Promise<BeneficioEstudiante> {
    return this.request<BeneficioEstudiante>(
      `/beneficios/estudiantes/${codigoBeneficio}/${rutEstudiante}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
        requireAuth: true,
      }
    );
  }

  /**
   * Quitar un beneficio asignado a un estudiante (llave compuesta: no existe un id propio)
   */
  async deleteBeneficioEstudiante(codigoBeneficio: number, rutEstudiante: string): Promise<void> {
    return this.request<void>(`/beneficios/estudiantes/${codigoBeneficio}/${rutEstudiante}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  }
}

export const beneficiosService = new BeneficiosService();
