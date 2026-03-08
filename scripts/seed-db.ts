/**
 * Script de migración: importa los datos hardcodeados a Supabase.
 *
 * Uso:
 *   1. Crear .env.local con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
 *      (o usar la SERVICE_ROLE_KEY para bypassear RLS durante la migración)
 *   2. Ejecutar: npx tsx scripts/seed-db.ts
 *
 * NOTA: Para que RLS no bloquee los inserts, usá la SERVICE_ROLE_KEY
 * de tu proyecto Supabase (Settings > API > service_role key).
 * Nunca expongas esa key en el frontend.
 */

import { createClient } from '@supabase/supabase-js';
// @ts-expect-error: ts-node path aliases
import { smartphones } from '../src/data/smartphones';

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Falta VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log(`🌱 Importando ${smartphones.length} teléfonos a Supabase...`);

  let ok = 0;
  let failed = 0;

  for (const phone of smartphones) {
    // Separar precios del objeto principal
    const { prices, customImage, forWho, has5G, hasNFC, ...rest } = phone;

    const phoneRow = {
      id: rest.id,
      name: rest.name,
      brand: rest.brand,
      year: rest.year,
      gama: rest.gama,
      image: rest.image,
      custom_image: customImage ?? null,
      review: rest.review,
      specs: rest.specs,
      pros: rest.pros,
      cons: rest.cons,
      for_who: forWho,
      has_5g: has5G,
      has_nfc: hasNFC,
    };

    const priceRows = prices.map((p: { store: string; price: number | null; url: string; available: boolean }) => ({
      smartphone_id: phone.id,
      store: p.store,
      price: p.price,
      url: p.url || null,
      available: p.available,
    }));

    // Upsert smartphone
    const { error: phoneError } = await supabase
      .from('smartphones')
      .upsert(phoneRow, { onConflict: 'id' });

    if (phoneError) {
      console.error(`  ❌ ${phone.name}: ${phoneError.message}`);
      failed++;
      continue;
    }

    // Eliminar precios existentes y reinsertar
    await supabase.from('store_prices').delete().eq('smartphone_id', phone.id);

    if (priceRows.length > 0) {
      const { error: priceError } = await supabase
        .from('store_prices')
        .insert(priceRows);

      if (priceError) {
        console.error(`  ⚠️  ${phone.name} (precios): ${priceError.message}`);
      }
    }

    console.log(`  ✓ ${phone.name}`);
    ok++;
  }

  console.log(`\n✅ Importados: ${ok}  ❌ Fallidos: ${failed}`);
}

seed().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
