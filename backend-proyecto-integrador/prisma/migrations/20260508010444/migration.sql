/*
  Warnings:

  - Changed the type of `via_acceso` on the `carrera` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "carrera" DROP COLUMN "via_acceso",
ADD COLUMN     "via_acceso" "ViaAcceso" NOT NULL;
