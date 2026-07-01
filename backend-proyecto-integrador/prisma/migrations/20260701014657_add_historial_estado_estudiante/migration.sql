-- CreateTable
CREATE TABLE "historial_estado_estudiante" (
    "id" SERIAL NOT NULL,
    "rut_estudiante" TEXT NOT NULL,
    "estado_anterior" "EstadoEstudiante",
    "estado_nuevo" "EstadoEstudiante" NOT NULL,
    "rut_usuario" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estado_estudiante_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "historial_estado_estudiante" ADD CONSTRAINT "historial_estado_estudiante_rut_estudiante_fkey" FOREIGN KEY ("rut_estudiante") REFERENCES "estudiante"("rut_estudiante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estado_estudiante" ADD CONSTRAINT "historial_estado_estudiante_rut_usuario_fkey" FOREIGN KEY ("rut_usuario") REFERENCES "usuario"("rut_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
