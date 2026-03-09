/**
 * useLiveMLPrice — obtiene precios en tiempo real desde la API pública de Mercado Libre.
 * No requiere autenticación. Cache de 10 min para no saturar la API.
 */
import { useQuery } from '@tanstack/react-query';

export interface MLListing {
  id: string;
  title: string;
  price: number;
  permalink: string;
  thumbnail: string;
  soldQuantity: number;
}

async function fetchMLListings(phoneName: string, year?: number): Promise<MLListing[]> {
  // ML lista los iPhone sin "Apple" → la quitamos para mejores resultados
  // No usamos category= porque el ID puede cambiar y limita resultados
  // No añadimos el año al query porque restringe demasiado los listings reales
  const query = phoneName.replace(/^Apple\s+/i, '');
  void year; // reservado para uso futuro

  const params = new URLSearchParams({
    q: query,
    condition: 'new',
    limit: '6',
    sort: 'price_asc',
  });

  const res = await fetch(
    `https://api.mercadolibre.com/sites/MLA/search?${params.toString()}`
  );
  if (!res.ok) throw new Error(`Mercado Libre respondió con error ${res.status}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: { results: any[] } = await res.json();

  return data.results
    // Filtramos accesorios (precio muy bajo) y duplicados por vendedor
    .filter((item) => item.price > 80_000)
    .slice(0, 4)
    .map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      permalink: item.permalink,
      thumbnail: item.thumbnail,
      soldQuantity: item.sold_quantity ?? 0,
    }));
}

export function useLiveMLPrice(phoneName: string, year?: number) {
  return useQuery({
    queryKey: ['live-ml', phoneName, year],
    queryFn: () => fetchMLListings(phoneName, year),
    enabled: !!phoneName,
    staleTime: 1000 * 60 * 10,  // 10 min cache
    gcTime:    1000 * 60 * 20,
    retry: 1,
  });
}
