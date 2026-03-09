/**
 * useMLPriceSync — sincroniza el precio mínimo de Mercado Libre en la base de datos.
 *
 * ¿Cuándo actualiza?
 *   - Cuando ml_price_updated_at es null (teléfono recién creado o nunca sincronizado)
 *   - Cuando han pasado más de 30 días desde la última sincronización
 *
 * ¿Cómo funciona?
 *   1. Verifica si el precio en DB está desactualizado (>30 días o null)
 *   2. Consulta la API pública de Mercado Libre (sin autenticación)
 *   3. Guarda el precio mínimo en DB via el RPC update_ml_price (SECURITY DEFINER)
 *   4. Invalida el caché de React Query → los componentes se actualizan automáticamente
 *
 * Se llama desde PhoneDetail al abrir el detalle de un teléfono.
 * El costo es 1 request a ML por teléfono cada 30 días.
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Smartphone } from '@/data/smartphones';
import { phoneKeys } from './usePhones';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

async function fetchLowestMLPrice(phoneName: string): Promise<number | null> {
  // ML lista los iPhone sin el prefijo "Apple" → mejores resultados
  const query = phoneName.replace(/^Apple\s+/i, '');

  const params = new URLSearchParams({
    q: query,
    condition: 'new',
    limit: '6',
    sort: 'price_asc',
  });

  const res = await fetch(
    `https://api.mercadolibre.com/sites/MLA/search?${params.toString()}`
  );
  if (!res.ok) return null;

  const data: { results: { price: number }[] } = await res.json();

  // Descartamos accesorios (precio muy bajo) y tomamos el más barato
  const listings = data.results.filter((item) => item.price > 80_000);
  return listings[0]?.price ?? null;
}

export function useMLPriceSync(phone: Smartphone | undefined): void {
  const qc = useQueryClient();
  const syncing = useRef(false);

  useEffect(() => {
    if (!phone || syncing.current) return;

    // ¿Está el precio desactualizado?
    const updatedAt = phone.mlPriceUpdatedAt
      ? new Date(phone.mlPriceUpdatedAt).getTime()
      : 0;
    const isStale = Date.now() - updatedAt > THIRTY_DAYS_MS;

    if (!isStale) return; // Precio fresco → no hacer nada

    syncing.current = true;

    fetchLowestMLPrice(phone.name)
      .then(async (price) => {
        if (price == null) return; // ML no devolvió resultados → mantener el precio actual

        const { error } = await supabase.rpc('update_ml_price', {
          p_smartphone_id: phone.id,
          p_price: price,
        });

        if (!error) {
          // Invalida el caché para que PhoneCard, Compare y PhoneDetail reflejen el nuevo precio
          qc.invalidateQueries({ queryKey: phoneKeys.all });
          qc.invalidateQueries({ queryKey: phoneKeys.detail(phone.id) });
        } else {
          console.warn('[useMLPriceSync] No se pudo guardar el precio:', error.message);
        }
      })
      .catch((err) => {
        console.warn('[useMLPriceSync] Error al consultar ML:', err);
      })
      .finally(() => {
        syncing.current = false;
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone?.id, phone?.mlPriceUpdatedAt]);
}
