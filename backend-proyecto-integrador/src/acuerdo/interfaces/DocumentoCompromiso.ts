import { Topico } from "./Topico"

export interface DocumentoCompromiso {
  titulo: string;
  subtitulo: string;
  abstract: string;
  topicos: Topico[];
}