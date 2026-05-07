import {
  IsString,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';



export class UpdateEntrevistaDto {

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  duracion_s?: number;


  @IsString()
  @IsOptional()
  resumen?: string;
}
