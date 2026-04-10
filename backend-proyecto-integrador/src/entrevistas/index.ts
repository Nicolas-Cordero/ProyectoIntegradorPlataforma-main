// Controllers
export { EntrevistasController } from './entrevistas.controller';

// Services
export { EntrevistasService } from './entrevistas.service';

// Module
export { EntrevistasModule } from './entrevistas.module';

// Entities
export { Entrevista } from './entities/entrevista.entity';
export { Etiqueta } from './entities/etiqueta.entity';
export { Texto } from './entities/texto.entity';

// DTOs
export type { CreateEntrevistaDto } from './dto/create-entrevista.dto';
export type { UpdateEntrevistaDto } from './dto/update-entrevista.dto';

// Interfaces (exportar las específicas que existen)
export type { TextoEtiquetaInput, TextoEtiqueta } from './interfaces/entrevista.interface';
