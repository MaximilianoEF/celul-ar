-- =====================================================
-- Migración: caché de precio ML en la tabla smartphones
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- ─── Nuevas columnas ──────────────────────────────────────────────────────────
-- ml_lowest_price       → precio mínimo cacheado desde la API de Mercado Libre
-- ml_price_updated_at   → cuándo se actualizó por última vez (null = nunca)
ALTER TABLE smartphones
  ADD COLUMN IF NOT EXISTS ml_lowest_price     INTEGER,
  ADD COLUMN IF NOT EXISTS ml_price_updated_at TIMESTAMPTZ;

-- ─── Función RPC para actualizar el precio ML ─────────────────────────────────
-- SECURITY DEFINER: se ejecuta con permisos del dueño de la función,
-- lo que permite que usuarios anónimos actualicen SOLO estas dos columnas
-- sin exponer escritura general sobre la tabla smartphones.
CREATE OR REPLACE FUNCTION update_ml_price(
  p_smartphone_id TEXT,
  p_price         INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE smartphones
  SET
    ml_lowest_price     = p_price,
    ml_price_updated_at = now()
  WHERE id = p_smartphone_id;
END;
$$;

-- Permiso de ejecución para usuarios anónimos y autenticados
GRANT EXECUTE ON FUNCTION update_ml_price(TEXT, INTEGER) TO anon, authenticated;

-- =====================================================
-- Después de ejecutar esta migración:
-- 1. Todos los teléfonos existentes tendrán ml_lowest_price = NULL
-- 2. El hook useMLPriceSync detectará el NULL y disparará una sincronización
--    automática la primera vez que se visite el detalle de cada teléfono.
-- 3. Al agregar un teléfono nuevo, el admin ingresa el precio inicial
--    (se guarda en ml_lowest_price con ml_price_updated_at = NULL para
--    que la próxima visita lo actualice con el precio real de ML).
-- =====================================================
