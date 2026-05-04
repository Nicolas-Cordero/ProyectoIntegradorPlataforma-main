import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';



//Corresponderia a "cambiar comentario por topico"
//se debe poder agregar topicos a una entrevista
//y se debe poder actualizar el comentario de un topico
//todo debe quedar registrado en el audit log???
//donde registramos que algo fue actualizado
export class UpdateComentarioDto {
  //Será necesario ponerle limite a cada comentario?
  @IsString()
  @IsNotEmpty()
  texto!:string;
}

export class UpdateEntrevistaDto {

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  duracion_s?: number;


  @IsString()
  @IsOptional()
  resumen?: string;
}
