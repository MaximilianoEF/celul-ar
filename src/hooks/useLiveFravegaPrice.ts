/**
 * useLiveFravegaPrice — obtiene el precio actual de Frávega.
 *
 * Estrategia en cascada:
 *   1. Supabase Edge Function ml-search (usa VTEX Intelligent Search API, server-side)
 *   2. Scraping via CORS proxy (fallback browser-side)
 */
import { useQuery } from '@tanstack/react-query';

export interface FravegaResult {
  title: string;
  price: number;
  url: string;
  thumbnail?: string;
}

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// ─── Estrategia 0: Edge Function (VTEX API server-side, sin CORS) ─────────────
async function tryEdgeFunctionFravega(query: string): Promise<FravegaResult | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const url = `${SUPABASE_URL}/functions/v1/ml-search?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'apikey': SUPABASE_ANON_KEY },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const data: { results?: Array<{ title: string; price: number; permalink: string; thumbnail: string; store: string }>; source?: string } = await res.json();
    if (!data.results?.length || data.source !== 'fravega') return null;
    const first = data.results[0];
    return { title: first.title, price: first.price, url: first.permalink, thumbnail: first.thumbnail };
  } catch {
    return null;
  }
}

const PROXIES = [
  (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

async function scrapeFravegaPrice(phoneName: string): Promise<FravegaResult | null> {
  // Para Apple, quitar "Apple" porque en Frávega los iPhone van sin la marca
  const query = phoneName.replace(/^Apple\s+/i, '');

  // 0. Edge Function (VTEX API server-side — más confiable que CORS proxy)
  const edgeResult = await tryEdgeFunctionFravega(query);
  if (edgeResult) return edgeResult;

  // 1. Fallback: CORS proxy + scraping browser-side
  const searchUrl = `https://www.fravega.com/l/?keyword=${encodeURIComponent(query)}`;
  let html = '';
  for (const buildProxy of PROXIES) {
    try {
      const res = await fetch(buildProxy(searchUrl), {
        signal: AbortSignal.timeout(12_000),
      });
      if (res.ok) {
        html = await res.text();
        break;
      }
    } catch {
      // Probar siguiente proxy
    }
  }

  if (!html) return null;

  const doc = new DOMParser().parseFromString(html, 'text/html');

  // ── Estrategia 1: __NEXT_DATA__ (Next.js SSR) ────────────────────────────
  const nextDataEl = doc.querySelector('#__NEXT_DATA__');
  if (nextDataEl?.textContent) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const json: any = JSON.parse(nextDataEl.textContent);
      const pageProps = json?.props?.pageProps ?? {};

      // Diferentes estructuras que Frávega puede tener según la versión de su sitio
      const products: unknown[] =
        pageProps?.results ??
        pageProps?.products ??
        pageProps?.data?.results ??
        pageProps?.data?.products ??
        pageProps?.searchResult?.results ??
        [];

      if (Array.isArray(products) && products.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = products[0] as any;
        const price: number =
          p?.offerPrice ?? p?.price ?? p?.salePrice ?? p?.sellingPrice ?? 0;
        const slug: string =
          p?.url ?? p?.slug ?? p?.href ?? p?.link ?? '';

        if (price > 0) {
          const fullUrl = slug.startsWith('http')
            ? slug
            : `https://www.fravega.com${slug}`;

          return {
            title: p?.title ?? p?.name ?? phoneName,
            price,
            url: fullUrl,
            thumbnail: p?.image ?? p?.thumbnail ?? p?.imageUrl ?? undefined,
          };
        }
      }
    } catch {
      // Si falla el JSON, intentar parsing HTML
    }
  }

  // ── Estrategia 2: meta og:price ──────────────────────────────────────────
  const ogPrice = doc.querySelector('meta[property="product:price:amount"]')?.getAttribute('content');
  const ogUrl   = doc.querySelector('meta[property="og:url"]')?.getAttribute('content');
  const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
  if (ogPrice && parseFloat(ogPrice) > 0) {
    return {
      title: ogTitle ?? phoneName,
      price: parseFloat(ogPrice),
      url: ogUrl ?? searchUrl,
    };
  }

  // ── Estrategia 3: data-price attribute ──────────────────────────────────
  const dataPriceEl = doc.querySelector('[data-price]');
  const dataPrice = dataPriceEl?.getAttribute('data-price');
  if (dataPrice && parseInt(dataPrice) > 0) {
    return {
      title: phoneName,
      price: parseInt(dataPrice),
      url: searchUrl,
    };
  }

  return null; // No se pudo obtener el precio
}

export function useLiveFravegaPrice(phoneName: string) {
  return useQuery({
    queryKey: ['live-fravega', phoneName],
    queryFn: () => scrapeFravegaPrice(phoneName),
    enabled: !!phoneName,
    staleTime: 1000 * 60 * 10,
    gcTime:    1000 * 60 * 20,
    retry: 0, // Sin retry — si falla, mostrar link de búsqueda
  });
}
