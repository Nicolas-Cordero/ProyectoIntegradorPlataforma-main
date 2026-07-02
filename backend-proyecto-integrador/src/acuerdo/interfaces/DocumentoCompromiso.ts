import { Topico } from './Topico';

export type DocumentoCompromiso = {
  titulo: string;
  subtitulo: string;
  abstract: string;
  topicos: Topico[];
};
