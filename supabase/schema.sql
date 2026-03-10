-- =====================================================
-- CeluAR — Schema de base de datos (Supabase/PostgreSQL)
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- ─── Tabla principal de smartphones ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smartphones (
  id                   TEXT PRIMARY KEY,
  name                 TEXT NOT NULL,
  brand                TEXT NOT NULL,
  year                 INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2035),
  gama                 TEXT NOT NULL CHECK (gama IN ('alta', 'media', 'baja')),
  image                TEXT NOT NULL,
  custom_image         TEXT,
  review               TEXT,
  specs                JSONB NOT NULL DEFAULT '{}',
  pros                 TEXT[] NOT NULL DEFAULT '{}',
  cons                 TEXT[] NOT NULL DEFAULT '{}',
  for_who              TEXT,
  has_5g               BOOLEAN NOT NULL DEFAULT false,
  has_nfc              BOOLEAN NOT NULL DEFAULT false,
  -- Precio mínimo cacheado desde la API pública de Mercado Libre.
  -- null = nunca sincronizado; se actualiza cada 30 días via RPC update_ml_price.
  ml_lowest_price      INTEGER,
  ml_price_updated_at  TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Tabla de precios por tienda ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_prices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  smartphone_id TEXT NOT NULL REFERENCES smartphones(id) ON DELETE CASCADE,
  store         TEXT NOT NULL,
  price         INTEGER,          -- precio en ARS (sin decimales)
  url           TEXT,
  available     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para búsquedas por smartphone_id
CREATE INDEX IF NOT EXISTS idx_store_prices_smartphone_id ON store_prices(smartphone_id);

-- ─── Función RPC para actualizar precio ML (SECURITY DEFINER) ────────────────
-- Permite que usuarios anónimos actualicen SOLO ml_lowest_price y ml_price_updated_at
-- sin exponer escritura general sobre toda la tabla smartphones.
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

GRANT EXECUTE ON FUNCTION update_ml_price(TEXT, INTEGER) TO anon, authenticated;

-- ─── Trigger: actualiza updated_at automáticamente ───────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS smartphones_updated_at ON smartphones;
CREATE TRIGGER smartphones_updated_at
  BEFORE UPDATE ON smartphones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Row Level Security (RLS) ─────────────────────────────────────────────────
ALTER TABLE smartphones ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_prices ENABLE ROW LEVEL SECURITY;

-- Lectura pública (sin autenticación)
DROP POLICY IF EXISTS "Public read smartphones" ON smartphones;
CREATE POLICY "Public read smartphones"
  ON smartphones FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read store_prices" ON store_prices;
CREATE POLICY "Public read store_prices"
  ON store_prices FOR SELECT USING (true);

-- Escritura solo para usuarios autenticados (admins)
DROP POLICY IF EXISTS "Admin write smartphones" ON smartphones;
CREATE POLICY "Admin write smartphones"
  ON smartphones FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin write store_prices" ON store_prices;
CREATE POLICY "Admin write store_prices"
  ON store_prices FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- INSTRUCCIONES:
-- 1. Ejecutá este archivo en el SQL Editor de Supabase
-- 2. Luego ejecutá supabase/seed.sql para cargar los datos
-- 3. En Authentication > Users, creá el usuario admin
-- =====================================================
