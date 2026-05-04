export * from './dto';
export * from './beneficios.service';
export * from './beneficios.controller';
export * from './beneficios.module';

export enum TipoBeneficio {
  BECA_ALIMENTICIA = 'BECA ALIMENTICIA',
  BECA_ARANCEL = 'BECA DE ARANCEL',
  CREDITO = 'CREDITO',
  GRATUIDAD = 'GRATUIDAD',
  BECA_MANTENCION = 'BECA DE MANTENCION',
  BECA_TRANSPORTE = 'BECA DE TRANSPORTE',
  BECA_RESIDENCIA = 'BECA DE RESIDENCIA',
  BECA_DEPORTIVA = 'BECA DEPORTIVA',
  BECA_INVESTIGACION = 'BECA DE INVESTIGACION'
}