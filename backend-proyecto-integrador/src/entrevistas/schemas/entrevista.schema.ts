import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EntrevistaDocument = Entrevista & Document;

@Schema()
export class Texto {
  @Prop()
  contenido: string;

  @Prop({ type: Date })
  fecha: Date;

  @Prop()
  contexto: string;
}

export const TextoSchema = SchemaFactory.createForClass(Texto);

@Schema()
export class Etiqueta {
  @Prop()
  nombre_etiqueta: string;

  @Prop({ type: [TextoSchema], default: [] })
  textos: Texto[];

  @Prop({ type: Date, required: false })
  primera_vez?: Date;

  @Prop({ type: Date, required: false })
  ultima_vez?: Date;

  @Prop({ type: Number, default: 0 })
  frecuencia: number;
}

export const EtiquetaSchema = SchemaFactory.createForClass(Etiqueta);

@Schema({ timestamps: true })
export class Entrevista {
  @Prop({ type: Types.ObjectId, required: true })
  estudianteId: string;

  @Prop({ type: Types.ObjectId, required: true })
  usuarioId: string;

  @Prop({ type: Date, default: () => new Date() })
  fecha: Date;

  @Prop()
  nombre_Tutor: string;

  @Prop()
  año: number;

  @Prop()
  numero_Entrevista: number;

  @Prop()
  duracion_minutos: number;

  @Prop()
  estado: string;

  @Prop({ default: '' })
  observaciones: string;

  @Prop({ default: '' })
  informacion_adicional: string;

  @Prop({ type: [String], default: [] })
  temas_abordados: string[];

  @Prop({ type: [EtiquetaSchema], default: [] })
  etiquetas: Etiqueta[];
}

export const EntrevistaSchema = SchemaFactory.createForClass(Entrevista);
