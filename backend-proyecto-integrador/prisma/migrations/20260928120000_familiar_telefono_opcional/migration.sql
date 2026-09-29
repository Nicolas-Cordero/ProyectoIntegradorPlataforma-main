-- El teléfono de un familiar pasa a ser opcional: hay familiares que no tienen
-- número. La regla "un contacto de emergencia debe tener teléfono" se valida en
-- FamiliarService, no en la base.
ALTER TABLE "familiar" ALTER COLUMN "telefono" DROP NOT NULL;
