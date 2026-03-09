/**
 * useDeviceSearch — busca specs técnicos de un smartphone en GSMArena
 * usando api.allorigins.win como proxy CORS.
 */
import { useState } from 'react';

export interface DeviceSearchResult {
  image: string;
  display: string;
  processor: string;
  ram: string;
  storage: string;
  mainCamera: string;
  frontCamera: string;
  battery: string;
  charging: string;
  connectivity: string;
  os: string;
  dimensions: string;
  weight: string;
  has5G: boolean;
  hasNFC: boolean;
}

const GSMARENA = 'https://www.gsmarena.com';
const PROXY = 'https://api.allorigins.win/raw?url=';

async function proxiedFetch(url: string): Promise<string> {
  const res = await fetch(`${PROXY}${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error(`Error ${res.status} al obtener datos`);
  return res.text();
}

// ─── Parser de la página de specs de GSMArena ────────────────────────────────
function parseDevicePage(html: string): Partial<DeviceSearchResult> {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const result: Partial<DeviceSearchResult> = { has5G: false, hasNFC: false };

  // Imagen principal
  const imgSrc = doc.querySelector('.specs-photo-main img')?.getAttribute('src') ?? '';
  if (imgSrc) result.image = imgSrc.startsWith('http') ? imgSrc : `${GSMARENA}/${imgSrc}`;

  const table = doc.querySelector('#specs-list');
  if (!table) return result;

  let section = '';

  // Acumuladores para campos compuestos
  const displayParts: { size?: string; type?: string; resolution?: string; hz?: string } = {};
  let wlan = '';
  let bt = '';

  for (const row of Array.from(table.querySelectorAll('tr'))) {
    const th = row.querySelector('th');
    if (th) {
      // Cuando termina la sección Display, construimos el string final
      if (section === 'Display') {
        const parts = [
          displayParts.size ? `${displayParts.size}"` : '',
          displayParts.type ?? '',
          displayParts.resolution ?? '',
          displayParts.hz ? `${displayParts.hz}Hz` : '',
        ].filter(Boolean);
        result.display = parts.join(', ');
      }
      section = th.textContent?.trim() ?? '';
      continue;
    }

    const ttl = (row.querySelector('.ttl')?.textContent ?? '').replace(/\s+/g, ' ').trim();
    const nfo = (row.querySelector('.nfo')?.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (!ttl || !nfo || nfo === '-') continue;

    switch (section) {
      // ── Red ──────────────────────────────────────────────────────────────────
      case 'Network':
        if (ttl === 'Technology' && /5G/i.test(nfo)) result.has5G = true;
        break;

      // ── Pantalla ─────────────────────────────────────────────────────────────
      case 'Display':
        if (ttl === 'Size') {
          displayParts.size = nfo.match(/^([\d.]+)/)?.[1] ?? '';
        }
        if (ttl === 'Type') {
          displayParts.type = nfo.split(',')[0].trim(); // "AMOLED, HDR10+" → "AMOLED"
          const hzMatch = nfo.match(/(\d+)Hz/i);
          if (hzMatch) displayParts.hz = hzMatch[1];
        }
        if (ttl === 'Resolution') {
          const res = nfo.match(/(\d{3,4})\s*x\s*(\d{3,4})/);
          if (res) {
            // Ordenar mayor primero: "1080 x 2340" → "2340x1080"
            const [a, b] = [parseInt(res[1]), parseInt(res[2])];
            displayParts.resolution = `${Math.max(a, b)}x${Math.min(a, b)}`;
          }
        }
        break;

      // ── Plataforma ───────────────────────────────────────────────────────────
      case 'Platform':
        if (ttl === 'OS') result.os = nfo;
        if (ttl === 'Chipset') {
          // Eliminar "(X nm)" al final, ej: "Snapdragon 8 Elite (3 nm)" → "Snapdragon 8 Elite"
          result.processor = nfo.replace(/\s*\([^)]+\)\s*/g, '').replace(/\s+/g, ' ').trim();
        }
        break;

      // ── Memoria ──────────────────────────────────────────────────────────────
      case 'Memory':
        if (ttl === 'Internal') {
          // Ej: "128GB 8GB RAM, 256GB 12GB RAM" o "8 GB RAM, 128 GB"
          const ramMatch = nfo.match(/(\d+)\s*GB\s*RAM/i);
          if (ramMatch) result.ram = `${ramMatch[1]}GB`;

          // Storage: números antes de "GB" que NO van seguidos de "RAM"
          const storageMatches = [...nfo.matchAll(/(\d+)\s*GB(?!\s*RAM)/gi)].map(m => m[1]);
          if (storageMatches.length) {
            result.storage = storageMatches.length === 1
              ? `${storageMatches[0]}GB`
              : [...new Set(storageMatches)].map(s => `${s}GB`).join(' / ');
          }
        }
        break;

      // ── Cámara principal ─────────────────────────────────────────────────────
      case 'Main Camera':
        if (['Single', 'Dual', 'Triple', 'Quad', 'Penta'].includes(ttl)) {
          result.mainCamera = nfo;
        }
        break;

      // ── Cámara frontal ───────────────────────────────────────────────────────
      case 'Selfie camera':
        if (['Single', 'Dual'].includes(ttl)) {
          result.frontCamera = nfo;
        }
        break;

      // ── Batería ──────────────────────────────────────────────────────────────
      case 'Battery':
        if (ttl === 'Type') {
          const mah = nfo.match(/(\d[\d,]+)\s*mAh/i);
          result.battery = mah ? `${mah[1]}mAh` : nfo.split(',')[0].trim();
        }
        if (ttl === 'Charging') result.charging = nfo;
        break;

      // ── Conectividad ─────────────────────────────────────────────────────────
      case 'Comms':
        if (ttl === 'WLAN') {
          if (/Wi-Fi\s*7|\b7\b/.test(nfo)) wlan = 'Wi-Fi 7';
          else if (/6[Ee]/.test(nfo)) wlan = 'Wi-Fi 6E';
          else if (/\b6\b/.test(nfo)) wlan = 'Wi-Fi 6';
          else if (/\bac\b/i.test(nfo)) wlan = 'Wi-Fi 5';
          else wlan = 'Wi-Fi';
        }
        if (ttl === 'Bluetooth') {
          const ver = nfo.match(/(\d+\.\d+)/);
          bt = ver ? `Bluetooth ${ver[1]}` : 'Bluetooth';
        }
        if (ttl === 'NFC' && !/^no$/i.test(nfo)) result.hasNFC = true;
        break;

      // ── Cuerpo ───────────────────────────────────────────────────────────────
      case 'Body':
        if (ttl === 'Dimensions') result.dimensions = nfo.split('(')[0].trim();
        if (ttl === 'Weight') {
          const g = nfo.match(/(\d+)\s*g\b/i);
          result.weight = g ? `${g[1]}g` : nfo.split('(')[0].trim();
        }
        break;
    }
  }

  // Flush display si no hubo siguiente sección (último bloque)
  if (!result.display && (displayParts.size || displayParts.type)) {
    const parts = [
      displayParts.size ? `${displayParts.size}"` : '',
      displayParts.type ?? '',
      displayParts.resolution ?? '',
      displayParts.hz ? `${displayParts.hz}Hz` : '',
    ].filter(Boolean);
    result.display = parts.join(', ');
  }

  // Construir string de conectividad en orden: 5G, Wi-Fi, BT, NFC
  const connParts = [
    result.has5G ? '5G' : '',
    wlan,
    bt,
    result.hasNFC ? 'NFC' : '',
  ].filter(Boolean);
  result.connectivity = connParts.join(', ');

  return result;
}

