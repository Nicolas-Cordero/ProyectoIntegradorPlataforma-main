-- Nuevo estado PENDIENTE para EstadoRamo.
-- Un ramo queda PENDIENTE cuando el semestre se cierra y todavía no tiene nota
-- final: sigue siendo editable con el semestre ya cerrado y no participa del
-- promedio general ni del promedio semestral.
ALTER TYPE "EstadoRamo" ADD VALUE 'PENDIENTE';
