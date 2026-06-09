/*
  Warnings:

  - You are about to drop the `nota` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "nota" DROP CONSTRAINT "nota_ramo_id_fkey";

-- AlterTable
ALTER TABLE "ramo" ADD COLUMN     "nota_final" DECIMAL(65,30);

-- DropTable
DROP TABLE "nota";
