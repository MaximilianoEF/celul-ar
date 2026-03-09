import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, rowToSmartphone, SmartphoneRow, StorePriceRow } from '@/lib/supabase';
import type { Smartphone, StorePrice } from '@/data/smartphones';

// ─── Query Keys ─────────────────────────────────────────────────────────────
export const phoneKeys = {
  all: ['phones'] as const,
  lists: () => [...phoneKeys.all, 'list'] as const,
  detail: (id: string) => [...phoneKeys.all, 'detail', id] as const,
};

// ─── Fetchers ────────────────────────────────────────────────────────────────
async function fetchPhones(): Promise<Smartphone[]> {
  const [{ data: phones, error: phonesError }, { data: prices, error: pricesError }] =
    await Promise.all([
      supabase.from('smartphones').select('*').order('year', { ascending: false }),
      supabase.from('store_prices').select('*'),
    ]);

  if (phonesError) throw new Error(phonesError.message);
  if (pricesError) throw new Error(pricesError.message);

  return (phones as SmartphoneRow[]).map(phone =>
    rowToSmartphone(
      phone,
      (prices as StorePriceRow[]).filter(p => p.smartphone_id === phone.id)
    )
  );
}

async function fetchPhone(id: string): Promise<Smartphone> {
  const [{ data: phone, error: phoneError }, { data: prices, error: pricesError }] =
    await Promise.all([
      supabase.from('smartphones').select('*').eq('id', id).single(),
      supabase.from('store_prices').select('*').eq('smartphone_id', id),
    ]);

  if (phoneError) throw new Error(phoneError.message);
  if (pricesError) throw new Error(pricesError.message);

  return rowToSmartphone(phone as SmartphoneRow, prices as StorePriceRow[]);
}

// ─── Hooks de lectura ────────────────────────────────────────────────────────
export function usePhones() {
  return useQuery({
    queryKey: phoneKeys.lists(),
    queryFn: fetchPhones,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function usePhone(id: string) {
  return useQuery({
    queryKey: phoneKeys.detail(id),
    queryFn: () => fetchPhone(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Tipos para mutaciones ───────────────────────────────────────────────────
// ml_price_updated_at se excluye del input porque es gestionado exclusivamente
// por el RPC update_ml_price (con SECURITY DEFINER). No se pasa en insert/update.
type PhoneInput = Omit<SmartphoneRow, 'created_at' | 'updated_at' | 'ml_price_updated_at'>;
type PriceInput = Omit<StorePriceRow, 'id' | 'smartphone_id' | 'created_at'>;

// ─── Hooks de escritura (admin) ──────────────────────────────────────────────
export function useCreatePhone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ phone, prices }: { phone: PhoneInput; prices: PriceInput[] }) => {
      const { error: phoneError } = await supabase.from('smartphones').insert(phone);
      if (phoneError) throw new Error(phoneError.message);

      if (prices.length > 0) {
        const { error: priceError } = await supabase
          .from('store_prices')
          .insert(prices.map(p => ({ ...p, smartphone_id: phone.id })));
        if (priceError) throw new Error(priceError.message);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: phoneKeys.all }),
  });
}

export function useUpdatePhone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      phone,
      prices,
    }: {
      id: string;
      phone: Partial<PhoneInput>;
      prices: PriceInput[];
    }) => {
      const { error: phoneError } = await supabase
        .from('smartphones')
        .update({ ...phone, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (phoneError) throw new Error(phoneError.message);

      // Reemplaza todos los precios: delete + re-insert
      await supabase.from('store_prices').delete().eq('smartphone_id', id);
      if (prices.length > 0) {
        const { error: priceError } = await supabase
          .from('store_prices')
          .insert(prices.map(p => ({ ...p, smartphone_id: id })));
        if (priceError) throw new Error(priceError.message);
      }
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: phoneKeys.all });
      qc.invalidateQueries({ queryKey: phoneKeys.detail(id) });
    },
  });
}

export function useDeletePhone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('smartphones').delete().eq('id', id);
      if (error) throw new Error(error.message);
      // store_prices se elimina en cascada por FK constraint
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: phoneKeys.all }),
  });
}

// ─── Helper para convertir StorePrice[] del frontend al formato de DB ────────
export function storePricesToRows(prices: StorePrice[]): PriceInput[] {
  return prices.map(p => ({
    store: p.store,
    price: p.price,
    url: p.url || null,
    available: p.available,
  }));
}
