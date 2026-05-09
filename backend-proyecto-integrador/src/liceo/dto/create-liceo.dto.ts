import { IsNotEmpty, IsString } from "class-validator";

export class CreateLiceoDto {

  @IsNotEmpty()
  @IsString()
  rbd!: string;

  @IsNotEmpty()
  @IsString()
  nombre!: string;

  @IsNotEmpty()
  @IsString()
  comuna!: string;

  @IsNotEmpty()
  @IsString()
  especialidad!: string;
}
