/**
 * useLiveMLPrice — obtiene listados de Mercado Libre con precio actualizado.
 *
 * Estrategia en cascada (la primera que funcione gana):
 *   1. API oficial de ML  → https://api.mercadolibre.com/sites/MLA/search (sin auth)
 *   2. API vía CORS proxy → misma API pero enrutada por el proxy (distinta IP, sin headers de browser)
 *   3. Scraping del sitio → https://listado.mercadolibre.com.ar/{query} via proxy
 *      - Sub-estrategia A: JSON-LD (<script type="application/ld+json">)
 *      - Sub-estrategia B: window.__INITIAL_STATE__ o __PRELOADED_STATE__
 *      - Sub-estrategia C: parseo de HTML (elementos .andes-money-amount__fraction)
 */

import { useQuery } from '@tanstack/react-query';

// URL base de Supabase para llamar a la Edge Function ml-search
const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export interface MLListing {
  id: string;
  title: string;
  price: number;
  permalink: string;
  thumbnail: string;
  soldQuantity: number;
}

// ─── Proxies CORS (en orden de preferencia) ───────────────────────────────────
const PROXIES = [
  (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

async function proxiedFetch(url: string, timeout = 15_000): Promise<string | null> {
  for (const buildProxy of PROXIES) {
    try {
      const res = await fetch(buildProxy(url), { signal: AbortSignal.timeout(timeout) });
      if (res.ok) return res.text();
    } catch { /* siguiente proxy */ }
  }
  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseApiResults(results: any[]): MLListing[] {
  return results
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

// ─── Estrategia 0: Supabase Edge Function ml-search (más confiable) ──────────
// Usa las credenciales OAuth de ML almacenadas en Supabase Secrets.
// Solo disponible cuando ML_CLIENT_ID y ML_CLIENT_SECRET están configurados.
async function tryEdgeFunction(query: string): Promise<MLListing[] | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  const url = `${SUPABASE_URL}/functions/v1/ml-search?q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const data: { results?: unknown[]; error?: string; source?: string } = await res.json();
    if (data.error || !data.results) return null;
    // Si el Edge Function devolvió resultados de Fravega (ML bloqueado), no los mostramos
    // en la sección ML → useLiveFravegaPrice los mostrará en la sección Frávega.
    if (data.source === 'fravega') return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listings = parseApiResults(data.results as any[]);
    return listings.length > 0 ? listings : null;
  } catch {
    return null;
  }
}

// ─── Estrategia 1: API oficial de ML ─────────────────────────────────────────
async function tryDirectApi(query: string): Promise<MLListing[] | null> {
  const params = new URLSearchParams({
    q: query,
    condition: 'new',
    limit: '6',
    sort: 'price_asc',
  });
  const apiUrl = `https://api.mercadolibre.com/sites/MLA/search?${params}`;
  try {
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(8_000) });
    if (!res.ok) return null;
    const data: { results: unknown[] } = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listings = parseApiResults(data.results as any[]);
    return listings.length > 0 ? listings : null;
  } catch {
    return null;
  }
}

// ─── Estrategia 2: Scraping del sitio de ML ───────────────────────────────────
// Nota: la API oficial (/sites/MLA/search) requiere OAuth independientemente del
// origen o User-Agent — incluso via proxy CORS devuelve 403. Por eso saltamos
// directo al scraping del sitio web, que no necesita autenticación.
async function tryMLScraping(query: string): Promise<MLListing[] | null> {
  // URL de listado de ML Argentina: /SLUG?condition=new&sort=price_asc
  const slug = query.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // quitar tildes
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  const searchUrl = `https://listado.mercadolibre.com.ar/${slug}?condition=new&sort=price_asc`;
  const html = await proxiedFetch(searchUrl, 20_000);
  if (!html) return null;

  // ── Sub-estrategia A: JSON-LD ────────────────────────────────────────────
  const jsonLdRe = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = jsonLdRe.exec(html)) !== null) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const schema: any = JSON.parse(m[1]);
      const elements =
        schema?.['@type'] === 'ItemList'
          ? schema.itemListElement
          : Array.isArray(schema)
          ? schema.flatMap((s: { '@type': string; itemListElement?: unknown[] }) =>
              s['@type'] === 'ItemList' ? (s.itemListElement ?? []) : []
            )
          : null;

      if (elements?.length) {
        const listings: MLListing[] = elements
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((el: any) => el.item ?? el)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((item: any) => {
            const price = item.offers?.price ?? item.price ?? 0;
            return price > 80_000;
          })
          .slice(0, 4)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any, i: number) => ({
            id: item.productID ?? String(i),
            title: item.name ?? '',
            price: item.offers?.price ?? item.price,
            permalink: item.url ?? item.offers?.url ?? '',
            thumbnail: Array.isArray(item.image)
              ? (item.image[0] as string)
              : (item.image ?? ''),
            soldQuantity: 0,
          }));
        if (listings.length > 0) return listings;
      }
    } catch { /* siguiente estrategia */ }
  }

  // ── Sub-estrategia B: window.__INITIAL_STATE__ / __PRELOADED_STATE__ ─────
  const statePatterns = [
    /window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});\s*(?:window\.|<\/script>)/,
    /window\.__PRELOADED_STATE__\s*=\s*({[\s\S]*?});\s*(?:window\.|<\/script>)/,
    /window\.initialState\s*=\s*({[\s\S]*?});\s*(?:window\.|<\/script>)/,
  ];
  for (const re of statePatterns) {
    const stateMatch = html.match(re);
    if (!stateMatch) continue;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state: any = JSON.parse(stateMatch[1]);
      // Buscar un array de resultados dentro del estado
      const findResults = (obj: unknown, depth = 0): MLListing[] | null => {
        if (depth > 6 || typeof obj !== 'object' || !obj) return null;
        if (Array.isArray(obj) && obj.length > 0 && obj[0]?.price > 80_000) {
          return parseApiResults(obj);
        }
        for (const val of Object.values(obj as Record<string, unknown>)) {
          const result = findResults(val, depth + 1);
          if (result) return result;
        }
        return null;
      };
      const found = findResults(state);
      if (found) return found;
    } catch { /* siguiente */ }
  }

  // ── Sub-estrategia C: parseo de HTML ─────────────────────────────────────
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const cards = Array.from(doc.querySelectorAll(
    '.ui-search-result__wrapper, .poly-card__portada, [class*="ui-search-layout__item"]'
  ));

  const listings: MLListing[] = [];
  for (const card of cards.slice(0, 8)) {
    const title = card.querySelector(
      '[class*="ui-search-item__title"], [class*="poly-component__title"], h2, h3'
    )?.textContent?.trim();

    const intEl = card.querySelector(
      '.andes-money-amount__fraction, [class*="price-tag-fraction"]'
    );
    const price = intEl ? parseInt(intEl.textContent?.replace(/\D/g, '') ?? '0', 10) : 0;

    const link = (card.querySelector('a[href*="mercadolibre"]') as HTMLAnchorElement | null)
      ?.href ?? '';

    const img = card.querySelector('img') as HTMLImageElement | null;
    const thumbnail = img?.dataset?.src ?? img?.src ?? '';

    if (!title || price < 80_000) continue;

    listings.push({
      id: String(listings.length),
      title,
      price,
      permalink: link,
      thumbnail,
      soldQuantity: 0,
    });
  }

  return listings.length > 0 ? listings : null;
}

