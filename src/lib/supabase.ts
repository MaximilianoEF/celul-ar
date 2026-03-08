import { createClient } from '@supabase/supabase-js';
import type { Smartphone } from '@/data/smartphones';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. ' +
    'Creá un archivo .env.local con las credenciales de tu proyecto Supabase.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Shapes exactos de la base de datos (snake_case)
export interface SmartphoneRow {
  id: string;
  name: string;
  brand: string;
  year: number;
  gama: 'alta' | 'media' | 'baja';
  image: string;
  custom_image: string | null;
  review: string | null;
  specs: {
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
    dimensions?: string;
    weight?: string;
    extras?: string;
  };
  pros: string[];
  cons: string[];
  for_who: string | null;
  has_5g: boolean;
  has_nfc: boolean;
  created_at: string;
  updated_at: string;
}

export interface StorePriceRow {
  id: string;
  smartphone_id: string;
  store: string;
  price: number | null;
  url: string | null;
  available: boolean;
  created_at: string;
}

// Convierte una fila de DB al formato Smartphone del frontend
export function rowToSmartphone(row: SmartphoneRow, prices: StorePriceRow[]): Smartphone {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    year: row.year,
    gama: row.gama,
    image: row.image,
    customImage: row.custom_image,
    review: row.review ?? '',
    specs: row.specs,
    pros: row.pros,
    cons: row.cons,
    forWho: row.for_who ?? '',
    prices: prices.map(p => ({
      store: p.store,
      price: p.price,
      url: p.url ?? '',
      available: p.available,
    })),
    has5G: row.has_5g,
    hasNFC: row.has_nfc,
  };
}

// Convierte un Smartphone del frontend al formato de fila DB (para inserts/updates)
export function smartphoneToRow(
  phone: Omit<Smartphone, 'prices'>
): Omit<SmartphoneRow, 'created_at' | 'updated_at'> {
  return {
    id: phone.id,
    name: phone.name,
    brand: phone.brand,
    year: phone.year,
    gama: phone.gama,
    image: phone.image,
    custom_image: phone.customImage ?? null,
    review: phone.review,
    specs: phone.specs,
    pros: phone.pros,
    cons: phone.cons,
    for_who: phone.forWho,
    has_5g: phone.has5G,
    has_nfc: phone.hasNFC,
  };
}
