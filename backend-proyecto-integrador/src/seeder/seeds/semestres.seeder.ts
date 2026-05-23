import { TipoSemestre } from '@prisma/client';
import { Semestre } from '../../semestre/semestre.enum';
import { prisma } from '../prisma-client';


export async function semestresSeeder() {
  for (let year = 2000; year <= 2100; year++) {
    const semestres = [
      {
        year,
        semestre: Semestre.VERANO,
        tipo:TipoSemestre.RECUPERATIVO,},
      {
        year,
        semestre: Semestre.PRIMER_SEMESTRE,
        tipo: TipoSemestre.REGULAR,
      },
      {
        year,
        semestre: Semestre.INVIERNO,
        tipo: TipoSemestre.RECUPERATIVO,
      },
      {
        year,
        semestre: Semestre.SEGUNDO_SEMESTRE,
        tipo: TipoSemestre.REGULAR,
      },
    ];

    for (const semestreData of semestres) {
      await prisma.semestre.upsert({
        where: {
          year_semestre: {
            year: semestreData.year,
            semestre: semestreData.semestre,
          },
        },
        update: {},
        create: {
          year: semestreData.year,
          semestre: semestreData.semestre,
          tipo: semestreData.tipo,
        },  
      })
    }
  }

  console.log('Semestres seeded successfully');
}