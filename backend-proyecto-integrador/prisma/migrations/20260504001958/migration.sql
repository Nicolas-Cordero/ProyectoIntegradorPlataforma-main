/*
  Warnings:

  - Changed the type of `rol` on the `usuario` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UserRol" AS ENUM ('ADMIN', 'TUTOR', 'VISITA', 'ESTUDIANTE');

-- AlterTable
ALTER TABLE "usuario" DROP COLUMN "rol",
ADD COLUMN     "rol" "UserRol" NOT NULL;

-- DropEnum
DROP TYPE "RolUsuario";
