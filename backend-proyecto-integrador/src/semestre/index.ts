export * from './semestre.module';
export * from './semestre.controller';
export * from './semestre.service';
export * from './semestre.repository';
export * from './dto/create-semestre.dto';

export enum Semestre {
  PRIMER_SEMESTRE = 'PRIMER_SEMESTRE',
  SEGUNDO_SEMESTRE = 'SEGUNDO_SEMESTRE',
  INVIERNO = 'INVIERNO',
  VERANO = 'VERANO',
}