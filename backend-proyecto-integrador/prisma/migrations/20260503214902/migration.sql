/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `beneficio` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "beneficio_nombre_key" ON "beneficio"("nombre");
