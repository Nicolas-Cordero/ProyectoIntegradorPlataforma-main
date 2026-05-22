/*
  Warnings:

  - A unique constraint covering the columns `[year,semestre]` on the table `semestre` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "semestre_year_semestre_key" ON "semestre"("year", "semestre");
