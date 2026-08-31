-- Los comentarios de entrevista dejan de tener tópico: cada entrevista pasa a
-- tener un único comentario general.

-- 1. Fusión de datos existentes. Una entrevista con varios comentarios se
--    consolida en el más antiguo, anteponiendo la etiqueta del tópico a cada
--    bloque para no perder de qué hablaba cada uno. Las entrevistas que ya
--    tenían un solo comentario se dejan intactas, sin prefijo.
WITH fusion AS (
  SELECT
    entrevista_id,
    MIN(id) AS id_destino,
    string_agg(
      CASE "topico"
        WHEN 'GENERAL'    THEN 'General'
        WHEN 'ACADEMICO'  THEN 'Académico'
        WHEN 'REL_INTER'  THEN 'Relaciones interpersonales'
        WHEN 'SALUD'      THEN 'Salud'
        WHEN 'ACTS_EXTRA' THEN 'Actividades extracurriculares'
      END || E':' || E'\n' || texto,
      E'\n\n' ORDER BY created_at, id
    ) AS texto_fusionado
  FROM "comentario"
  GROUP BY entrevista_id
  HAVING COUNT(*) > 1
)
UPDATE "comentario" c
SET texto = f.texto_fusionado
FROM fusion f
WHERE c.id = f.id_destino;

DELETE FROM "comentario" c
USING (
  SELECT entrevista_id, MIN(id) AS id_destino
  FROM "comentario"
  GROUP BY entrevista_id
) k
WHERE c.entrevista_id = k.entrevista_id
  AND c.id <> k.id_destino;

-- 2. Fuera el tópico y su enum.
DROP INDEX "comentario_entrevista_id_topico_key";
ALTER TABLE "comentario" DROP COLUMN "topico";
DROP TYPE "Topico";

-- 3. Un comentario por entrevista (relación 1-1).
CREATE UNIQUE INDEX "comentario_entrevista_id_key" ON "comentario"("entrevista_id");
