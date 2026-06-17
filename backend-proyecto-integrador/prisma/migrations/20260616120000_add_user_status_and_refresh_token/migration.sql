-- AlterTable
ALTER TABLE "usuario" ADD COLUMN "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "must_change_password" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "refresh_token" (
    "id" SERIAL NOT NULL,
    "rut_usuario" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "token_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_token_hash_key" ON "refresh_token"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_token_rut_usuario_idx" ON "refresh_token"("rut_usuario");

-- AddForeignKey
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_rut_usuario_fkey" FOREIGN KEY ("rut_usuario") REFERENCES "usuario"("rut_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
