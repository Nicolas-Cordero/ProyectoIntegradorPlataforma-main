-- CreateTable
CREATE TABLE "usuario" (
    "rut_usuario" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("rut_usuario")
);

-- CreateTable
CREATE TABLE "universidad" (
    "codigo_universidad" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "comuna" INTEGER NOT NULL,

    CONSTRAINT "universidad_pkey" PRIMARY KEY ("codigo_universidad")
);

-- CreateTable
CREATE TABLE "liceo" (
    "rbd" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "comuna" TEXT NOT NULL,
    "especialidad" TEXT NOT NULL,

    CONSTRAINT "liceo_pkey" PRIMARY KEY ("rbd")
);

-- CreateTable
CREATE TABLE "beneficio" (
    "codigo_beneficio" SERIAL NOT NULL,
    "proveedor" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "beneficio_pkey" PRIMARY KEY ("codigo_beneficio")
);

-- CreateTable
CREATE TABLE "semestre" (
    "semestre_id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "semestre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,

    CONSTRAINT "semestre_pkey" PRIMARY KEY ("semestre_id")
);

-- CreateTable
CREATE TABLE "estudiante" (
    "rut_estudiante" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "puntaje_paes" INTEGER,
    "generacion" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "rbd_liceo" TEXT NOT NULL,
    "promedios_media" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "estudiante_pkey" PRIMARY KEY ("rut_estudiante")
);

-- CreateTable
CREATE TABLE "familiar" (
    "rut_familiar" TEXT NOT NULL,
    "rut_estudiante" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "parentesco" TEXT NOT NULL,
    "observacion" TEXT NOT NULL,

    CONSTRAINT "familiar_pkey" PRIMARY KEY ("rut_familiar","rut_estudiante")
);

-- CreateTable
CREATE TABLE "beneficio_estudiante" (
    "codigo_beneficio" INTEGER NOT NULL,
    "rut_estudiante" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beneficio_estudiante_pkey" PRIMARY KEY ("codigo_beneficio","rut_estudiante")
);

-- CreateTable
CREATE TABLE "carrera" (
    "codigo_carrera" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "rut_estudiante" TEXT NOT NULL,
    "duracion_sem" INTEGER NOT NULL,
    "codigo_universidad" INTEGER NOT NULL,
    "via_acceso" TEXT NOT NULL,

    CONSTRAINT "carrera_pkey" PRIMARY KEY ("codigo_carrera")
);

-- CreateTable
CREATE TABLE "ramo" (
    "nrc" TEXT NOT NULL,
    "semestre_id" INTEGER NOT NULL,
    "rut_estudiante" TEXT NOT NULL,
    "codigo_carrera" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "comentario" TEXT NOT NULL,
    "intento" INTEGER NOT NULL,

    CONSTRAINT "ramo_pkey" PRIMARY KEY ("nrc","semestre_id","rut_estudiante","codigo_carrera")
);

-- CreateTable
CREATE TABLE "nota" (
    "nrc" TEXT NOT NULL,
    "semestre_id" INTEGER NOT NULL,
    "rut_estudiante" TEXT NOT NULL,
    "codigo_carrera" INTEGER NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL,
    "nota" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "nota_pkey" PRIMARY KEY ("nrc","semestre_id","rut_estudiante","codigo_carrera","fecha_hora")
);

-- CreateTable
CREATE TABLE "entrevista" (
    "fecha_hora" TIMESTAMP(3) NOT NULL,
    "rut_estudiante" TEXT NOT NULL,
    "semestre_id" INTEGER NOT NULL,
    "duracion_s" INTEGER NOT NULL,
    "rut_entrevistador" TEXT NOT NULL,
    "resumen" TEXT,

    CONSTRAINT "entrevista_pkey" PRIMARY KEY ("fecha_hora","rut_estudiante")
);