// ─── Función principal ────────────────────────────────────────────────────────
export async function fetchMLListings(phoneName: string): Promise<MLListing[]> {
  // Los iPhone se buscan sin "Apple" → mejores resultados en ML
  const query = phoneName.replace(/^Apple\s+/i, '');

  // Estrategia 0: Edge Function (OAuth seguro server-side) — más confiable
  const edge = await tryEdgeFunction(query);
  if (edge) return edge;

  // Estrategia 1: API oficial directa (funciona si ML vuelve a permitir acceso sin auth)
  const direct = await tryDirectApi(query);
  if (direct) return direct;

  // Estrategia 2: Scraping del sitio de ML (no requiere auth, accede al HTML público)
  const scraped = await tryMLScraping(query);
  if (scraped) return scraped;

  return [];
}

// ─── React Query hook ─────────────────────────────────────────────────────────
export function useLiveMLPrice(phoneName: string, year?: number) {
  void year; // reservado para uso futuro
  return useQuery({
    queryKey: ['live-ml', phoneName],
    queryFn: () => fetchMLListings(phoneName),
    enabled: !!phoneName,
    staleTime: 1000 * 60 * 10,  // 10 min cache → no re-fetch innecesario
    gcTime: 1000 * 60 * 20,
    retry: 1,
  });
}
