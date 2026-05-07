import { IsNotEmpty, IsString } from "class-validator";

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