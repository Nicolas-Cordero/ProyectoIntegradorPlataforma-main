/*
  Warnings:

  - You are about to drop the column `NEM` on the `estudiante` table. All the data in the column will be lost.
  - Added the required column `nem` to the `estudiante` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "estudiante" DROP COLUMN "NEM",
ADD COLUMN     "nem" DECIMAL(3,1) NOT NULL;
