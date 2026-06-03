-- AlterTable
ALTER TABLE "estudiante" ADD COLUMN     "generacion_id" INTEGER;

-- CreateTable
CREATE TABLE "generacion" (
    "id" SERIAL NOT NULL,
    "año" INTEGER NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "generacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "generacion_año_key" ON "generacion"("año");

-- AddForeignKey
ALTER TABLE "estudiante" ADD CONSTRAINT "estudiante_generacion_id_fkey" FOREIGN KEY ("generacion_id") REFERENCES "generacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
