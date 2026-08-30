-- Elimina campos que el modelo de negocio no usa:
--   beneficio.monto        el catálogo no maneja importes
--   beneficio.descripcion  el nombre y el proveedor bastan para identificarlo
--   beneficio_estudiante.fin  una asignación no registra fecha de término
--
-- DESTRUCTIVO: los datos de estas tres columnas se pierden. Los valores del
-- catálogo eran los del seeder (`src/seeder/data/beneficios.data.ts`), que
-- también dejó de traerlos; si hicieran falta, recuperarlos del historial de
-- git antes de aplicar esto.

ALTER TABLE "beneficio" DROP COLUMN "monto";
ALTER TABLE "beneficio" DROP COLUMN "descripcion";
ALTER TABLE "beneficio_estudiante" DROP COLUMN "fin";
