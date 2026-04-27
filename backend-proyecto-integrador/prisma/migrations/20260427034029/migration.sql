/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apellido` to the `estudiante` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apellido` to the `usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "estudiante" ADD COLUMN     "apellido" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "apellido" TEXT NOT NULL,
ADD COLUMN     "reset_token" TEXT,
ADD COLUMN     "reset_token_expires" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");
