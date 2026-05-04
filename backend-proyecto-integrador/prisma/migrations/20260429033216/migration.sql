/*
  Warnings:

  - Added the required column `descripcion` to the `beneficio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "beneficio" ADD COLUMN     "descripcion" TEXT NOT NULL;
