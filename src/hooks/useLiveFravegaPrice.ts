/**
 * useLiveFravegaPrice — intenta obtener el precio actual de Frávega vía scraping
 * con proxy CORS. Si falla, el componente debe mostrar un link de búsqueda en su lugar.
 * Estrategia: extrae __NEXT_DATA__ de la página de resultados de búsqueda de Frávega.
 */
import { useQuery } from '@tanstack/react-query';

export interface FravegaResult {
  title: string;
  price: number;
  url: string;
  thumbnail?: string;
}

const PROXIES = [
  (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

async function scrapeFravegaPrice(phoneName: string): Promise<FravegaResult | null> {
  // Para Apple, quitar "Apple" porque en Frávega los iPhone van sin la marca
  const query = phoneName.replace(/^Apple\s+/i, '');
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
