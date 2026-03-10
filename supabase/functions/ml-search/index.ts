/**
 * Supabase Edge Function: ml-search
 *
 * Proxy seguro para la API de Mercado Libre.
 * Las credenciales (ML_CLIENT_ID, ML_CLIENT_SECRET) viven en Supabase Secrets,
 * nunca se exponen al frontend.
 *
 * Flujo:
 *   1. Cliente llama a esta función con ?q=NOMBRE_TELEFONO
 *   2. Edge Function obtiene un access_token de ML via client_credentials
 *   3. Llama a la API de ML con el token
 *   4. Devuelve los resultados al cliente
 *
 * Deploy:
 *   supabase functions deploy ml-search
 *   supabase secrets set ML_CLIENT_ID=TU_CLIENT_ID ML_CLIENT_SECRET=TU_CLIENT_SECRET
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

const ML_CLIENT_ID     = Deno.env.get('ML_CLIENT_ID') ?? '';
const ML_CLIENT_SECRET = Deno.env.get('ML_CLIENT_SECRET') ?? '';
const ML_TOKEN_URL     = 'https://api.mercadolibre.com/oauth/token';
const ML_SEARCH_URL    = 'https://api.mercadolibre.com/sites/MLA/search';

// ─── Caché del token en memoria (persiste mientras el runtime esté vivo) ──────
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  // Reutilizar token si todavía es válido (con 2 min de margen)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 120_000) {
    return cachedToken.value;
  }

  if (!ML_CLIENT_ID || !ML_CLIENT_SECRET) {
    throw new Error(
      'Faltan ML_CLIENT_ID / ML_CLIENT_SECRET en Supabase Secrets. ' +
      'Ejecutá: supabase secrets set ML_CLIENT_ID=... ML_CLIENT_SECRET=...'
    );
  }

  const res = await fetch(ML_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     ML_CLIENT_ID,
      client_secret: ML_CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ML auth error ${res.status}: ${body}`);
  }

  const data: { access_token: string; expires_in: number } = await res.json();
  cachedToken = {
    value:     data.access_token,
    expiresAt: Date.now() + data.expires_in * 1_000,
  };

  return cachedToken.value;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();

  if (!q) {
    return new Response(
      JSON.stringify({ error: 'Parámetro q requerido' }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const token = await getAccessToken();

    const params = new URLSearchParams({
      q,
      condition: 'new',
      limit:     '6',
      sort:      'price_asc',
    });

    const mlRes = await fetch(`${ML_SEARCH_URL}?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!mlRes.ok) {
      const body = await mlRes.text();
      throw new Error(`ML API error ${mlRes.status}: ${body}`);
    }

    const data = await mlRes.json();

    return new Response(JSON.stringify(data), {
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
        // 10 min de caché en el cliente para no saturar la función
        'Cache-Control': 'public, max-age=600',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[ml-search]', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
