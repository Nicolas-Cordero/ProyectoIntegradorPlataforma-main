import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateComentarioDto } from './create-comentario.dto';

// Lo único editable de un comentario es su texto: la entrevista a la que
// pertenece no cambia y ya no hay tópico que reasignar.
export class UpdateComentarioDto extends PartialType(
  PickType(CreateComentarioDto, ['texto']),
) {}
