/*
  Warnings:

  - Added the required column `nombre` to the `beneficio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "beneficio" ADD COLUMN     "nombre" TEXT NOT NULL;
