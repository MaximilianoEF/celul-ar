/**
 * Supabase Edge Function: ml-search
 *
 * Busca precios de celulares en Argentina usando múltiples fuentes en cascada:
 *
 *   1. Fravega (VTEX Intelligent Search API) — sin auth, gratuita
 *   2. Catálogo ML (/products/search → /products/{id}) — OAuth, fallback
 *
 * Deploy: npx supabase functions deploy ml-search --project-ref xffqrkkacaxpriegeghm
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ML_CLIENT_ID     = Deno.env.get('ML_CLIENT_ID')     ?? '';
const ML_CLIENT_SECRET = Deno.env.get('ML_CLIENT_SECRET') ?? '';
const ML_TOKEN_URL     = 'https://api.mercadolibre.com/oauth/token';
const ML_PRODUCTS_URL  = 'https://api.mercadolibre.com/products';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')              ?? '';
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

interface PriceListing {
  id: string;
  title: string;
  price: number;
  permalink: string;
  thumbnail: string;
  store: 'fravega' | 'mercadolibre';
}

// ─── CORS ─────────────────────────────────────────────────────────────────────
const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Supabase client ──────────────────────────────────────────────────────────
function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE, {
    auth: { persistSession: false },
  });
}

// ─── ML: caché del access_token ───────────────────────────────────────────────
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getMlToken(): Promise<string | null> {
  if (!ML_CLIENT_ID || !ML_CLIENT_SECRET) return null;
  if (cachedToken && Date.now() < cachedToken.expiresAt - 300_000) return cachedToken.value;

  const supabase = getSupabase();
  const { data } = await supabase
    .from('ml_tokens').select('refresh_token').eq('id', 'singleton').single();

  if (!data?.refresh_token) return null;

  const res = await fetch(ML_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token', client_id: ML_CLIENT_ID,
      client_secret: ML_CLIENT_SECRET, refresh_token: data.refresh_token,
    }),
  });
  if (!res.ok) return null;

  const json: { access_token: string; expires_in: number; refresh_token?: string } = await res.json();
  cachedToken = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1_000 };

  if (json.refresh_token) {
    supabase.from('ml_tokens')
      .update({ refresh_token: json.refresh_token, updated_at: new Date().toISOString() })
      .eq('id', 'singleton')
      .then(({ error }) => { if (error) console.error('[ml-search] refresh_token save error:', error.message); });
  }

  return cachedToken.value;
}

// ─── Fuente 1: Fravega (VTEX Intelligent Search) ──────────────────────────────
// API pública de VTEX, sin autenticación requerida, funciona desde cualquier IP.
async function tryFravega(query: string): Promise<PriceListing[] | null> {
  try {
    // VTEX Intelligent Search API — disponible en todas las tiendas VTEX
    const params = new URLSearchParams({
      query,
      page:         '1',
      count:        '8',
      salesChannel: '1',
    });
    const url = `https://www.fravega.com/_v/api/intelligent-search/product_search?${params}`;
    const res = await fetch(url, {
      headers: {
        'Accept':          'application/json',
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'es-AR,es;q=0.9',
        'Referer':         'https://www.fravega.com/',
      },
      signal: AbortSignal.timeout(12_000),
    });

    console.log(`[ml-search] fravega VTEX status=${res.status}`);
    if (!res.ok) {
      // Fallback: API REST legacy de VTEX
      return await tryFravegaLegacy(query);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products: any[] = data?.products ?? data?.data?.productSearch?.products ?? [];
    console.log(`[ml-search] fravega VTEX products=${products.length}`);

    const listings = parseVtexProducts(products);
    if (listings.length > 0) return listings;

    // Si no hubo resultados con VTEX, probar legacy
    return await tryFravegaLegacy(query);
  } catch (e) {
    console.log(`[ml-search] fravega exception: ${(e as Error).message}`);
    return tryFravegaLegacy(query);
  }
}

// Fallback: VTEX Catalog REST API (más vieja pero más estable)
async function tryFravegaLegacy(query: string): Promise<PriceListing[] | null> {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://www.fravega.com/api/catalog_system/pub/products/search/${encoded}?_from=0&_to=7&fq=C%3A%2F3%2F` // cat 3 = celulares
    const res = await fetch(url, {
      headers: {
        'Accept':     'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer':    'https://www.fravega.com/',
      },
      signal: AbortSignal.timeout(12_000),
    });

    console.log(`[ml-search] fravega legacy status=${res.status}`);
    if (!res.ok) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products: any[] = await res.json();
    console.log(`[ml-search] fravega legacy products=${products.length}`);

    return parseVtexProducts(products);
  } catch (e) {
    console.log(`[ml-search] fravega legacy exception: ${(e as Error).message}`);
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseVtexProducts(products: any[]): PriceListing[] {
  const listings: PriceListing[] = [];

  for (const product of products.slice(0, 6)) {
    try {
      // La API VTEX puede responder con dos estructuras distintas según el endpoint
      const name: string = product.productName ?? product.name ?? '';

      // Estructura VTEX Intelligent Search
      const priceIS: number =
        product.priceRange?.sellingPrice?.lowPrice ??
        product.offers?.lowPrice ??
        product.items?.[0]?.sellers?.[0]?.commertialOffer?.Price ?? 0;

      // Estructura VTEX Catalog REST
      const priceCat: number =
        product.items?.[0]?.sellers?.[0]?.commertialOffer?.Price ??
        product.items?.[0]?.sellers?.[0]?.commertialOffer?.ListPrice ?? 0;

      const price = priceIS || priceCat;
      if (price < 80_000) continue;

      const thumbnail: string =
        product.items?.[0]?.images?.[0]?.imageUrl ??
        product.images?.[0]?.imageUrl ??
        product.skuSpecifications?.[0]?.values?.[0]?.imageUrl ?? '';

      const slug: string = product.linkText ?? product.link ?? '';
      const permalink = slug
        ? `https://www.fravega.com/${slug}/p`
        : `https://www.fravega.com/busqueda/?keyword=${encodeURIComponent(name)}`;

      listings.push({
        id:        product.productId ?? product.id ?? String(listings.length),
        title:     name,
        price,
        permalink,
        thumbnail,
        store:     'fravega',
      });
    } catch { /* siguiente producto */ }
  }

  console.log(`[ml-search] fravega parsed=${listings.length}`);
  return listings;
}

