import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateComentarioDto {
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  entrevista_id!: number;

  // Comentario general de la entrevista: ya no se reparte por tópicos, así que
  // es el único texto libre del registro y admite anotaciones largas.
  @IsString()
  @IsNotEmpty()
  @MaxLength(20000, {
    message: 'El comentario no puede superar los 20.000 caracteres',
  })
  texto!: string;
}
