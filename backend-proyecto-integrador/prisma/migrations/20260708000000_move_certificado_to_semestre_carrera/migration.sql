-- Certificado de notas pasa a vivir en semestre_carrera (uno por carrera+semestre)
-- en vez de en cada ramo (uno por ramo, lo que permitía subir el mismo PDF repetido
-- una vez por cada ramo del semestre).

ALTER TABLE "semestre_carrera" ADD COLUMN "url_certificado" TEXT;

-- Migración de datos: para cada (semestre_id, codigo_carrera) con al menos un
-- ramo que tenga certificado, se copia el del ramo con mayor id (proxy del más
-- reciente en orden de inserción) como certificado del semestre. Si varios
-- ramos del mismo semestre tenían certificados distintos, los demás se
-- pierden en este paso — revisar manualmente en producción si es necesario
-- antes de aplicar esta migración.
UPDATE "semestre_carrera" sc
SET "url_certificado" = sub.url_certificado
FROM (
  SELECT DISTINCT ON (semestre_id, codigo_carrera)
    semestre_id, codigo_carrera, url_certificado
  FROM "ramo"
  WHERE url_certificado IS NOT NULL
  ORDER BY semestre_id, codigo_carrera, id DESC
) sub
WHERE sc."semestre_id" = sub.semestre_id
  AND sc."codigo_carrera" = sub.codigo_carrera;

ALTER TABLE "ramo" DROP COLUMN "url_certificado";
