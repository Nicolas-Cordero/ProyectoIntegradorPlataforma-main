import { BaseHttpClient } from './base.http';
import type { Beneficio, BeneficioEstudiante } from '../types';

/**
 * Beneficios y asignaciones de beneficios a estudiantes.
 *
 * El catálogo (`beneficio`) es de solo lectura desde el front: se carga con el
 * seeder del backend y el modelo de negocio no contempla crearlo, editarlo ni
 * borrarlo desde la aplicación. Por eso aquí solo vive el GET del catálogo.
 */
class BeneficiosService extends BaseHttpClient {
  /** Catálogo completo de beneficios. */
  async getBeneficios(): Promise<Beneficio[]> {
    return this.request<Beneficio[]>('/beneficios', {
      method: 'GET',
      requireAuth: true,
    });
  }

  /**
   * Beneficios asignados a un estudiante, con el estado e inicio de cada
   * asignación.
   *
   * `GET /beneficios/estudiantes/rut/:rut` devuelve las asociaciones completas,
   * así que basta una llamada.
   */
  async getBeneficiosByEstudiante(rutEstudiante: string): Promise<BeneficioEstudiante[]> {
    return this.request<BeneficioEstudiante[]>(
      `/beneficios/estudiantes/rut/${rutEstudiante}`,
      { method: 'GET', requireAuth: true }
    );
  }

  /** Asigna un beneficio a un estudiante. */
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
   * Cambia el estado de una asignación (llave compuesta: no hay id propio).
   * Una beca pasa de EN_TRAMITE a ACTIVO, o a SUSPENDIDO, a lo largo del año.
   */
  async updateBeneficioEstudiante(
    codigoBeneficio: number,
    rutEstudiante: string,
    data: Partial<Pick<BeneficioEstudiante, 'inicio' | 'estado'>>
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

  /** Quita un beneficio de un estudiante (llave compuesta: no hay id propio). */
  async deleteBeneficioEstudiante(codigoBeneficio: number, rutEstudiante: string): Promise<void> {
    return this.request<void>(`/beneficios/estudiantes/${codigoBeneficio}/${rutEstudiante}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  }
}

export const beneficiosService = new BeneficiosService();