-- CreateTable
CREATE TABLE "comentario" (
    "fecha_hora_entrevista" TIMESTAMP(3) NOT NULL,
    "rut_estudiante" TEXT NOT NULL,
    "fecha_hora_comentario" TIMESTAMP(3) NOT NULL,
    "topico" TEXT NOT NULL,
    "texto" TEXT NOT NULL,

    CONSTRAINT "comentario_pkey" PRIMARY KEY ("fecha_hora_entrevista","rut_estudiante","fecha_hora_comentario","topico")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "fecha_hora" TIMESTAMP(3) NOT NULL,
    "rut_usuario" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("fecha_hora","rut_usuario")
);

-- CreateIndex
CREATE UNIQUE INDEX "universidad_nombre_key" ON "universidad"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "estudiante_email_key" ON "estudiante"("email");

-- AddForeignKey
ALTER TABLE "estudiante" ADD CONSTRAINT "estudiante_rbd_liceo_fkey" FOREIGN KEY ("rbd_liceo") REFERENCES "liceo"("rbd") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "familiar" ADD CONSTRAINT "familiar_rut_estudiante_fkey" FOREIGN KEY ("rut_estudiante") REFERENCES "estudiante"("rut_estudiante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficio_estudiante" ADD CONSTRAINT "beneficio_estudiante_codigo_beneficio_fkey" FOREIGN KEY ("codigo_beneficio") REFERENCES "beneficio"("codigo_beneficio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficio_estudiante" ADD CONSTRAINT "beneficio_estudiante_rut_estudiante_fkey" FOREIGN KEY ("rut_estudiante") REFERENCES "estudiante"("rut_estudiante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrera" ADD CONSTRAINT "carrera_rut_estudiante_fkey" FOREIGN KEY ("rut_estudiante") REFERENCES "estudiante"("rut_estudiante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrera" ADD CONSTRAINT "carrera_codigo_universidad_fkey" FOREIGN KEY ("codigo_universidad") REFERENCES "universidad"("codigo_universidad") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ramo" ADD CONSTRAINT "ramo_rut_estudiante_fkey" FOREIGN KEY ("rut_estudiante") REFERENCES "estudiante"("rut_estudiante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ramo" ADD CONSTRAINT "ramo_semestre_id_fkey" FOREIGN KEY ("semestre_id") REFERENCES "semestre"("semestre_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ramo" ADD CONSTRAINT "ramo_codigo_carrera_fkey" FOREIGN KEY ("codigo_carrera") REFERENCES "carrera"("codigo_carrera") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nota" ADD CONSTRAINT "nota_nrc_semestre_id_rut_estudiante_codigo_carrera_fkey" FOREIGN KEY ("nrc", "semestre_id", "rut_estudiante", "codigo_carrera") REFERENCES "ramo"("nrc", "semestre_id", "rut_estudiante", "codigo_carrera") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nota" ADD CONSTRAINT "nota_rut_estudiante_fkey" FOREIGN KEY ("rut_estudiante") REFERENCES "estudiante"("rut_estudiante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrevista" ADD CONSTRAINT "entrevista_rut_estudiante_fkey" FOREIGN KEY ("rut_estudiante") REFERENCES "estudiante"("rut_estudiante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrevista" ADD CONSTRAINT "entrevista_semestre_id_fkey" FOREIGN KEY ("semestre_id") REFERENCES "semestre"("semestre_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrevista" ADD CONSTRAINT "entrevista_rut_entrevistador_fkey" FOREIGN KEY ("rut_entrevistador") REFERENCES "usuario"("rut_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentario" ADD CONSTRAINT "comentario_fecha_hora_entrevista_rut_estudiante_fkey" FOREIGN KEY ("fecha_hora_entrevista", "rut_estudiante") REFERENCES "entrevista"("fecha_hora", "rut_estudiante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentario" ADD CONSTRAINT "comentario_rut_estudiante_fkey" FOREIGN KEY ("rut_estudiante") REFERENCES "estudiante"("rut_estudiante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_rut_usuario_fkey" FOREIGN KEY ("rut_usuario") REFERENCES "usuario"("rut_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
