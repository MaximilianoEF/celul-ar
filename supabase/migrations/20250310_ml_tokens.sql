-- =====================================================
-- Migración: tabla ml_tokens para OAuth de Mercado Libre
-- Ejecutar en el SQL Editor de Supabase si ya corriste schema.sql
-- sin esta tabla (antes del 10/03/2025).
-- =====================================================

CREATE TABLE IF NOT EXISTS ml_tokens (
  id            TEXT PRIMARY KEY DEFAULT 'singleton',
  refresh_token TEXT NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ml_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage ml_tokens" ON ml_tokens;
CREATE POLICY "Admin manage ml_tokens"
  ON ml_tokens FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
