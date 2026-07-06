DROP INDEX "universidad_nombre_key";
CREATE UNIQUE INDEX "universidad_nombre_comuna_key" ON "universidad"("nombre", "comuna");
