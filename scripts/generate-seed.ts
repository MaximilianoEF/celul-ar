/**
 * Genera supabase/seed.sql a partir de src/data/smartphones.ts
 * Uso: npx tsx scripts/generate-seed.ts > supabase/seed.sql
 */

import { smartphones } from '../src/data/smartphones.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function esc(s: string | null | undefined): string {
  if (s == null) return 'NULL';
  return `'${s.replace(/'/g, "''")}'`;
}

function escNum(n: number | null | undefined): string {
  if (n == null) return 'NULL';
  return String(n);
}

function escBool(b: boolean): string {
  return b ? 'true' : 'false';
}

function escJson(obj: object): string {
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

function escArray(arr: string[]): string {
  const escaped = arr.map(s => `'${s.replace(/'/g, "''")}'`).join(',');
  return `ARRAY[${escaped}]::text[]`;
}

const lines: string[] = [
  '-- =====================================================',
  '-- CeluAR — Seed de datos (generado automáticamente)',
  '-- Ejecutar en Supabase SQL Editor DESPUÉS de schema.sql',
  '-- =====================================================',
  '',
  '-- Limpiar datos previos (orden inverso por FK)',
  'TRUNCATE TABLE store_prices CASCADE;',
  'TRUNCATE TABLE smartphones CASCADE;',
  '',
  '-- ─── Smartphones ──────────────────────────────────────────────────────────────',
];

for (const phone of smartphones) {
  lines.push(
    `INSERT INTO smartphones (id, name, brand, year, gama, image, custom_image, review, specs, pros, cons, for_who, has_5g, has_nfc) VALUES (`,
    `  ${esc(phone.id)},`,
    `  ${esc(phone.name)},`,
    `  ${esc(phone.brand)},`,
    `  ${escNum(phone.year)},`,
    `  ${esc(phone.gama)},`,
    `  ${esc(phone.image)},`,
    `  ${esc(phone.customImage ?? null)},`,
    `  ${esc(phone.review)},`,
    `  ${escJson(phone.specs)},`,
    `  ${escArray(phone.pros)},`,
    `  ${escArray(phone.cons)},`,
    `  ${esc(phone.forWho)},`,
    `  ${escBool(phone.has5G)},`,
    `  ${escBool(phone.hasNFC)}`,
    `) ON CONFLICT (id) DO UPDATE SET`,
    `  name = EXCLUDED.name,`,
    `  brand = EXCLUDED.brand,`,
    `  year = EXCLUDED.year,`,
    `  gama = EXCLUDED.gama,`,
    `  image = EXCLUDED.image,`,
    `  custom_image = EXCLUDED.custom_image,`,
    `  review = EXCLUDED.review,`,
    `  specs = EXCLUDED.specs,`,
    `  pros = EXCLUDED.pros,`,
    `  cons = EXCLUDED.cons,`,
    `  for_who = EXCLUDED.for_who,`,
    `  has_5g = EXCLUDED.has_5g,`,
    `  has_nfc = EXCLUDED.has_nfc,`,
    `  updated_at = now();`,
    '',
  );
}

lines.push('-- ─── Precios por tienda ──────────────────────────────────────────────────────');

for (const phone of smartphones) {
  for (const price of phone.prices) {
    const priceVal = price.price != null ? String(price.price) : 'NULL';
    const url = price.url ? esc(price.url) : 'NULL';
    lines.push(
      `INSERT INTO store_prices (smartphone_id, store, price, url, available) VALUES (${esc(phone.id)}, ${esc(price.store)}, ${priceVal}, ${url}, ${escBool(price.available)});`
    );
  }
}

lines.push('');
lines.push('-- Fin del seed');

const output = lines.join('\n');
const outPath = join(__dirname, '..', 'supabase', 'seed.sql');
writeFileSync(outPath, output, 'utf-8');
console.log(`✅ Generado: supabase/seed.sql (${smartphones.length} teléfonos)`);
