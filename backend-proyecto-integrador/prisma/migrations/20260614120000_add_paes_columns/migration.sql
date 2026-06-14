-- Completa la tabla paes (la migración inicial solo creó el id)
-- e incluye los nuevos campos nem y ranking

ALTER TABLE "paes" ADD COLUMN "rut_estudiante" TEXT NOT NULL;
ALTER TABLE "paes" ADD COLUMN "matematicas" INTEGER NOT NULL;
ALTER TABLE "paes" ADD COLUMN "lenguaje" INTEGER NOT NULL;
ALTER TABLE "paes" ADD COLUMN "nem" INTEGER NOT NULL;
ALTER TABLE "paes" ADD COLUMN "ranking" INTEGER NOT NULL;
ALTER TABLE "paes" ADD COLUMN "matematicas2" INTEGER;
ALTER TABLE "paes" ADD COLUMN "ciencias" INTEGER;
ALTER TABLE "paes" ADD COLUMN "historia" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "paes_rut_estudiante_key" ON "paes"("rut_estudiante");

-- AddForeignKey
ALTER TABLE "paes" ADD CONSTRAINT "paes_rut_estudiante_fkey" FOREIGN KEY ("rut_estudiante") REFERENCES "estudiante"("rut_estudiante") ON DELETE RESTRICT ON UPDATE CASCADE;
