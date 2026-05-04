/*
  Warnings:

  - The primary key for the `audit_log` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fecha_hora` on the `audit_log` table. All the data in the column will be lost.
  - The primary key for the `comentario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fecha_hora_comentario` on the `comentario` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_hora_entrevista` on the `comentario` table. All the data in the column will be lost.
  - You are about to drop the column `rut_estudiante` on the `comentario` table. All the data in the column will be lost.
  - The primary key for the `entrevista` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `familiar` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `nota` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `codigo_carrera` on the `nota` table. All the data in the column will be lost.
  - You are about to drop the column `nrc` on the `nota` table. All the data in the column will be lost.
  - You are about to drop the column `rut_estudiante` on the `nota` table. All the data in the column will be lost.
  - You are about to drop the column `semestre_id` on the `nota` table. All the data in the column will be lost.
  - The primary key for the `ramo` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[entrevista_id,topico]` on the table `comentario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rut_estudiante,rut_entrevistador,fecha_hora]` on the table `entrevista` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rut_familiar,rut_estudiante]` on the table `familiar` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ramo_id,fecha_hora]` on the table `nota` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nrc,semestre_id,rut_estudiante,codigo_carrera]` on the table `ramo` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `estado` on the `beneficio_estudiante` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `entrevista_id` to the `comentario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `comentario` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `topico` on the `comentario` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updated_at` to the `entrevista` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `estado` on the `estudiante` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `ramo_id` to the `nota` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `estado` on the `ramo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `rol` on the `usuario` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EstadoBeneficio" AS ENUM ('ACTIVO', 'CONGELADO', 'FIRMADO', 'RECHAZADO', 'EN_TRAMITE');

-- CreateEnum
CREATE TYPE "EstadoRamo" AS ENUM ('APROBADO', 'REPROBADO', 'CURSANDO', 'RETIRADO');

-- CreateEnum
CREATE TYPE "Topico" AS ENUM ('ACADEMICO', 'PERSONAL', 'ECONOMICO', 'SALUD', 'FAMILIAR', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoEstudiante" AS ENUM ('ACTIVO', 'CONDICIONAL', 'SUSPENDIDO', 'RETIRADO', 'CONGELADO', 'EGRESADO', 'TITULADO');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'TUTOR', 'VISITA', 'ESTUDIANTE');

-- DropForeignKey
ALTER TABLE "comentario" DROP CONSTRAINT "comentario_fecha_hora_entrevista_rut_estudiante_fkey";

-- DropForeignKey
ALTER TABLE "comentario" DROP CONSTRAINT "comentario_rut_estudiante_fkey";

-- DropForeignKey
ALTER TABLE "nota" DROP CONSTRAINT "nota_nrc_semestre_id_rut_estudiante_codigo_carrera_fkey";

-- DropForeignKey
ALTER TABLE "nota" DROP CONSTRAINT "nota_rut_estudiante_fkey";

-- AlterTable
ALTER TABLE "audit_log" DROP CONSTRAINT "audit_log_pkey",
DROP COLUMN "fecha_hora",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "beneficio_estudiante" DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoBeneficio" NOT NULL;

-- AlterTable
ALTER TABLE "comentario" DROP CONSTRAINT "comentario_pkey",
DROP COLUMN "fecha_hora_comentario",
DROP COLUMN "fecha_hora_entrevista",
DROP COLUMN "rut_estudiante",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "entrevista_id" INTEGER NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "topico",
ADD COLUMN     "topico" "Topico" NOT NULL,
ADD CONSTRAINT "comentario_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "entrevista" DROP CONSTRAINT "entrevista_pkey",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "entrevista_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "estudiante" DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoEstudiante" NOT NULL;

-- AlterTable
ALTER TABLE "familiar" DROP CONSTRAINT "familiar_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "familiar_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "nota" DROP CONSTRAINT "nota_pkey",
DROP COLUMN "codigo_carrera",
DROP COLUMN "nrc",
DROP COLUMN "rut_estudiante",
DROP COLUMN "semestre_id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "ramo_id" INTEGER NOT NULL,
ADD CONSTRAINT "nota_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ramo" DROP CONSTRAINT "ramo_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoRamo" NOT NULL,
ADD CONSTRAINT "ramo_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "usuario" DROP COLUMN "rol",
ADD COLUMN     "rol" "RolUsuario" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "comentario_entrevista_id_topico_key" ON "comentario"("entrevista_id", "topico");

-- CreateIndex
CREATE UNIQUE INDEX "entrevista_rut_estudiante_rut_entrevistador_fecha_hora_key" ON "entrevista"("rut_estudiante", "rut_entrevistador", "fecha_hora");

-- CreateIndex
CREATE UNIQUE INDEX "familiar_rut_familiar_rut_estudiante_key" ON "familiar"("rut_familiar", "rut_estudiante");

-- CreateIndex
CREATE UNIQUE INDEX "nota_ramo_id_fecha_hora_key" ON "nota"("ramo_id", "fecha_hora");

-- CreateIndex
CREATE UNIQUE INDEX "ramo_nrc_semestre_id_rut_estudiante_codigo_carrera_key" ON "ramo"("nrc", "semestre_id", "rut_estudiante", "codigo_carrera");

-- AddForeignKey
ALTER TABLE "nota" ADD CONSTRAINT "nota_ramo_id_fkey" FOREIGN KEY ("ramo_id") REFERENCES "ramo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentario" ADD CONSTRAINT "comentario_entrevista_id_fkey" FOREIGN KEY ("entrevista_id") REFERENCES "entrevista"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
