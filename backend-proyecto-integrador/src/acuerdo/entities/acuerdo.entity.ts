import { DocumentoCompromiso } from '../interfaces';

export class Acuerdo {
  id!: number;
  createdAt!: Date;
  documento!: DocumentoCompromiso;
}
