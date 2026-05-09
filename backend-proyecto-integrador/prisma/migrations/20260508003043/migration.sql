-- CreateTable
CREATE TABLE "contacto_emergencia" (
    "id" SERIAL NOT NULL,
    "id_familiar" INTEGER NOT NULL,
    "rut_estudiante" TEXT NOT NULL,

    CONSTRAINT "contacto_emergencia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contacto_emergencia" ADD CONSTRAINT "contacto_emergencia_rut_estudiante_fkey" FOREIGN KEY ("rut_estudiante") REFERENCES "estudiante"("rut_estudiante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacto_emergencia" ADD CONSTRAINT "contacto_emergencia_id_familiar_fkey" FOREIGN KEY ("id_familiar") REFERENCES "familiar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
