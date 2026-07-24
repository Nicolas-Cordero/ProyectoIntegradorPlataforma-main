import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateEstudianteDto } from './create-estudiante.dto';

/**
 * Payload para la carga masiva de estudiantes (importación por Excel).
 * `@ValidateNested({ each: true })` aplica todas las reglas de
 * CreateEstudianteDto a cada elemento del arreglo, de modo que la validación
 * del backend es idéntica a la de una creación individual.
 */
export class CreateEstudiantesBulkDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe enviarse al menos un estudiante' })
  @ValidateNested({ each: true })
  @Type(() => CreateEstudianteDto)
  estudiantes!: CreateEstudianteDto[];
}
