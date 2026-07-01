-- Drop historial_estado_estudiante (created in previous migration, now replaced)
DROP TABLE IF EXISTS "historial_estado_estudiante";

-- Remove estado from estudiante
ALTER TABLE "estudiante" DROP COLUMN "estado";

-- Add estado to carrera with default ACTIVO
ALTER TABLE "carrera" ADD COLUMN "estado" "EstadoEstudiante" NOT NULL DEFAULT 'ACTIVO';

-- Create historial_estado_carrera
CREATE TABLE "historial_estado_carrera" (
    "id" SERIAL NOT NULL,
    "codigo_carrera" INTEGER NOT NULL,
    "estado_anterior" "EstadoEstudiante",
    "estado_nuevo" "EstadoEstudiante" NOT NULL,
    "rut_usuario" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estado_carrera_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "historial_estado_carrera" ADD CONSTRAINT "historial_estado_carrera_codigo_carrera_fkey"
    FOREIGN KEY ("codigo_carrera") REFERENCES "carrera"("codigo_carrera") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "historial_estado_carrera" ADD CONSTRAINT "historial_estado_carrera_rut_usuario_fkey"
    FOREIGN KEY ("rut_usuario") REFERENCES "usuario"("rut_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
