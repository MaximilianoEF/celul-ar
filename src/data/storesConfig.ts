// Configuración central de tiendas - extensible sin tocar lógica
export interface StoreConfig {
  name: string;
  domain: string;
  searchBaseUrl: string | null; // null = no confiar en búsqueda interna
  icon?: string;
}

export const storesConfig: Record<string, StoreConfig> = {
  mercadolibre: {
    name: "Mercado Libre",
    domain: "mercadolibre.com.ar",
    searchBaseUrl: "https://listado.mercadolibre.com.ar/",
  },
  fravega: {
    name: "Frávega",
    domain: "fravega.com",
    searchBaseUrl: "https://www.fravega.com/l/?keyword=",
  },
  mgmstore: {
    name: "MGMStore",
    domain: "mgmstore.com.ar",
    searchBaseUrl: "https://www.mgmstore.com.ar/?s=",
  },
  personal: {
    name: "Personal",
    domain: "tienda.personal.com.ar",
    searchBaseUrl: null, // búsqueda interna no funciona bien
  },
  claro: {
    name: "Claro",
    domain: "tienda.claro.com.ar",
    searchBaseUrl: null,
  },
  movistar: {
    name: "Movistar",
    domain: "tienda.movistar.com.ar",
    searchBaseUrl: null,
  },
  macstation: {
    name: "MacStation",
    domain: "macstation.com.ar",
    searchBaseUrl: "https://www.macstation.com.ar/buscar?controller=search&s=",
  },
  ipoint: {
    name: "iPoint",
    domain: "ipoint.com.ar",
    searchBaseUrl: "https://www.ipoint.com.ar/catalogsearch/result/?q=",
  },
  musimundo: {
    name: "Musimundo",
    domain: "musimundo.com",
    searchBaseUrl: "https://www.musimundo.com/productos?q=",
  },
  google_shopping: {
    name: "Google Shopping",
    domain: "google.com.ar",
    searchBaseUrl: "https://www.google.com.ar/search?tbm=shop&q=",
  },
};

// Normaliza el nombre de tienda al key del config
export function getStoreKey(storeName: string): string {
  const normalized = storeName.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quitar acentos
    .replace(/\s+/g, "");
  
  // Mapeo directo de nombres comunes
  const aliases: Record<string, string> = {
    "mercadolibre": "mercadolibre",
    "fravega": "fravega",
    "mgmstore": "mgmstore",
    "personal": "personal",
    "claro": "claro",
    "movistar": "movistar",
    "macstation": "macstation",
    "ipoint": "ipoint",
    "musimundo": "musimundo",
    "googleshopping": "google_shopping",
  };

  return aliases[normalized] || normalized;
}

// Construye query de búsqueda optimizada
function buildSearchQuery(phoneName: string): string {
  let model = phoneName;
  // Para Apple, quitar "Apple" porque las tiendas lo listan como "iPhone"
  if (model.startsWith("Apple ")) model = model.replace("Apple ", "");
  return model;
}

// Función central: resuelve la URL para un producto en una tienda
// Cadena de prioridad:
// 1. URL directa del producto (si existe en el precio)
// 2. Búsqueda interna de la tienda (si searchBaseUrl es confiable)
// 3. Google site:dominio (fallback)
// 4. Google genérico (último recurso)
export function getPurchaseUrl(
  phoneName: string,
  storeName: string,
  priceUrl?: string
): string {
  const storeKey = getStoreKey(storeName);
  const cfg = storesConfig[storeKey];
  const query = buildSearchQuery(phoneName);
  const encodedQuery = encodeURIComponent(query);

  // 1. URL directa real (NO slugs inventados - solo si empieza con http y parece real)
  // Descartamos URLs que son claramente slugs inventados del dataset
  if (priceUrl && priceUrl.startsWith("http") && isLikelyRealUrl(priceUrl)) {
    return priceUrl;
  }

  // 2. Búsqueda interna de la tienda
  if (cfg?.searchBaseUrl) {
    if (storeKey === "mercadolibre") {
      // ML usa guiones en vez de encoded spaces
      const mlQuery = query.replace(/\s+/g, "-");
      return `${cfg.searchBaseUrl}${mlQuery}`;
    }
    return `${cfg.searchBaseUrl}${encodedQuery}`;
  }

  // 3. Google site:dominio
  if (cfg?.domain) {
    return `https://www.google.com.ar/search?q=site:${cfg.domain}+${encodedQuery}`;
  }

  // 4. Último recurso: Google general
  return `https://www.google.com.ar/search?q=${encodedQuery}+precio+argentina`;
}

// Allowlist de dominios válidos extraída del storesConfig
// Solo se aceptan URLs cuyo hostname pertenezca a una tienda configurada
const ALLOWED_DOMAINS = new Set(
  Object.values(storesConfig).map(c => c.domain)
);

// Valida que la URL pertenece a un dominio de tienda conocida (allowlist)
function isLikelyRealUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return [...ALLOWED_DOMAINS].some(
      domain => hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

// Google Shopping como fallback universal
export function getGoogleShoppingUrl(phoneName: string): string {
  const query = buildSearchQuery(phoneName);
  return `https://www.google.com.ar/search?tbm=shop&q=${encodeURIComponent(query)}+precio+argentina`;
}
