/*
  Warnings:

  - The values [CONGELADO,FIRMADO] on the enum `EstadoBeneficio` will be removed. If these variants are still used in the database, this will fail.
  - The values [CONGELADO] on the enum `EstadoEstudiante` will be removed. If these variants are still used in the database, this will fail.
  - The values [RETIRADO] on the enum `EstadoRamo` will be removed. If these variants are still used in the database, this will fail.
  - The values [PERSONAL,ECONOMICO,FAMILIAR,OTRO] on the enum `Topico` will be removed. If these variants are still used in the database, this will fail.
  - Changed the type of `tipo` on the `beneficio` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tipo` on the `semestre` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TipoBeneficio" AS ENUM ('ARANCEL', 'MANUTENCION');

-- CreateEnum
CREATE TYPE "TipoSemestre" AS ENUM ('REGULAR', 'RECUPERATIVO');

-- AlterEnum
BEGIN;
CREATE TYPE "EstadoBeneficio_new" AS ENUM ('ACTIVO', 'SUSPENDIDO', 'FINALIZADO', 'RECHAZADO', 'EN_TRAMITE');
ALTER TABLE "beneficio_estudiante" ALTER COLUMN "estado" TYPE "EstadoBeneficio_new" USING ("estado"::text::"EstadoBeneficio_new");
ALTER TYPE "EstadoBeneficio" RENAME TO "EstadoBeneficio_old";
ALTER TYPE "EstadoBeneficio_new" RENAME TO "EstadoBeneficio";
DROP TYPE "public"."EstadoBeneficio_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "EstadoEstudiante_new" AS ENUM ('ACTIVO', 'CONDICIONAL', 'ELIMINADO', 'SUSPENDIDO', 'RETIRADO', 'EGRESADO', 'TITULADO');
ALTER TABLE "estudiante" ALTER COLUMN "estado" TYPE "EstadoEstudiante_new" USING ("estado"::text::"EstadoEstudiante_new");
ALTER TYPE "EstadoEstudiante" RENAME TO "EstadoEstudiante_old";
ALTER TYPE "EstadoEstudiante_new" RENAME TO "EstadoEstudiante";
DROP TYPE "public"."EstadoEstudiante_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "EstadoRamo_new" AS ENUM ('APROBADO', 'REPROBADO', 'CURSANDO', 'ELIMINADO');
ALTER TABLE "ramo" ALTER COLUMN "estado" TYPE "EstadoRamo_new" USING ("estado"::text::"EstadoRamo_new");
ALTER TYPE "EstadoRamo" RENAME TO "EstadoRamo_old";
ALTER TYPE "EstadoRamo_new" RENAME TO "EstadoRamo";
DROP TYPE "public"."EstadoRamo_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Topico_new" AS ENUM ('GENERAL', 'ACADEMICO', 'REL_INTER', 'SALUD', 'ACTS_EXTRA');
ALTER TABLE "comentario" ALTER COLUMN "topico" TYPE "Topico_new" USING ("topico"::text::"Topico_new");
ALTER TYPE "Topico" RENAME TO "Topico_old";
ALTER TYPE "Topico_new" RENAME TO "Topico";
DROP TYPE "public"."Topico_old";
COMMIT;

-- AlterTable
ALTER TABLE "beneficio" DROP COLUMN "tipo",
ADD COLUMN     "tipo" "TipoBeneficio" NOT NULL;

-- AlterTable
ALTER TABLE "semestre" DROP COLUMN "tipo",
ADD COLUMN     "tipo" "TipoSemestre" NOT NULL;
