-- Cantidad de adicionales cobrados en una cobranza (ej. 3 exámenes de 50.000).
-- La factura la usa para imprimir CANT y PRECIO UNITARIO del adicional.
--
-- Queda NULL en las cobranzas anteriores a este cambio: para ellas la factura
-- deduce la cantidad del detalle (ej. "MAYO-AGOSTO-NOVIEMBRE" -> 3).
-- Las cobranzas nuevas siempre la guardan (1 si no se indica).
--
-- CORRER ANTES DE DEPLOYAR la API que inserta esta columna.

ALTER TABLE cobranza
  ADD COLUMN IF NOT EXISTS "CobranzaAdicionalCantidad" SMALLINT;
