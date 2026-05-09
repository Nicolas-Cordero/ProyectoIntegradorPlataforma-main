/*
  Warnings:

  - You are about to drop the column `nrc` on the `ramo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nombre,semestre_id,rut_estudiante,codigo_carrera]` on the table `ramo` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `parentesco` on the `familiar` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Parentesco" AS ENUM ('PADRE', 'MADRE', 'ABUELO', 'ABUELA', 'HERMANO', 'HERMANA', 'TIO', 'TIA', 'PRIMO', 'PRIMA', 'OTRO');

-- DropIndex
DROP INDEX "ramo_nrc_semestre_id_rut_estudiante_codigo_carrera_key";

-- AlterTable
ALTER TABLE "estudiante" ADD COLUMN     "foto_url" TEXT;

-- AlterTable
ALTER TABLE "familiar" DROP COLUMN "parentesco",
ADD COLUMN     "parentesco" "Parentesco" NOT NULL;

-- AlterTable
ALTER TABLE "ramo" DROP COLUMN "nrc";

-- CreateIndex
CREATE UNIQUE INDEX "ramo_nombre_semestre_id_rut_estudiante_codigo_carrera_key" ON "ramo"("nombre", "semestre_id", "rut_estudiante", "codigo_carrera");
