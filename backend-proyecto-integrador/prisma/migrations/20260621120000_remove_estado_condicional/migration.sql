-- Eliminar el estado CONDICIONAL del enum EstadoEstudiante.
-- Los estudiantes con ese estado se migran a ACTIVO (era un estado equivalente
-- a activo con condiciones; habilitaba login igual que ACTIVO).

UPDATE "estudiante" SET "estado" = 'ACTIVO' WHERE "estado" = 'CONDICIONAL';

-- PostgreSQL no permite eliminar valores de un enum directamente.
-- El patrón estándar es crear un enum nuevo, cambiar la columna y borrar el antiguo.

CREATE TYPE "EstadoEstudiante_new" AS ENUM (
  'ACTIVO',
  'ELIMINADO',
  'SUSPENDIDO',
  'RETIRADO',
  'EGRESADO',
  'TITULADO'
);

ALTER TABLE "estudiante"
  ALTER COLUMN "estado" TYPE "EstadoEstudiante_new"
  USING "estado"::text::"EstadoEstudiante_new";

DROP TYPE "EstadoEstudiante";

ALTER TYPE "EstadoEstudiante_new" RENAME TO "EstadoEstudiante";
