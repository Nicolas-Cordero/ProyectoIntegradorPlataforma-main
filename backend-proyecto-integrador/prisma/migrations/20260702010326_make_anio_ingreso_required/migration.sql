/*
  Warnings:

  - Made the column `anio_ingreso` on table `carrera` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "carrera" ALTER COLUMN "anio_ingreso" SET NOT NULL;
