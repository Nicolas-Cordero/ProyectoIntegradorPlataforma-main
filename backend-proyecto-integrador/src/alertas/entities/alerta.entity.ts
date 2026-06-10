export enum AlertaTipo {
  ENTREVISTA_VENCIDA = 'ENTREVISTA_VENCIDA',
  AUSENCIA_NOTAS = 'AUSENCIA_NOTAS',
}

export interface Alerta {
  rut_estudiante?: string;
  tipo: AlertaTipo;
  message: string;
  created_at: Date;
}
