/*
  Warnings:

  - You are about to drop the column `generacion` on the `estudiante` table. All the data in the column will be lost.
  - Made the column `generacion_id` on table `estudiante` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "estudiante" DROP CONSTRAINT "estudiante_generacion_id_fkey";

-- AlterTable
ALTER TABLE "estudiante" DROP COLUMN "generacion",
ALTER COLUMN "generacion_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "estudiante" ADD CONSTRAINT "estudiante_generacion_id_fkey" FOREIGN KEY ("generacion_id") REFERENCES "generacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
