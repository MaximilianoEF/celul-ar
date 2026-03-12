/**
 * Script para obtener el access_token (y refresh_token si está disponible) de Mercado Libre.
 * Maneja automáticamente el flujo PKCE requerido por ML.
 *
 * Uso:
 *   node scripts/get-ml-token.mjs
 */

import crypto from 'crypto';
import readline from 'readline';

const CLIENT_ID     = '7045015774878508';
const CLIENT_SECRET = 'OFIoId5ddnbSGkvIWYXhxg5fUPO9P8M1';
const REDIRECT_URI  = 'https://httpbin.org/get';

// ─── Generar PKCE code_verifier y code_challenge ─────────────────────────────
function base64url(buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g,  '');
}

const codeVerifier  = base64url(crypto.randomBytes(32));
const codeChallenge = base64url(crypto.createHash('sha256').update(codeVerifier).digest());

// ─── URL de autorización ──────────────────────────────────────────────────────
const authUrl = [
  'https://auth.mercadolibre.com.ar/authorization',
  `?response_type=code`,
  `&client_id=${CLIENT_ID}`,
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`,
  `&code_challenge=${codeChallenge}`,
  `&code_challenge_method=S256`,
].join('');

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║         Obtener token de Mercado Libre - CeluAR              ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

console.log('📋 PASO 1: Abrí esta URL en el navegador:\n');
console.log(authUrl);
console.log('\n──────────────────────────────────────────────────────────────');
console.log('📋 PASO 2: Iniciá sesión con tu cuenta de Mercado Libre y autorizá la app.');
console.log('           Te va a redirigir a una URL como:');
console.log('           https://httpbin.org/get?code=TG-XXXXXXXXX-XXXXXXXXX');
console.log('\n           Copiá el valor del "code" que aparece en el JSON de esa página.');
console.log('──────────────────────────────────────────────────────────────\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('📝 Pegá el code aquí y presioná Enter: ', async (rawCode) => {
  rl.close();

  // Aceptar el code directamente o la URL completa
  let code = rawCode.trim();
  if (code.includes('code=')) {
    code = new URL(code).searchParams.get('code') ?? code;
  }
  if (!code) {
    console.error('\n❌ No ingresaste ningún code. Volvé a correr el script.\n');
    process.exit(1);
  }

  console.log('\n⏳ Canjeando code por token...\n');

  let data;
  try {
    const res = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'authorization_code',
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri:  REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });
    data = await res.json();

    if (!res.ok) {
      console.error('❌ Error de ML:', JSON.stringify(data, null, 2));
      console.error('\nSi el error es "expired", el code ya expiró (duran 10 minutos).');
      console.error('Volvé a correr el script para obtener un code nuevo.\n');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Error de red:', err.message);
    process.exit(1);
  }

  console.log('✅ ¡Token obtenido exitosamente!\n');
  console.log('──────────────────────────────────────────────────────────────');

  if (data.refresh_token) {
    // ── Tenemos refresh_token → solución permanente ──────────────────────────
    console.log('🎉 ¡Tenés refresh_token! La solución es PERMANENTE (se renueva solo).\n');
    console.log('📋 PASO 3: Ejecutá este comando en la terminal:\n');
    console.log(`supabase secrets set ML_CLIENT_ID=${CLIENT_ID} ML_CLIENT_SECRET=${CLIENT_SECRET} ML_REFRESH_TOKEN=${data.refresh_token}`);
    console.log('\nLuego deployá el Edge Function:');
    console.log('supabase functions deploy ml-search\n');
  } else {
    // ── Solo access_token → solución temporal (6 horas) ─────────────────────
    console.log('⚠️  No hay refresh_token. El token dura 6 horas.\n');
    console.log('📋 PASO 3: Ejecutá este comando en la terminal:\n');
    console.log(`supabase secrets set ML_ACCESS_TOKEN="${data.access_token}"`);
    console.log('\nLuego deployá el Edge Function:');
    console.log('supabase functions deploy ml-search\n');
    console.log('──────────────────────────────────────────────────────────────');
    console.log('ℹ️  Para obtener un refresh_token permanente:');
    console.log('   1. Ir a https://developers.mercadolibre.com.ar → tu app');
    console.log('   2. Revisar la sección "Permisos" y habilitar acceso offline si está disponible');
    console.log('   3. Volver a correr este script\n');
  }

  console.log('──────────────────────────────────────────────────────────────');
  console.log(`access_token (expira en ${data.expires_in / 3600}h): ${data.access_token}`);
  if (data.refresh_token) {
    console.log(`refresh_token (6 meses):                          ${data.refresh_token}`);
  }
  console.log('──────────────────────────────────────────────────────────────\n');
});
