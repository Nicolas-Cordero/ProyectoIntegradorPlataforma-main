import { Injectable } from '@nestjs/common';
import { CreateCarreraDto } from './dto/create-carrera.dto';
import { UpdateCarreraDto } from './dto/update-carrera.dto';
import { CarreraRepository } from './carrera.repository';
import { carrera } from '@prisma/client';

@Injectable()
export class CarreraService {
  constructor(
    private readonly carreraRepo: CarreraRepository
  ){}


  create(createCarreraDto: CreateCarreraDto): Promise<carrera>{
    return this.carreraRepo.create(createCarreraDto);
  }


  findByEstudiante(rut_estudiante: string): Promise<carrera[]>{
    return this.carreraRepo.findAllByEstudiante(rut_estudiante);
  }


  async findOne(codigo_carrera: number): Promise<carrera> {

    const carrera = await this.carreraRepo.findOne(codigo_carrera);

    if(!carrera){
      throw new Error('No se encontro ninguna carrera');
    }

    return carrera;
  }

  update(codigo_carrera: number, updateCarreraDto: UpdateCarreraDto): Promise<carrera>{
    return this.carreraRepo.update(codigo_carrera, updateCarreraDto);
  }

  remove(codigo_carrera: number) {
    return this.carreraRepo.remove(codigo_carrera);
    //al eliminar una carrera no se estan eliminando las asociaciones, hay que revisar,
    // pq si se elimina hay ramos que apuntan a ella
  }
}
