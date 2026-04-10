export interface Seeder {
  /**
   * Nombre del seeder (para logging)
   */
  name: string;

  /**
   * Ejecuta el seeder
   * @returns Número de registros creados
   */
  run(): Promise<number>;
}
