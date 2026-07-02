import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateComentarioDto } from './create-comentario.dto';

//Corresponderia a "cambiar comentario por topico"
//se debe poder agregar topicos a una entrevista
//y se debe poder actualizar el comentario de un topico
//todo debe quedar registrado en el audit log???
//donde registramos que algo fue actualizado
export class UpdateComentarioDto extends PartialType(
  PickType(CreateComentarioDto, ['texto']),
) {}
