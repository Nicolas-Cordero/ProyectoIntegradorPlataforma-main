/*
  Warnings:

  - You are about to drop the column `nem` on the `estudiante` table. All the data in the column will be lost.
  - You are about to alter the column `promedios_media` on the `estudiante` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(3,1)`.

*/
-- AlterTable
ALTER TABLE "estudiante" DROP COLUMN "nem",
ALTER COLUMN "promedios_media" SET DATA TYPE DECIMAL(3,1);