// ─── Fuente 2: Catálogo ML (products/search + PDP scraping) ──────────────────
// Usa /products/search (funciona con OAuth) y scraping del permalink del producto.
async function tryMlCatalog(query: string): Promise<PriceListing[] | null> {
  const token = await getMlToken();
  if (!token) return null;

  // Paso A: buscar en catálogo ML
  let catalogItems: Array<{ id: string; name: string; permalink: string; thumbnail: string }> = [];
  try {
    const params = new URLSearchParams({ site_id: 'MLA', q: query, status: 'active', limit: '5' });
    const res = await fetch(`${ML_PRODUCTS_URL}/search?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    });
    console.log(`[ml-search] ml catalog/search status=${res.status}`);
    if (res.ok) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: { results?: any[] } = await res.json();
      catalogItems = (data.results ?? [])
        .filter((p: { domain_id?: string }) => !p.domain_id || p.domain_id === 'MLA-CELLPHONES')
        .slice(0, 4)
        .map((p: { id?: string; name?: string; permalink?: string; pictures?: Array<{ url: string }> }) => ({
          id:        p.id ?? '',
          name:      p.name ?? '',
          permalink: p.permalink ?? (p.id ? `https://www.mercadolibre.com.ar/p/${p.id}` : ''),
          thumbnail: p.pictures?.[0]?.url ?? '',
        }))
        .filter((p: { id: string }) => p.id);
      console.log(`[ml-search] ml catalog found=${catalogItems.length}`);
    }
  } catch (e) {
    console.log(`[ml-search] ml catalog exception: ${(e as Error).message}`);
  }

  if (catalogItems.length === 0) return null;

  // Paso B: GET /products/{id} para obtener buy_box_winner o permalink para scraping
  const listings: PriceListing[] = [];
  for (const item of catalogItems) {
    try {
      const res = await fetch(`${ML_PRODUCTS_URL}/${item.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(8_000),
      });
      if (!res.ok) continue;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const product: any = await res.json();
      const winnerPrice: number = product.buy_box_winner?.price ?? 0;
      const permalink: string   = product.permalink ?? item.permalink;
      const thumbnail: string   = (Array.isArray(product.pictures) ? product.pictures[0]?.url : '') ?? item.thumbnail;

      if (winnerPrice > 80_000) {
        listings.push({
          id:    product.buy_box_winner?.item_id ?? item.id,
          title: product.name ?? item.name,
          price: winnerPrice,
          permalink,
          thumbnail,
          store: 'mercadolibre',
        });
        console.log(`[ml-search] ml product ${item.id} buy_box_winner price=${winnerPrice}`);
      } else if (permalink) {
        // buy_box_winner null → scrapear la PDP del catálogo
        const pdpPrice = await scrapeMlPdpPrice(permalink);
        if (pdpPrice > 80_000) {
          listings.push({ id: item.id, title: product.name ?? item.name, price: pdpPrice, permalink, thumbnail, store: 'mercadolibre' });
          console.log(`[ml-search] ml product ${item.id} pdp price=${pdpPrice}`);
        }
      }
    } catch (e) {
      console.log(`[ml-search] ml product ${item.id} exception: ${(e as Error).message}`);
    }
    if (listings.length >= 4) break;
  }

  console.log(`[ml-search] ml catalog total=${listings.length}`);
  return listings.length > 0 ? listings : null;
}

// Scraping de la PDP de ML: busca JSON-LD schema.org/Product con precio
async function scrapeMlPdpPrice(permalink: string): Promise<number> {
  try {
    const res = await fetch(permalink, {
      headers: {
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept':          'text/html,application/xhtml+xml',
        'Accept-Language': 'es-AR,es;q=0.9',
      },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return 0;

    const html = await res.text();
    const jsonLdRe = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let m: RegExpExecArray | null;
    while ((m = jsonLdRe.exec(html)) !== null) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const schema: any = JSON.parse(m[1]);
        const items = Array.isArray(schema) ? schema : [schema];
        for (const item of items) {
          if (item['@type'] !== 'Product') continue;
          const price: number = item.offers?.price ?? item.offers?.lowPrice ?? 0;
          console.log(`[ml-search] ml pdp ${permalink} JSON-LD price=${price}`);
          if (price > 80_000) return price;
        }
      } catch { /* siguiente */ }
    }
  } catch (e) {
    console.log(`[ml-search] ml pdp exception: ${(e as Error).message}`);
  }
  return 0;
}

// ─── Handler principal ────────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();

  if (!q) {
    return new Response(
      JSON.stringify({ error: 'Parámetro q requerido' }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  try {
    console.log(`[ml-search] query="${q}"`);

    // Fuente 1: Fravega (VTEX API, sin auth)
    const fravegaResults = await tryFravega(q);
    if (fravegaResults && fravegaResults.length > 0) {
      console.log(`[ml-search] returning fravega results: ${fravegaResults.length}`);
      return new Response(
        JSON.stringify({ results: fravegaResults, source: 'fravega' }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=600' } },
      );
    }

    // Fuente 2: Catálogo ML (OAuth + catalog API)
    const mlResults = await tryMlCatalog(q);
    if (mlResults && mlResults.length > 0) {
      console.log(`[ml-search] returning ml results: ${mlResults.length}`);
      return new Response(
        JSON.stringify({ results: mlResults, source: 'mercadolibre' }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=600' } },
      );
    }

    return new Response(
      JSON.stringify({ results: [], error: 'No se encontraron resultados' }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[ml-search] error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }
});
