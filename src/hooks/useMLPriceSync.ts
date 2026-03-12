/**
 * useMLPriceSync — persiste en la DB el precio mínimo de Mercado Libre.
 *
 * Recibe los listings ya obtenidos por useLiveMLPrice (sin hacer un fetch adicional).
 * Si el precio en DB tiene más de 30 días (o nunca se sincronizó), guarda el nuevo
 * precio mínimo via el RPC update_ml_price (SECURITY DEFINER).
 *
 * Flujo:
 *   1. PhoneDetail carga → useLiveMLPrice trae los listings de ML
 *   2. useMLPriceSync recibe esos listings
 *   3. Si mlPriceUpdatedAt es null o >30 días → llama a update_ml_price(id, precio)
 *   4. Invalida el caché → PhoneCard, Compare y PhoneDetail muestran el precio nuevo
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Smartphone } from '@/data/smartphones';
import type { MLListing } from './useLiveMLPrice';
import { phoneKeys } from './usePhones';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function useMLPriceSync(
  phone: Smartphone | undefined,
  mlListings: MLListing[]
): void {
  const qc = useQueryClient();
  const syncing = useRef(false);

  useEffect(() => {
    // Necesitamos datos del teléfono Y al menos un listing de ML
    if (!phone || syncing.current || mlListings.length === 0) return;

    // ¿El precio en DB está desactualizado?
    const updatedAt = phone.mlPriceUpdatedAt
      ? new Date(phone.mlPriceUpdatedAt).getTime()
      : 0; // null = nunca sincronizado → siempre es stale
    const isStale = Date.now() - updatedAt > THIRTY_DAYS_MS;

    if (!isStale) return; // Precio fresco (< 30 días) → no hacer nada

    // Tomamos el precio más bajo de los listings ya filtrados por useLiveMLPrice
    const lowestPrice = mlListings[0]?.price;
    if (!lowestPrice || lowestPrice <= 0) return;

    syncing.current = true;

    // Guarda en DB via RPC (SECURITY DEFINER permite acceso anónimo)
    supabase
      .rpc('update_ml_price', {
        p_smartphone_id: phone.id,
        p_price: lowestPrice,
      })
      .then(({ error }) => {
        if (!error) {
          // Invalida el caché para que todos los componentes reflejen el nuevo precio
          qc.invalidateQueries({ queryKey: phoneKeys.all });
          qc.invalidateQueries({ queryKey: phoneKeys.detail(phone.id) });
        } else {
          // El RPC no existe todavía → la migración de Supabase no fue ejecutada
          console.warn(
            '[useMLPriceSync] No se pudo guardar el precio. ' +
            'Asegurate de ejecutar supabase/migrations/20250309_ml_price_cache.sql en Supabase.',
            error.message
          );
        }
      })
      .catch((err) => {
        console.warn('[useMLPriceSync] Error de red:', err);
      })
      .finally(() => {
        syncing.current = false;
      });

  // mlListings.length como dependencia: re-corre cuando llegan los listings
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone?.id, phone?.mlPriceUpdatedAt, mlListings.length]);
}
