export enum AlertaTipo {
  ENTREVISTA_VENCIDA = 'ENTREVISTA_VENCIDA',
  AUSENCIA_NOTAS = 'AUSENCIA_NOTAS',
  FIRMAR_ACUERDO = 'FIRMAR_ACUERDO',
}

export interface Alerta {
  rut_estudiante?: string;
  tipo: AlertaTipo;
  message: string;
  created_at: Date;
}
