/*
  Warnings:

  - You are about to drop the column `rut_familiar` on the `familiar` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id,rut_estudiante]` on the table `familiar` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "familiar_rut_familiar_rut_estudiante_key";

-- AlterTable
ALTER TABLE "familiar" DROP COLUMN "rut_familiar";

-- CreateIndex
CREATE UNIQUE INDEX "familiar_id_rut_estudiante_key" ON "familiar"("id", "rut_estudiante");
