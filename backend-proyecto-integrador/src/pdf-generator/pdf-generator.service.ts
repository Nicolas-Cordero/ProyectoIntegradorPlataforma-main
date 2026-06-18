import { Injectable, BadRequestException } from '@nestjs/common';
import { Generators, IPdfGenerator } from './interfaces';
import { CreatePdfAcademicoDto, CreatePdfSemestreDto, CreatePdfEntrevistaDto, CreatePdfEstadisticasDto, CreatePdfAcuerdoDto } from './dto';
import { PdfAcademicoGenerator, PdfEntrevistaGenerator, PdfSemestreGenerator, PdfEstadisticasGenerator, PdfAcuerdoGenerator } from './services'


//Se construte un typemap que indica a que dto apuntar.
type DtoMap = {
  [Generators.ACADEMICO]:    CreatePdfAcademicoDto;
  [Generators.ENTREVISTA]:   CreatePdfEntrevistaDto;
  [Generators.SEMESTRE]:     CreatePdfSemestreDto;
  [Generators.ESTADISTICAS]: CreatePdfEstadisticasDto;
  [Generators.ACUERDO]:      CreatePdfAcuerdoDto;
};

@Injectable()
export class PdfGeneratorService {

  //Se define un mapa de strategies con la firma de la interfaz
  private readonly strategies: Record<Generators, IPdfGenerator<unknown>>;


  //En el constructor vive el mapa. Apuntando segun cada generator a una clase concreta.
  constructor(
    private readonly academico:    PdfAcademicoGenerator,
    private readonly entrevista:   PdfEntrevistaGenerator,
    private readonly semestre:     PdfSemestreGenerator,
    private readonly estadisticas: PdfEstadisticasGenerator,
    private readonly acuerdo:      PdfAcuerdoGenerator,
  ) {
    this.strategies = {
      [Generators.ACADEMICO]:    this.academico,
      [Generators.ENTREVISTA]:   this.entrevista,
      [Generators.SEMESTRE]:     this.semestre,
      [Generators.ESTADISTICAS]: this.estadisticas,
      [Generators.ACUERDO]:      this.acuerdo,
    };
  }

  //se llama al pdfGenerate de la clase concreta seleccionada.
  async pdfGenerate<T extends Generators>(dto: DtoMap[T], generator: T): Promise<Buffer> {
    const strategy = this.strategies[generator] as IPdfGenerator<unknown> | undefined;
    if (!strategy) {
      throw new BadRequestException(`Generator '${generator}' no reconocido`);
    }
    return strategy.pdfGenerate(dto);
  }
}