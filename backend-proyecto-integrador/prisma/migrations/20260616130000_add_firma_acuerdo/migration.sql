-- CreateTable
CREATE TABLE "firma_acuerdo" (
    "id" SERIAL NOT NULL,
    "acuerdo_id" INTEGER NOT NULL,
    "rut_estudiante" TEXT NOT NULL,
    "firmado_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "firma_acuerdo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "firma_acuerdo_rut_estudiante_idx" ON "firma_acuerdo"("rut_estudiante");

-- CreateIndex
CREATE UNIQUE INDEX "firma_acuerdo_acuerdo_id_rut_estudiante_key" ON "firma_acuerdo"("acuerdo_id", "rut_estudiante");

-- AddForeignKey
ALTER TABLE "firma_acuerdo" ADD CONSTRAINT "firma_acuerdo_acuerdo_id_fkey" FOREIGN KEY ("acuerdo_id") REFERENCES "acuerdo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "firma_acuerdo" ADD CONSTRAINT "firma_acuerdo_rut_estudiante_fkey" FOREIGN KEY ("rut_estudiante") REFERENCES "estudiante"("rut_estudiante") ON DELETE CASCADE ON UPDATE CASCADE;
