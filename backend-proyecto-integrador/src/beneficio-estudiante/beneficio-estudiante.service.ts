import { Injectable } from '@nestjs/common';
import { CreateBeneficioEstudianteDto } from './dto/create-beneficio-estudiante.dto';
import { UpdateBeneficioEstudianteDto } from './dto/update-beneficio-estudiante.dto';
import { BeneficioEstudianteRepository } from './beneficio-estudiante.repository';
import { EstudianteRepository } from '../estudiante';
import { beneficio, estudiante } from '@prisma/client';
import { BeneficiosRepository } from '../beneficios';

@Injectable()
export class BeneficioEstudianteService {
  constructor(
    private readonly asociationRepo: BeneficioEstudianteRepository,
    private readonly estudianteRepo: EstudianteRepository,
    private readonly beneficioRepo: BeneficiosRepository
  ){}


  async createAsociation(createBeneficioEstudianteDto: CreateBeneficioEstudianteDto) {
    return await this.asociationRepo.asociateBeneficioEstudiante(createBeneficioEstudianteDto) ;
  }

  async findAllAsociations() {
    return await this.asociationRepo.findAllAsociations();
  }



  async findEstudiantesByBeneficio(codigo_beneficio: number): Promise<estudiante[]>{
    const asociations = await this.asociationRepo.findAllAsociationsByBeneficio(codigo_beneficio);
    const estudiantes = await Promise.all(
      asociations.map(async a => {
        return this.estudianteRepo.findEstudianteByRut(a.rut_estudiante)
      })
    );

    return estudiantes.filter(e => e !== null);
  }


    async findBeneficiosByEstudiante(rut_estudiante: string): Promise<beneficio[]>{
    const asociations = await this.asociationRepo.findAllAsociationsByEstudiante(rut_estudiante);
    const beneficios = await Promise.all(
      asociations.map(async a => {
        return this.beneficioRepo.findByCode(a.codigo_beneficio)
      })
    );

    return beneficios.filter(e => e !== null);
  }




  findOneAsociation(codigo_beneficio: number, rut_estudiante: string) {
    return this.asociationRepo.findOneAsociation(codigo_beneficio, rut_estudiante)
  }

  update(codigo_beneficio: number,rut_estudiante: string ,updateBeneficioEstudianteDto: UpdateBeneficioEstudianteDto) {
    return this.asociationRepo.updateAsociation(codigo_beneficio, rut_estudiante, updateBeneficioEstudianteDto);
  }

  remove(codigo_beneficio: number, rut_estudiante: string) {
    return this.asociationRepo.deletAsociation(codigo_beneficio, rut_estudiante);
  }
}
