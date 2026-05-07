/*
  Warnings:

  - Added the required column `NEM` to the `estudiante` table without a default value. This is not possible if the table is not empty.
  - Added the required column `direccion` to the `estudiante` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_nacimiento` to the `estudiante` table without a default value. This is not possible if the table is not empty.
  - Added the required column `genero` to the `estudiante` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('MASCULINO', 'FEMENINO', 'NO_BINARIO');

-- AlterTable
ALTER TABLE "estudiante" ADD COLUMN     "NEM" DECIMAL(3,1) NOT NULL,
ADD COLUMN     "direccion" TEXT NOT NULL,
ADD COLUMN     "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "genero" "Genero" NOT NULL;
