-- CreateTable
CREATE TABLE "semestre_carrera" (
    "semestre_id" INTEGER NOT NULL,
    "codigo_carrera" INTEGER NOT NULL,

    CONSTRAINT "semestre_carrera_pkey" PRIMARY KEY ("semestre_id","codigo_carrera")
);

-- AddForeignKey
ALTER TABLE "semestre_carrera" ADD CONSTRAINT "semestre_carrera_semestre_id_fkey" FOREIGN KEY ("semestre_id") REFERENCES "semestre"("semestre_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semestre_carrera" ADD CONSTRAINT "semestre_carrera_codigo_carrera_fkey" FOREIGN KEY ("codigo_carrera") REFERENCES "carrera"("codigo_carrera") ON DELETE RESTRICT ON UPDATE CASCADE;
