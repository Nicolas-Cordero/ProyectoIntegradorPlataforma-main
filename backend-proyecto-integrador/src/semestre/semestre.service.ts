import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoRamo, semestre } from '@prisma/client';
import { NOTA_APROBACION } from '../common';
import { CreateSemestreDto } from './dto/create-semestre.dto';
import {
  CambioEstadoRamo,
  RamoParaCierre,
  SemestreRepository,
} from './semestre.repository';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class SemestreService {
  constructor(
    private readonly semestreRepository: SemestreRepository,
    private readonly storageService: StorageService,
  ) {}

  create(createSemestreDto: CreateSemestreDto) {
    return this.semestreRepository.create(createSemestreDto);
  }

  findAll() {
    return this.semestreRepository.findAll();
  }

  findOne(id: number) {
    return this.semestreRepository.findOne(id);
  }

  // Un semestre es un concepto de calendario compartido por ramos y
  // entrevistas de potencialmente muchos estudiantes distintos, y por
  // semestre_carrera de muchas carreras. No se puede eliminar bajo ninguna
  // circunstancia — evita que un borrado accidental arrastre datos
  // académicos de estudiantes no relacionados con la acción.
  remove(): never {
    throw new ForbiddenException('Los semestres no se pueden eliminar.');
  }

  linkCarrera(semestre_id: number, codigo_carrera: number): Promise<void> {
    return this.semestreRepository.linkCarrera(semestre_id, codigo_carrera);
  }

  getByCarrera(codigo_carrera: number): Promise<semestre[]> {
    return this.semestreRepository.getByCarrera(codigo_carrera);
  }

  unlinkCarrera(semestre_id: number, codigo_carrera: number): Promise<void> {
    return this.semestreRepository.unlinkCarrera(semestre_id, codigo_carrera);
  }

  // Estado con el que un ramo queda al cerrarse su semestre.
  //
  // El cierre ya no exige que todos los ramos tengan nota: hay ramos que
  // simplemente no se califican con una. Las reglas, en orden:
  //
  //  · ELIMINADO se respeta siempre; un ramo eliminado no se evalúa.
  //  · Con nota, el estado se deriva de la nota y nunca al revés.
  //  · Sin nota y ya evaluado por el tutor (APROBADO/REPROBADO), se respeta:
  //    es el ramo que no se califica con nota.
  //  · Sin nota y todavía en curso, queda PENDIENTE. Un PENDIENTE sigue siendo
  //    editable con el semestre cerrado y no entra en ningún promedio, así que
  //    puede recibir su nota más tarde o terminar ELIMINADO.
  //
  // De ahí la invariante que sostiene el resto del sistema: PENDIENTE implica
  // no tener nota final. Ponerle nota a un PENDIENTE lo saca de ese estado
  // (ver RamoService).
  private estadoFinalAlCerrar(ramo: RamoParaCierre): EstadoRamo {
    if (ramo.estado === EstadoRamo.ELIMINADO) {
      return EstadoRamo.ELIMINADO;
    }
    if (ramo.nota_final !== null) {
      return ramo.nota_final >= NOTA_APROBACION
        ? EstadoRamo.APROBADO
        : EstadoRamo.REPROBADO;
    }
    if (
      ramo.estado === EstadoRamo.APROBADO ||
      ramo.estado === EstadoRamo.REPROBADO
    ) {
      return ramo.estado;
    }
    return EstadoRamo.PENDIENTE;
  }

  // Cierre explícito de un semestre para una carrera: solo el admin/tutor lo
  // dispara (ver guard de roles en el controller). El repositorio aporta la
  // transacción y la escritura; la decisión de qué estado le toca a cada ramo
  // es esta regla.
  cerrarSemestre(semestre_id: number, codigo_carrera: number): Promise<void> {
    return this.semestreRepository.cerrarSemestre(
      semestre_id,
      codigo_carrera,
      (ramos) => this.calcularCambiosDeCierre(ramos),
    );
  }

  // Solo devuelve los ramos cuyo estado cambia, para no reescribir filas que ya
  // están donde corresponde.
  private calcularCambiosDeCierre(ramos: RamoParaCierre[]): CambioEstadoRamo[] {
    return ramos
      .map((ramo) => ({ ramo, estado: this.estadoFinalAlCerrar(ramo) }))
      .filter(({ ramo, estado }) => estado !== ramo.estado)
      .map(({ ramo, estado }) => ({ id: ramo.id, estado }));
  }

  // Solo el estudiante dueño de la carrera puede subir el certificado de ese
  // semestre — un solo documento por carrera+semestre, no uno por ramo.
  async uploadCertificado(
    semestre_id: number,
    codigo_carrera: number,
    rut_estudiante: string,
    file: Express.Multer.File,
  ) {
    const dueño = await this.semestreRepository.findCarreraRut(codigo_carrera);
    if (!dueño) {
      throw new NotFoundException(`Carrera ${codigo_carrera} no encontrada`);
    }
    if (dueño !== rut_estudiante) {
      throw new ForbiddenException(
        'No puedes subir un certificado a una carrera que no te pertenece',
      );
    }
    const { url } = await this.storageService.uploadPDF(file, 'certificados');
    return this.semestreRepository.updateCertificado(
      semestre_id,
      codigo_carrera,
      url,
    );
  }
}