// ─── Buscador en GSMArena ────────────────────────────────────────────────────
async function findDeviceUrl(query: string): Promise<string | null> {
  const searchUrl = `${GSMARENA}/search.php3?sQuickSearch=${encodeURIComponent(query)}`;
  const html = await proxiedFetch(searchUrl);
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Probamos varios selectores por robustez
  const selectors = ['.makers li a', '.section-body li a', 'ul li a[href$=".php"]'];
  let link: HTMLAnchorElement | null = null;
  for (const sel of selectors) {
    link = doc.querySelector(sel) as HTMLAnchorElement | null;
    if (link) break;
  }

  if (!link) return null;

  const href = link.getAttribute('href') ?? '';
  return href.startsWith('http') ? href : `${GSMARENA}/${href}`;
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useDeviceSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (
    name: string,
    brand: string,
    year: number
  ): Promise<DeviceSearchResult | null> => {
    if (!name.trim() || !brand.trim()) {
      setError('Completá el nombre y la marca primero');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const query = `${brand} ${name} ${year}`;
      const deviceUrl = await findDeviceUrl(query);

      if (!deviceUrl) {
        throw new Error(`No se encontró "${query}" en GSMArena. Verificá nombre y marca.`);
      }

      const html = await proxiedFetch(deviceUrl);
      const specs = parseDevicePage(html);

      // Validamos que obtuvimos datos útiles
      if (!specs.processor && !specs.display && !specs.battery) {
        throw new Error('Se encontró el dispositivo pero no se pudieron leer las especificaciones.');
      }

      return specs as DeviceSearchResult;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al buscar especificaciones';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { search, isLoading, error };
}
