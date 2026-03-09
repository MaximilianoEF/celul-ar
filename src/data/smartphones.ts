export type Gama = 'alta' | 'media' | 'baja';

export interface StorePrice {
  store: string;
  price: number | null;
  url: string;
  available: boolean;
}

export interface Smartphone {
  id: string;
  name: string;
  brand: string;
  year: number;
  gama: Gama;
  image: string;
  customImage?: string | null; // Para imágenes subidas manualmente
  review: string;
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
  forWho: string;
  prices: StorePrice[];
  has5G: boolean;
  hasNFC: boolean;
  // Precio ML sincronizado automáticamente desde la API pública de Mercado Libre.
  // null = nunca sincronizado (el hook useMLPriceSync lo completa en la primera visita).
  mlLowestPrice?: number | null;
  mlPriceUpdatedAt?: string | null;
}

// Función para obtener la imagen del teléfono (prioriza customImage)
export function getPhoneImage(phone: Smartphone): string {
  if (phone.customImage) return phone.customImage;
  if (phone.image && phone.image !== '/placeholder.svg') return phone.image;
  // Placeholder con el nombre del teléfono
  return `https://placehold.co/300x500/1a1f2e/14b8a6?text=${encodeURIComponent(phone.brand + '\\n' + phone.name.replace(phone.brand, '').trim())}`;
}

// Re-export store functions from centralized config
export { getPurchaseUrl, getGoogleShoppingUrl } from './storesConfig';

import { getPurchaseUrl as _getPurchaseUrl } from './storesConfig';

// Legacy export kept for backward compatibility
export function generateStoreUrl(store: string, phoneName: string): string {
  return _getPurchaseUrl(phoneName, store);
}

export const smartphones: Smartphone[] = [
  // ==================== 2025 MODELS ====================
  
  // iPhone 17 Series (2025)
  {
    id: "apple-iphone-17-pro-max",
    name: "Apple iPhone 17 Pro Max",
    brand: "Apple",
    year: 2025,
    gama: "alta",
    image: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-17-pro-max.jpg",
    review: "El iPhone 17 Pro Max representa el salto más grande de Apple en años. Con el nuevo chip A19 Pro de 3nm, 12GB de RAM y una pantalla de 6.9\" con ProMotion. El sistema de cámaras mantiene 48MP pero con mejoras significativas en procesamiento. Apple Intelligence ahora es más potente y el diseño se renueva con un chasis de aluminio forjado.",
    specs: {
      display: "6.9\" Super Retina XDR OLED, 1320x2868, 1-120Hz ProMotion",
      processor: "Apple A19 Pro (3nm)",
      ram: "12GB",
      storage: "256GB / 512GB / 2TB",
      mainCamera: "48MP principal + 48MP ultra angular + 12MP tele 5x periscópico",
      frontCamera: "18MP TrueDepth",
      battery: "4823mAh",
      charging: "25W carga rápida, MagSafe 25W",
      connectivity: "5G, Wi-Fi 7, Bluetooth 5.4, NFC, UWB, Thread",
      os: "iOS 26 con Apple Intelligence (6+ años actualizaciones)",
      dimensions: "163.5 x 78.2 x 8.8 mm",
      weight: "233g",
      extras: "Camera Control, Action Button, USB-C USB 4, IP68, Ceramic Shield"
    },
    pros: [
      "Chip A19 Pro con rendimiento récord",
      "Apple Intelligence mejorado con Siri 2.0",
      "Pantalla más grande y brillante",
      "12GB RAM por primera vez en iPhone",
      "Grabación ProRes Log y Spatial Video"
    ],
    cons: [
      "Precio extremadamente alto",
      "Peso de 233g considerable",
      "Sin cargador en caja",
      "Diseño muy similar al 16 Pro Max"
    ],
    forWho: "Usuarios Apple que buscan lo último en tecnología móvil, especialmente para video profesional y productividad.",
    prices: [
      { store: "Mercado Libre", price: 3899999, url: "https://www.mercadolibre.com.ar/apple-iphone-17-pro-max-256-gb", available: true },
      { store: "iPoint", price: 4199000, url: "https://www.ipoint.com.ar/iphone-17-pro-max", available: true },
      { store: "MacStation", price: 4099000, url: "https://www.macstation.com.ar/iphone-17-pro-max", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "apple-iphone-17-pro",
    name: "Apple iPhone 17 Pro",
    brand: "Apple",
    year: 2025,
    gama: "alta",
    image: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-17-pro.jpg",
    review: "El iPhone 17 Pro comparte el potente A19 Pro con el Pro Max pero en un formato más compacto de 6.3\". Incluye triple cámara de 48MP con telefoto 3x y todas las funciones de Apple Intelligence. Ideal para quienes prefieren un flagship manejable sin sacrificar potencia.",
    specs: {
      display: "6.3\" Super Retina XDR OLED, 1206x2622, 1-120Hz ProMotion",
      processor: "Apple A19 Pro (3nm)",
      ram: "12GB",
      storage: "256GB / 512GB / 1TB",
      mainCamera: "48MP principal + 48MP ultra angular + 48MP tele 3x",
      frontCamera: "18MP TrueDepth",
      battery: "3998mAh",
      charging: "25W carga rápida, MagSafe 25W",
      connectivity: "5G, Wi-Fi 7, Bluetooth 5.4, NFC, UWB, Thread",
      os: "iOS 26 con Apple Intelligence (6+ años actualizaciones)",
      dimensions: "147.2 x 71.5 x 8.8 mm",
      weight: "206g",
      extras: "Camera Control, Action Button, USB-C USB 4, IP68"
    },
    pros: [
      "Mismo chip A19 Pro que el Pro Max",
      "Tamaño compacto y manejable",
      "Triple cámara de 48MP",
      "12GB RAM y Apple Intelligence",
      "Diseño premium de aluminio forjado"
    ],
    cons: [
      "Telefoto 3x en lugar de 5x",
      "Batería más pequeña que Pro Max",
      "Precio elevado",
      "Sin opción de 2TB"
    ],
    forWho: "Usuarios que buscan un iPhone Pro compacto con toda la potencia del A19 Pro sin el tamaño del Pro Max.",
    prices: [
      { store: "Mercado Libre", price: 2999999, url: "https://www.mercadolibre.com.ar/apple-iphone-17-pro-256-gb", available: true },
      { store: "iPoint", price: 3299000, url: "https://www.ipoint.com.ar/iphone-17-pro", available: true },
      { store: "MacStation", price: 3199000, url: "https://www.macstation.com.ar/iphone-17-pro", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "apple-iphone-17",
    name: "Apple iPhone 17",
    brand: "Apple",
    year: 2025,
    gama: "alta",
    image: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-17.jpg",
    review: "El iPhone 17 base recibe por fin un salto generacional importante. Ahora con chip A19 y 8GB de RAM, soporte completo para Apple Intelligence. La pantalla de 6.3\" y el sistema de doble cámara de 48MP lo convierten en una opción sólida para quienes no necesitan las funciones Pro.",
    specs: {
      display: "6.3\" Super Retina XDR OLED, 1206x2622, 1-120Hz ProMotion",
      processor: "Apple A19 (3nm)",
      ram: "8GB",
      storage: "256GB / 512GB",
      mainCamera: "48MP principal + 48MP ultra angular",
      frontCamera: "18MP TrueDepth",
      battery: "3692mAh",
      charging: "25W carga rápida, MagSafe 15W",
      connectivity: "5G, Wi-Fi 7, Bluetooth 5.4, NFC",
      os: "iOS 26 con Apple Intelligence (6+ años actualizaciones)",
      dimensions: "147.2 x 71.5 x 8 mm",
      weight: "177g",
      extras: "Action Button, USB-C USB 3, IP68, Dynamic Island"
    },
    pros: [
      "Chip A19 potente y eficiente",
      "Apple Intelligence completo",
      "Doble cámara de 48MP",
      "ProMotion 120Hz por primera vez en modelo base",
      "Diseño liviano y compacto"
    ],
    cons: [
      "Sin telefoto",
      "8GB RAM vs 12GB de los Pro",
      "Batería más pequeña",
      "MagSafe limitado a 15W"
    ],
    forWho: "Usuarios que quieren un iPhone moderno con Apple Intelligence sin pagar el precio Pro.",
    prices: [
      { store: "Mercado Libre", price: 2199999, url: "https://www.mercadolibre.com.ar/apple-iphone-17-256-gb", available: true },
      { store: "iPoint", price: 2399000, url: "https://www.ipoint.com.ar/iphone-17", available: true },
      { store: "MacStation", price: 2299000, url: "https://www.macstation.com.ar/iphone-17", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "apple-iphone-17-air",
    name: "Apple iPhone 17 Air",
    brand: "Apple",
    year: 2025,
    gama: "alta",
    image: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-air.jpg",
    review: "El iPhone Air es el smartphone más delgado de Apple jamás creado con apenas 5.6mm de grosor. Chip A19 Pro, 12GB de RAM y pantalla de 6.5\". Diseñado para quienes priorizan la elegancia y portabilidad extrema sobre la batería. Una cámara de 48MP simplificada pero con calidad Pro.",
    specs: {
      display: "6.5\" Super Retina XDR OLED, 1260x2736, 1-120Hz ProMotion",
      processor: "Apple A19 Pro (3nm)",
      ram: "12GB",
      storage: "256GB / 512GB / 1TB",
      mainCamera: "48MP principal con sensor-shift OIS",
      frontCamera: "18MP TrueDepth",
      battery: "3149mAh",
      charging: "20W carga rápida, MagSafe 15W",
      connectivity: "5G, Wi-Fi 7, Bluetooth 5.4, NFC, UWB",
      os: "iOS 26 con Apple Intelligence (6+ años actualizaciones)",
      dimensions: "164.5 x 76.5 x 5.6 mm",
      weight: "165g",
      extras: "El iPhone más delgado, USB-C, IP68, Ceramic Shield"
    },
    pros: [
      "Ultra delgado: solo 5.6mm",
      "Extremadamente liviano: 165g",
      "Chip A19 Pro con 12GB RAM",
      "Diseño premium único",
      "Apple Intelligence completo"
    ],
    cons: [
      "Batería pequeña de 3149mAh",
      "Solo una cámara trasera",
      "Carga más lenta que otros modelos",
      "Precio alto para sus specs"
    ],
    forWho: "Usuarios que priorizan diseño, elegancia y portabilidad sobre autonomía y versatilidad de cámara.",
    prices: [
      { store: "Mercado Libre", price: 2699999, url: "https://www.mercadolibre.com.ar/apple-iphone-17-air-256-gb", available: true },
      { store: "iPoint", price: 2899000, url: "https://www.ipoint.com.ar/iphone-17-air", available: true },
      { store: "MacStation", price: 2799000, url: "https://www.macstation.com.ar/iphone-17-air", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  
  {
    id: "samsung-galaxy-s25-ultra",
    name: "Samsung Galaxy S25 Ultra",
    brand: "Samsung",
    year: 2025,
    gama: "alta",
    image: "https://fdn.gsmarena.com/imgroot/reviews/25/samsung-galaxy-s25-ultra/lifestyle/-1024w2/gsmarena_001.jpg",
    review: "El S25 Ultra llega con el nuevo Snapdragon 8 Elite, el chip más potente para Android en 2025. Galaxy AI evoluciona con más funciones de IA generativa. La pantalla de 6.9\" QHD+ ahora tiene bordes más curvados y el diseño es más redondeado. Mantiene la cámara de 200MP pero mejora el procesamiento de imagen con IA.",
    specs: {
      display: "6.9\" Dynamic AMOLED 2X, QHD+, 1-120Hz LTPO",
      processor: "Snapdragon 8 Elite for Galaxy",
      ram: "12GB / 16GB",
      storage: "256GB / 512GB / 1TB",
      mainCamera: "200MP principal + 50MP ultra angular + 50MP tele 5x + 10MP tele 3x",
      frontCamera: "12MP",
      battery: "5000mAh",
      charging: "45W carga rápida, 25W inalámbrica, Qi2",
      connectivity: "5G, Wi-Fi 7, Bluetooth 5.4, NFC, UWB",
      os: "Android 15 con One UI 7 (7 años actualizaciones)",
      dimensions: "162.8 x 77.6 x 8.2 mm",
      weight: "218g",
      extras: "S Pen incluido, marco de titanio, IP68, Gorilla Armor 2"
    },
    pros: [
      "Snapdragon 8 Elite con rendimiento récord",
      "Galaxy AI mejorado con funciones generativas",
      "7 años de actualizaciones garantizadas",
      "Diseño más ergonómico y liviano",
      "S Pen integrado y productividad"
    ],
    cons: [
      "Precio muy elevado en Argentina",
      "Batería sin cambios respecto al S24",
      "Sin zoom periscópico mejorado"
    ],
    forWho: "Usuarios que buscan lo último en tecnología Android sin importar el presupuesto, especialmente productividad y fotografía.",
    prices: [
      { store: "Mercado Libre", price: 3299999, url: "https://www.mercadolibre.com.ar/samsung-galaxy-s25-ultra", available: true },
      { store: "Frávega", price: 3599999, url: "https://www.fravega.com/p/celular-samsung-galaxy-s25-ultra", available: true },
      { store: "Personal", price: 3399999, url: "https://tienda.personal.com.ar/celulares/samsung/samsung-galaxy-s25-ultra", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "samsung-galaxy-s25-plus",
    name: "Samsung Galaxy S25+",
    brand: "Samsung",
    year: 2025,
    gama: "alta",
    image: "https://fdn.gsmarena.com/imgroot/reviews/25/samsung-galaxy-s25-plus/lifestyle/-1024w2/gsmarena_001.jpg",
    review: "El S25+ ofrece casi todo lo del Ultra pero sin S Pen y con cámara algo más simple. El Snapdragon 8 Elite garantiza rendimiento tope. Pantalla de 6.7\" perfecta para quienes no necesitan el tamaño gigante del Ultra. Excelente balance entre potencia y manejabilidad.",
    specs: {
      display: "6.7\" Dynamic AMOLED 2X, QHD+, 1-120Hz LTPO",
      processor: "Snapdragon 8 Elite for Galaxy",
      ram: "12GB",
      storage: "256GB / 512GB",
      mainCamera: "50MP principal + 12MP ultra angular + 10MP tele 3x",
      frontCamera: "12MP",
      battery: "4900mAh",
      charging: "45W carga rápida, 25W inalámbrica",
      connectivity: "5G, Wi-Fi 7, Bluetooth 5.4, NFC, UWB",
      os: "Android 15 con One UI 7 (7 años actualizaciones)",
      dimensions: "158.4 x 75.7 x 7.3 mm",
      weight: "190g",
      extras: "Marco de aluminio, IP68, Gorilla Armor 2"
    },
    pros: [
      "Mismo chip que el Ultra a menor precio",
      "Tamaño más manejable",
      "7 años de actualizaciones",
      "Galaxy AI completo",
      "Diseño premium"
    ],
    cons: [
      "Sin S Pen",
      "Zoom limitado a 3x óptico",
      "Cámara inferior al Ultra"
    ],
    forWho: "Usuarios que quieren potencia flagship sin el tamaño gigante del Ultra ni necesidad de S Pen.",
    prices: [
      { store: "Mercado Libre", price: 2499999, url: "https://www.mercadolibre.com.ar/samsung-galaxy-s25-plus", available: true },
      { store: "Frávega", price: 2699999, url: "https://www.fravega.com/p/celular-samsung-galaxy-s25-plus", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "apple-iphone-16-pro-max",
    name: "Apple iPhone 16 Pro Max",
    brand: "Apple",
    year: 2025,
    gama: "alta",
    image: "https://fdn.gsmarena.com/imgroot/reviews/24/apple-iphone-16-pro-max/lifestyle/-1024w2/gsmarena_001.jpg",
    review: "El iPhone 16 Pro Max trae el nuevo chip A18 Pro fabricado en 3nm de segunda generación. El Camera Control es un nuevo botón táctil para controlar la cámara. Apple Intelligence finalmente llega con funciones de IA generativa. La pantalla ahora tiene bordes aún más delgados.",
    specs: {
      display: "6.9\" Super Retina XDR OLED, 2868x1320, 1-120Hz ProMotion",
      processor: "Apple A18 Pro (3nm)",
      ram: "8GB",
      storage: "256GB / 512GB / 1TB",
      mainCamera: "48MP Fusion + 48MP ultra angular + 12MP tele 5x",
      frontCamera: "12MP TrueDepth",
      battery: "4685mAh",
      charging: "MagSafe 25W, 45W con cable",
      connectivity: "5G, Wi-Fi 7, Bluetooth 5.3, NFC, UWB, Thread",
      os: "iOS 18 con Apple Intelligence (5+ años actualizaciones)",
      dimensions: "163 x 77.6 x 8.25 mm",
      weight: "227g",
      extras: "Camera Control, Action Button, USB-C USB 3, IP68"
    },
    pros: [
      "Camera Control innovador",
      "Apple Intelligence con IA generativa",
      "Ultra angular de 48MP mejorado",
      "Mayor autonomía de batería",
      "Grabación de audio espacial"
    ],
    cons: [
      "Precio extremadamente alto",
      "Apple Intelligence limitado por idioma",
      "Cambios visuales mínimos",
      "Sin cargador en caja"
    ],
    forWho: "Usuarios del ecosistema Apple que buscan el mejor iPhone con las nuevas funciones de IA y el Camera Control.",
    prices: [
      { store: "Mercado Libre", price: 3199999, url: "https://www.mercadolibre.com.ar/apple-iphone-16-pro-max-256-gb", available: true },
      { store: "iPoint", price: 3499000, url: "https://www.ipoint.com.ar/iphone-16-pro-max", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "apple-iphone-16-pro",
    name: "Apple iPhone 16 Pro",
    brand: "Apple",
    year: 2025,
    gama: "alta",
    image: "https://fdn.gsmarena.com/imgroot/reviews/24/apple-iphone-16-pro/lifestyle/-1024w2/gsmarena_001.jpg",
    review: "El iPhone 16 Pro ahora tiene pantalla de 6.3\", más grande que su predecesor. Mismo chip A18 Pro y Camera Control que el Pro Max. El zoom es de 3x en lugar de 5x del hermano mayor. Ideal para quienes prefieren un flagship compacto.",
    specs: {
      display: "6.3\" Super Retina XDR OLED, 1-120Hz ProMotion",
      processor: "Apple A18 Pro (3nm)",
      ram: "8GB",
      storage: "128GB / 256GB / 512GB / 1TB",
      mainCamera: "48MP Fusion + 48MP ultra angular + 12MP tele 3x",
      frontCamera: "12MP TrueDepth",
      battery: "3582mAh",
      charging: "MagSafe 25W, 30W con cable",
      connectivity: "5G, Wi-Fi 7, Bluetooth 5.3, NFC, UWB",
      os: "iOS 18 con Apple Intelligence",
      dimensions: "149.6 x 71.5 x 8.25 mm",
      weight: "199g",
      extras: "Camera Control, Action Button, USB-C, IP68"
    },
    pros: [
      "Pantalla más grande que antes",
      "A18 Pro con máximo rendimiento",
      "Camera Control para fotografía",
      "Apple Intelligence completo",
      "Más compacto que el Pro Max"
    ],
    cons: [
      "Zoom solo 3x (vs 5x del Pro Max)",
      "Batería menor",
      "Precio muy elevado"
    ],
    forWho: "Usuarios Apple que quieren potencia Pro en un formato más compacto y manejable.",
    prices: [
      { store: "Mercado Libre", price: 2599999, url: "https://www.mercadolibre.com.ar/apple-iphone-16-pro-256-gb", available: true },
      { store: "iPoint", price: 2899000, url: "https://www.ipoint.com.ar/iphone-16-pro", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "xiaomi-15-ultra",
    name: "Xiaomi 15 Ultra",
    brand: "Xiaomi",
    year: 2025,
    gama: "alta",
    image: "https://fdn.gsmarena.com/imgroot/reviews/25/xiaomi-15-ultra/lifestyle/-1024w2/gsmarena_001.jpg",
    review: "El Xiaomi 15 Ultra es una bestia fotográfica con sensor de 1 pulgada y Leica. El Snapdragon 8 Elite ofrece máximo rendimiento. La carga de 90W con cable y 80W inalámbrica es impresionante. HyperOS 2 mejora la experiencia pero aún tiene publicidad.",
    specs: {
      display: "6.73\" AMOLED LTPO, 2K, 1-120Hz",
      processor: "Snapdragon 8 Elite",
      ram: "12GB / 16GB",
      storage: "256GB / 512GB / 1TB",
      mainCamera: "50MP 1\" sensor + 50MP ultra angular + 200MP periscope 4.3x",
      frontCamera: "32MP",
      battery: "5000mAh",
      charging: "90W con cable, 80W inalámbrica",
      connectivity: "5G, Wi-Fi 7, Bluetooth 5.4, NFC, UWB, IR",
      os: "Android 15 con HyperOS 2",
      dimensions: "161.4 x 75.3 x 9.2 mm",
      weight: "229g",
      extras: "Cámaras Leica, IP68, marco de aluminio"
    },
    pros: [
      "Sensor de 1 pulgada excepcional",
      "Carga ultrarrápida 90W/80W",
      "Periscope de 200MP único",
      "Snapdragon 8 Elite",
      "Colaboración Leica"
    ],
    cons: [
      "HyperOS con publicidad",
      "Pesado (229g)",
      "Precio flagship",
      "Disponibilidad limitada en Argentina"
    ],
    forWho: "Entusiastas de la fotografía móvil que buscan el mejor sistema de cámaras posible en Android.",
    prices: [
      { store: "Mercado Libre", price: 2799999, url: "https://www.mercadolibre.com.ar/xiaomi-15-ultra", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "samsung-galaxy-a56",
    name: "Samsung Galaxy A56 5G",
    brand: "Samsung",
    year: 2025,
    gama: "media",
    image: "https://fdn.gsmarena.com/imgroot/reviews/25/samsung-galaxy-a56/lifestyle/-1024w2/gsmarena_001.jpg",
    review: "El Galaxy A56 evoluciona con el nuevo Exynos 1580 y Galaxy AI. Mantiene la construcción premium con IP67 y ahora incluye funciones de IA que antes eran exclusivas de la línea S. La pantalla Super AMOLED de 120Hz sigue siendo un punto fuerte.",
    specs: {
      display: "6.7\" Super AMOLED, FHD+, 120Hz",
      processor: "Exynos 1580",
      ram: "8GB / 12GB",
      storage: "128GB / 256GB (expandible microSD)",
      mainCamera: "50MP principal OIS + 12MP ultra angular + 5MP macro",
      frontCamera: "12MP",
      battery: "5000mAh",
      charging: "45W carga rápida",
      connectivity: "5G, Wi-Fi 6E, Bluetooth 5.3, NFC",
      os: "Android 15 con One UI 7 (6 años actualizaciones)",
      dimensions: "164.1 x 77.3 x 7.9 mm",
      weight: "197g",
      extras: "IP67, Galaxy AI básico, parlantes estéreo"
    },
    pros: [
      "Galaxy AI en gama media",
      "6 años de actualizaciones",
      "Carga mejorada a 45W",
      "IP67 y construcción premium",
      "Pantalla AMOLED excelente"
    ],
    cons: [
      "Exynos menos eficiente que Snapdragon",
      "Sin zoom óptico",
      "Sensor macro de 5MP poco útil"
    ],
    forWho: "Usuarios que quieren experiencia Samsung premium con Galaxy AI sin pagar precio flagship.",
    prices: [
      { store: "Mercado Libre", price: 849999, url: "https://www.mercadolibre.com.ar/samsung-galaxy-a56-5g", available: true },
      { store: "Frávega", price: 929999, url: "https://www.fravega.com/p/celular-samsung-galaxy-a56", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "xiaomi-redmi-note-14-pro-plus",
    name: "Xiaomi Redmi Note 14 Pro+ 5G",
    brand: "Xiaomi",
    year: 2025,
    gama: "media",
    image: "https://fdn.gsmarena.com/imgroot/reviews/25/xiaomi-redmi-note-14-pro-plus/lifestyle/-1024w2/gsmarena_001.jpg",
    review: "El Redmi Note 14 Pro+ mejora en todo: Snapdragon 7s Gen 3, pantalla AMOLED 1.5K curva de 120Hz, cámara de 200MP con OIS y carga de 90W. Es una de las mejores opciones en gama media para 2025 con relación calidad-precio imbatible.",
    specs: {
      display: "6.67\" AMOLED curvo, 1.5K, 120Hz",
      processor: "Snapdragon 7s Gen 3",
      ram: "8GB / 12GB",
      storage: "256GB / 512GB",
      mainCamera: "200MP principal OIS + 8MP ultra angular + 2MP macro",
      frontCamera: "20MP",
      battery: "5110mAh",
      charging: "90W HyperCharge",
      connectivity: "5G, Wi-Fi 6, Bluetooth 5.4, NFC",
      os: "Android 14 con HyperOS",
      dimensions: "162.5 x 74.3 x 8.2 mm",
      weight: "195g",
      extras: "IP68, Gorilla Glass Victus 2, parlantes estéreo"
    },
    pros: [
      "Carga de 90W excepcional",
      "Cámara de 200MP con OIS",
      "IP68 en gama media",
      "Snapdragon 7s Gen 3 potente",
      "Pantalla 1.5K premium"
    ],
    cons: [
      "HyperOS con publicidad",
      "Sensor macro inútil",
      "Diseño algo genérico"
    ],
    forWho: "Usuarios que buscan lo máximo en gama media con mejor cámara y carga ultrarrápida.",
    prices: [
      { store: "Mercado Libre", price: 699999, url: "https://www.mercadolibre.com.ar/xiaomi-redmi-note-14-pro-plus-5g", available: true },
      { store: "Frávega", price: 749999, url: "https://www.fravega.com/p/celular-xiaomi-redmi-note-14-pro-plus-5g", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "motorola-edge-60-pro",
    name: "Motorola Edge 60 Pro",
    brand: "Motorola",
    year: 2025,
    gama: "alta",
    image: "https://fdn.gsmarena.com/imgroot/reviews/25/motorola-edge-60-pro/lifestyle/-1024w2/gsmarena_001.jpg",
    customImage: null,
    review: "El Edge 60 Pro es el flagship de Motorola para 2025 con el Dimensity 8350 Extreme, un chip potente y eficiente. La pantalla pOLED de 120Hz con 4500 nits de brillo es espectacular. Carga de 90W con cable y 15W inalámbrica. Android casi stock con Moto Experiences y certificación IP68/IP69.",
    specs: {
      display: "6.7\" pOLED, 1220x2712, 120Hz, 720Hz PWM, HDR10+, 4500 nits",
      processor: "MediaTek Dimensity 8350 Extreme (4nm)",
      ram: "8GB / 12GB / 16GB",
      storage: "256GB / 512GB (UFS 4.0)",
      mainCamera: "50MP principal OIS f/1.8 + 50MP ultra angular 120° + 10MP tele 3x OIS",
      frontCamera: "50MP f/2.0",
      battery: "6000mAh (Silicon-Carbon)",
      charging: "90W carga rápida, 15W inalámbrica",
      connectivity: "5G, Wi-Fi 6E tri-band, Bluetooth 5.x, NFC, GPS",
      os: "Android 15 (3 actualizaciones Android, 5 años seguridad)",
      dimensions: "160.7 x 73.1 x 8.2 mm",
      weight: "186g",
      extras: "IP68/IP69, MIL-STD-810H, Gorilla Glass 7i, parlantes estéreo Dolby Atmos, Hi-Res Audio 24-bit"
    },
    pros: [
      "Pantalla 4500 nits ultra brillante",
      "Batería enorme de 6000mAh",
      "Android limpio con Moto Experiences",
      "Carga 90W rápida",
      "IP68/IP69 y MIL-STD-810H"
    ],
    cons: [
      "Dimensity en lugar de Snapdragon 8 Elite",
      "Solo 15W carga inalámbrica",
      "3 años actualizaciones (vs 7 de Samsung)"
    ],
    forWho: "Usuarios que valoran software limpio, batería grande y resistencia extrema en un gama alta.",
    prices: [
      { store: "Mercado Libre", price: 899999, url: "https://www.mercadolibre.com.ar/motorola-edge-60-pro", available: true },
      { store: "Frávega", price: 999999, url: "https://www.fravega.com/p/celular-motorola-edge-60-pro", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "motorola-signature",
    name: "Motorola Signature",
    brand: "Motorola",
    year: 2026,
    gama: "alta",
    image: "https://fdn2.gsmarena.com/vv/bigpic/motorola-signature.jpg",
    customImage: null,
    review: "El Motorola Signature es el flagship definitivo de Motorola. Con Snapdragon 8 Gen 5, pantalla LTPO AMOLED de 6.8\" con 165Hz y 6200 nits de brillo, y triple cámara de 50MP con telefoto periscópico 3x. Batería de 5200mAh con carga de 90W y 50W inalámbrica. Sonido Bose, IP68/IP69, 7 años de actualizaciones Android y grabación 8K.",
    specs: {
      display: "6.8\" LTPO AMOLED, 1264x2780, 165Hz, Dolby Vision, HDR10+, 6200 nits",
      processor: "Snapdragon 8 Gen 5 (3nm)",
      ram: "12GB / 16GB",
      storage: "256GB / 512GB / 1TB",
      mainCamera: "50MP principal OIS + 50MP tele periscópico 3x + 50MP ultra angular 122°",
      frontCamera: "50MP",
      battery: "5200mAh",
      charging: "90W carga rápida, 50W inalámbrica, 10W reversa inalámbrica",
      connectivity: "5G, Wi-Fi 7, Bluetooth 6.0, NFC, UWB",
      os: "Android 16 (7 años actualizaciones Android)",
      dimensions: "162.1 x 76.4 x 7 mm",
      weight: "186g",
      extras: "IP68/IP69, MIL-STD-810H, sonido Bose, Gorilla Glass Victus 2, grabación 8K Dolby Vision"
    },
    pros: [
      "Snapdragon 8 Gen 5 tope de gama",
      "7 años de actualizaciones Android",
      "Pantalla 165Hz con 6200 nits de brillo",
      "Sonido Bose y Dolby Atmos",
      "Grabación 8K Dolby Vision"
    ],
    cons: [
      "Precio muy elevado (€990)",
      "Sin jack 3.5mm",
      "Disponibilidad limitada en Argentina",
      "Sin slot microSD"
    ],
    forWho: "Usuarios que buscan el flagship absoluto de Motorola con software limpio, resistencia extrema y cámaras de nivel profesional.",
    prices: [
      { store: "Mercado Libre", price: 1899999, url: "https://www.mercadolibre.com.ar/motorola-signature", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "motorola-edge-70",
    name: "Motorola Edge 70",
    brand: "Motorola",
    year: 2025,
    gama: "alta",
    image: "https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-70-5g.jpg",
    customImage: null,
    review: "El Edge 70 sorprende con un diseño ultra delgado de solo 6mm y apenas 159g. Snapdragon 7 Gen 4, pantalla pOLED de 6.7\" 120Hz con 4500 nits, cámara dual de 50MP con OIS y carga de 68W. IP68/IP69 y MIL-STD-810H lo hacen extremadamente resistente para su peso. Android 16 casi stock.",
    specs: {
      display: "6.7\" P-OLED, 1220x2712, 120Hz, HDR10+, 4500 nits",
      processor: "Snapdragon 7 Gen 4 (4nm)",
      ram: "8GB / 12GB",
      storage: "256GB / 512GB",
      mainCamera: "50MP principal OIS + 50MP ultra angular 120°",
      frontCamera: "50MP",
      battery: "4800mAh",
      charging: "68W carga rápida, 15W inalámbrica",
      connectivity: "5G, Wi-Fi 6E, Bluetooth 5.4, NFC",
      os: "Android 16 (3-4 años actualizaciones)",
      dimensions: "159.9 x 74 x 6 mm",
      weight: "159g",
      extras: "IP68/IP69, MIL-STD-810H, Gorilla Glass 7i, ultra delgado 6mm"
    },
    pros: [
      "Ultra delgado (6mm) y liviano (159g)",
      "IP68/IP69 + MIL-STD-810H resistente",
      "Snapdragon 7 Gen 4 potente",
      "Pantalla pOLED con 4500 nits de brillo",
      "Carga rápida de 68W"
    ],
    cons: [
      "Sin telefoto dedicado",
      "Batería de 4800mAh algo justa",
      "Sin slot microSD",
      "USB 2.0 solamente"
    ],
    forWho: "Usuarios que buscan un gama alta ultra liviano y delgado con resistencia extrema y software limpio de Motorola.",
    prices: [
      { store: "Mercado Libre", price: 699999, url: "https://www.mercadolibre.com.ar/motorola-edge-70", available: true },
      { store: "Frávega", price: 749999, url: "https://www.fravega.com/p/celular-motorola-edge-70", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "motorola-moto-g77",
    name: "Motorola Moto G77",
    brand: "Motorola",
    year: 2026,
    gama: "media",
    image: "https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g77.jpg",
    customImage: null,
    review: "El Moto G77 llega con Dimensity 6400, pantalla AMOLED de 6.78\" 120Hz con 5000 nits y cámara principal de 108MP con OIS. Batería de 5200mAh con carga de 30W. Diseño con eco-leather, IP64, MIL-STD-810H y slot microSD. Buena opción de gama media con cámara destacada.",
    specs: {
      display: "6.78\" AMOLED, 1272x2772, 120Hz, HDR, 5000 nits",
      processor: "Dimensity 6400 (6nm)",
      ram: "8GB",
      storage: "128GB / 256GB + microSD",
      mainCamera: "108MP principal OIS + 8MP ultra angular 119°",
      frontCamera: "32MP",
      battery: "5200mAh",
      charging: "30W carga rápida",
      connectivity: "5G, Wi-Fi 5, Bluetooth 5.4, NFC",
      os: "Android 16 (hasta 5 actualizaciones Android)",
      dimensions: "164.2 x 77.4 x 7.3 mm",
      weight: "182g",
      extras: "IP64, MIL-STD-810H, Gorilla Glass 7i, eco-leather, Dolby Atmos"
    },
    pros: [
      "Cámara de 108MP con OIS",
      "Pantalla AMOLED 120Hz con 5000 nits",
      "Hasta 5 actualizaciones Android",
      "Slot microSD expandible",
      "Diseño eco-leather resistente"
    ],
    cons: [
      "Procesador Dimensity 6400 modesto",
      "Carga de solo 30W",
      "Sin carga inalámbrica",
      "Wi-Fi 5 solamente"
    ],
    forWho: "Usuarios que buscan gama media con buena cámara, pantalla brillante y software limpio de Motorola.",
    prices: [
      { store: "Mercado Libre", price: 399999, url: "https://www.mercadolibre.com.ar/motorola-moto-g77", available: true },
      { store: "Frávega", price: 429999, url: "https://www.fravega.com/p/celular-motorola-moto-g77", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "motorola-moto-g67",
    name: "Motorola Moto G67",
    brand: "Motorola",
    year: 2026,
    gama: "media",
    image: "https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g67.jpg",
    customImage: null,
    review: "El Moto G67 es el hermano menor del G77, con Dimensity 6300, pantalla AMOLED de 6.78\" 120Hz y cámara de 50MP. Misma batería de 5200mAh con 30W de carga. IP64, MIL-STD-810H y slot microSD. Opción económica con 5G y pantalla AMOLED brillante de 5000 nits.",
    specs: {
      display: "6.78\" AMOLED, 1272x2772, 120Hz, HDR, 5000 nits",
      processor: "Dimensity 6300 (6nm)",
      ram: "4GB / 8GB",
      storage: "128GB / 256GB + microSD",
      mainCamera: "50MP principal + 8MP ultra angular 118°",
      frontCamera: "32MP",
      battery: "5200mAh",
      charging: "30W carga rápida",
      connectivity: "5G, Wi-Fi 5, Bluetooth 5.4, NFC (según mercado)",
      os: "Android 16",
      dimensions: "164.2 x 77.4 x 7.3 mm",
      weight: "182g",
      extras: "IP64, MIL-STD-810H, Gorilla Glass 7i, eco-leather, Dolby Atmos"
    },
    pros: [
      "Pantalla AMOLED 120Hz con 5000 nits",
      "Batería de 5200mAh generosa",
      "5G con Dimensity 6300",
      "Slot microSD expandible",
      "Diseño resistente IP64 + MIL-STD-810H"
    ],
    cons: [
      "Procesador Dimensity 6300 básico",
      "Versión de 4GB RAM limitada",
      "Carga de solo 30W",
      "NFC según mercado"
    ],
    forWho: "Usuarios que buscan un gama media económico con 5G, pantalla AMOLED y buena batería.",
    prices: [
      { store: "Mercado Libre", price: 299999, url: "https://www.mercadolibre.com.ar/motorola-moto-g67", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "motorola-moto-g17-power",
    name: "Motorola Moto G17 Power",
    brand: "Motorola",
    year: 2026,
    gama: "baja",
    image: "https://fdn.gsmarena.com/imgroot/news/26/01/motorola-moto-g17-moto-g17-power-official/inline/-x393/gsmarena_004.jpg",
    customImage: null,
    review: "El Moto G17 Power apuesta por la autonomía con su batería de 6000mAh y carga de 30W. Pantalla LCD de 6.72\" FullHD+ a 60Hz con Gorilla Glass 3. Cámara de 50MP Sony LYTIA 600 con ultra angular de 5MP. Helio G81 Extreme, 8GB RAM y 256GB expandibles. IP64, jack 3.5mm y speakers estéreo con Dolby Atmos.",
    specs: {
      display: "6.72\" IPS LCD, FullHD+, 60Hz, 1050 nits, Gorilla Glass 3",
      processor: "Helio G81 Extreme",
      ram: "8GB",
      storage: "256GB + microSD hasta 1TB",
      mainCamera: "50MP Sony LYTIA 600 + 5MP ultra angular",
      frontCamera: "32MP",
      battery: "6000mAh",
      charging: "30W carga rápida",
      connectivity: "4G LTE, Wi-Fi 5, Bluetooth 5.3, NFC",
      os: "Android 15",
      dimensions: "164 x 77 x 8.8 mm",
      weight: "195g (est.)",
      extras: "IP64, jack 3.5mm, speakers estéreo Dolby Atmos, vegan leather, slot microSD dedicado"
    },
    pros: [
      "Batería enorme de 6000mAh",
      "Cámara Sony LYTIA 600 de 50MP",
      "Jack 3.5mm y slot microSD dedicado",
      "Speakers estéreo con Dolby Atmos",
      "Diseño vegan leather resistente"
    ],
    cons: [
      "Pantalla LCD 60Hz sin AMOLED",
      "Procesador Helio G81 básico",
      "Sin 5G",
      "Android 15 sin garantía de actualizaciones"
    ],
    forWho: "Usuarios que priorizan autonomía extrema, almacenamiento expandible y jack 3.5mm por encima del rendimiento.",
    prices: [
      { store: "Mercado Libre", price: 249999, url: "https://www.mercadolibre.com.ar/motorola-moto-g17-power", available: true }
    ],
    has5G: false,
    hasNFC: true
  },
  {
    id: "motorola-moto-g17",
    name: "Motorola Moto G17",
    brand: "Motorola",
    year: 2026,
    gama: "baja",
    image: "https://fdn.gsmarena.com/imgroot/news/26/01/motorola-moto-g17-moto-g17-power-official/inline/-x393/gsmarena_002.jpg",
    customImage: null,
    review: "El Moto G17 es la versión estándar del G17 Power, con batería de 5200mAh y carga de 18W. Misma pantalla LCD de 6.72\" FullHD+ a 60Hz y cámara de 50MP Sony LYTIA 600. Helio G81 Extreme con opciones de 4GB/8GB RAM. IP64, jack 3.5mm, speakers estéreo y diseño vegan leather a precio accesible.",
    specs: {
      display: "6.72\" IPS LCD, FullHD+, 60Hz, 1050 nits, Gorilla Glass 3",
      processor: "Helio G81 Extreme",
      ram: "4GB / 8GB",
      storage: "128GB + microSD hasta 1TB",
      mainCamera: "50MP Sony LYTIA 600 + 5MP ultra angular",
      frontCamera: "32MP",
      battery: "5200mAh",
      charging: "18W carga rápida",
      connectivity: "4G LTE, Wi-Fi 5, Bluetooth 5.3, NFC",
      os: "Android 15",
      dimensions: "164 x 77 x 8.17 mm",
      weight: "185g (est.)",
      extras: "IP64, jack 3.5mm, speakers estéreo Dolby Atmos, vegan leather, slot microSD dedicado"
    },
    pros: [
      "Precio muy accesible",
      "Cámara Sony LYTIA 600 de 50MP",
      "Jack 3.5mm y slot microSD dedicado",
      "Speakers estéreo con Dolby Atmos",
      "Batería de 5200mAh generosa"
    ],
    cons: [
      "Pantalla LCD 60Hz sin AMOLED",
      "Carga lenta de solo 18W",
      "Sin 5G",
      "Versión de 4GB RAM muy limitada"
    ],
    forWho: "Usuarios con presupuesto ajustado que buscan un celular confiable con buena cámara, batería y jack 3.5mm.",
    prices: [
      { store: "Mercado Libre", price: 179999, url: "https://www.mercadolibre.com.ar/motorola-moto-g17", available: true }
    ],
    has5G: false,
    hasNFC: true
  },
  {
    id: "honor-magic-7-pro",
    name: "Honor Magic 7 Pro",
    brand: "Honor",
    year: 2025,
    gama: "alta",
    image: "https://fdn.gsmarena.com/imgroot/reviews/25/honor-magic7-pro/lifestyle/-1024w2/gsmarena_001.jpg",
    review: "Honor compite con los grandes con el Magic 7 Pro. Snapdragon 8 Elite, pantalla OLED de 120Hz con brillo de 5000 nits, y un sistema de cámaras con zoom periscópico de 200MP. La batería de 5850mAh es enorme.",
    specs: {
      display: "6.8\" OLED LTPO, 1.5K, 1-120Hz, 5000 nits",
      processor: "Snapdragon 8 Elite",
      ram: "12GB / 16GB",
      storage: "256GB / 512GB / 1TB",
      mainCamera: "50MP principal OIS + 50MP ultra angular + 200MP periscope 3x",
      frontCamera: "50MP",
      battery: "5850mAh",
      charging: "100W SuperCharge, 80W inalámbrica",
      connectivity: "5G, Wi-Fi 7, Bluetooth 5.4, NFC, IR",
      os: "Android 15 con MagicOS 8",
      dimensions: "162.7 x 77.1 x 8.8 mm",
      weight: "223g",
      extras: "IP68, Eye Tracking, sensor bajo pantalla 3D"
    },
    pros: [
      "Batería de 5850mAh enorme",
      "Brillo de 5000 nits récord",
      "Periscope 200MP único",
      "Carga 100W+80W impresionante",
      "Selfie de 50MP con 3D"
    ],
    cons: [
      "MagicOS menos popular",
      "Disponibilidad limitada en Argentina",
      "Pesado (223g)"
    ],
    forWho: "Usuarios que buscan un flagship alternativo con batería monstruosa y pantalla ultra brillante.",
    prices: [
      { store: "Mercado Libre", price: 1899999, url: "https://www.mercadolibre.com.ar/honor-magic-7-pro", available: true }
    ],
    has5G: true,
    hasNFC: true
  },

  // ==================== 2024 MODELS ====================
  {
    id: "samsung-galaxy-s24-ultra",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    year: 2024,
    gama: "alta",
    image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928.jpg",
    review: "El S24 Ultra es el buque insignia de Samsung con Galaxy AI integrada. Su pantalla de 6.8\" QHD+ es impresionante para multimedia, mientras que el S Pen sigue siendo útil para productividad. La cámara de 200MP captura detalles increíbles y el zoom óptico 5x es muy competente.",
    specs: {
      display: "6.8\" Dynamic AMOLED 2X, QHD+, 1-120Hz LTPO",
      processor: "Snapdragon 8 Gen 3 for Galaxy",
      ram: "12GB",
      storage: "256GB / 512GB / 1TB",
      mainCamera: "200MP principal + 12MP ultra angular + 50MP tele 5x + 10MP tele 3x",
      frontCamera: "12MP",
      battery: "5000mAh",
      charging: "45W carga rápida, 15W inalámbrica",
      connectivity: "5G, Wi-Fi 7, Bluetooth 5.3, NFC, UWB",
      os: "Android 14 con One UI 6.1 (7 años actualizaciones)",
      dimensions: "162.3 x 79 x 8.6 mm",
      weight: "232g",
      extras: "S Pen incluido, marco de titanio, IP68"
    },
    pros: [
      "Galaxy AI con traducción en tiempo real",
      "Pantalla excepcional para multimedia",
      "Versatilidad fotográfica con zoom 5x",
      "7 años de actualizaciones",
      "S Pen integrado"
    ],
    cons: [
      "Precio muy elevado",
      "Pesado (232g)",
      "Carga inalámbrica lenta"
    ],
    forWho: "Usuarios que buscan lo mejor en Android sin importar el presupuesto, valoran productividad con S Pen.",
    prices: [
      { store: "Mercado Libre", price: 2499999, url: "https://www.mercadolibre.com.ar/samsung-galaxy-s24-ultra", available: true },
      { store: "Frávega", price: 2799999, url: "https://www.fravega.com/p/celular-samsung-galaxy-s24-ultra", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "apple-iphone-15-pro-max",
    name: "Apple iPhone 15 Pro Max",
    brand: "Apple",
    year: 2024,
    gama: "alta",
    image: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg",
    review: "El iPhone 15 Pro Max representa la cúspide de Apple con el chip A17 Pro fabricado en 3nm. El Action Button reemplaza el switch de silencio. USB-C finalmente llega a iPhone con soporte USB 3. La cámara de 48MP con zoom 5x compite con los mejores Android.",
    specs: {
      display: "6.7\" Super Retina XDR OLED, 2796x1290, 1-120Hz ProMotion",
      processor: "Apple A17 Pro (3nm)",
      ram: "8GB",
      storage: "256GB / 512GB / 1TB",
      mainCamera: "48MP principal + 12MP ultra angular + 12MP tele 5x",
      frontCamera: "12MP TrueDepth",
      battery: "4422mAh",
      charging: "27W carga rápida, 15W MagSafe",
      connectivity: "5G, Wi-Fi 6E, Bluetooth 5.3, NFC, UWB",
      os: "iOS 17 (5+ años actualizaciones)",
      dimensions: "159.9 x 76.7 x 8.25 mm",
      weight: "221g",
      extras: "Action Button, USB-C, marco de titanio, IP68"
    },
    pros: [
      "Rendimiento líder con A17 Pro",
      "Excelente ecosistema Apple",
      "Video ProRes para profesionales",
      "Actualizaciones garantizadas",
      "USB-C con velocidad USB 3"
    ],
    cons: [
      "Precio muy alto",
      "Carga más lenta que Android",
      "Sin cargador en caja"
    ],
    forWho: "Usuarios del ecosistema Apple que buscan el mejor iPhone, especialmente creadores de contenido.",
    prices: [
      { store: "Mercado Libre", price: 2299999, url: "https://www.mercadolibre.com.ar/apple-iphone-15-pro-max-256-gb", available: true },
      { store: "iPoint", price: 2599000, url: "https://www.ipoint.com.ar/iphone-15-pro-max", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "samsung-galaxy-a55",
    name: "Samsung Galaxy A55 5G",
    brand: "Samsung",
    year: 2024,
    gama: "media",
    image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg",
    review: "El Galaxy A55 es el gama media más equilibrado de Samsung. Trae construcción premium con marco metálico y certificación IP67. La pantalla Super AMOLED de 120Hz es brillante y fluida. Samsung promete 4 años de actualizaciones de Android.",
    specs: {
      display: "6.6\" Super AMOLED, FHD+, 120Hz",
      processor: "Exynos 1480",
      ram: "8GB",
      storage: "128GB / 256GB (expandible microSD)",
      mainCamera: "50MP principal OIS + 12MP ultra angular + 5MP macro",
      frontCamera: "32MP",
      battery: "5000mAh",
      charging: "25W carga rápida",
      connectivity: "5G, Wi-Fi 6, Bluetooth 5.3, NFC",
      os: "Android 14 con One UI 6.1 (4 años actualizaciones)",
      dimensions: "161.1 x 77.4 x 8.2 mm",
      weight: "213g",
      extras: "IP67, marco de aluminio, parlantes estéreo"
    },
    pros: [
      "Excelente pantalla AMOLED 120Hz",
      "4 años de actualizaciones",
      "Construcción premium con IP67",
      "Buena autonomía de batería",
      "Almacenamiento expandible"
    ],
    cons: [
      "Carga de 25W algo lenta",
      "Sin zoom óptico",
      "Exynos menos eficiente"
    ],
    forWho: "Quien busca experiencia Samsung premium sin pagar precio flagship.",
    prices: [
      { store: "Mercado Libre", price: 649999, url: "https://www.mercadolibre.com.ar/samsung-galaxy-a55-5g", available: true },
      { store: "Frávega", price: 729999, url: "https://www.fravega.com/p/celular-samsung-galaxy-a55", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "xiaomi-redmi-note-13-pro-5g",
    name: "Xiaomi Redmi Note 13 Pro 5G",
    brand: "Xiaomi",
    year: 2024,
    gama: "media",
    image: "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-5g.jpg",
    review: "El Redmi Note 13 Pro 5G destaca por su cámara de 200MP, algo inusual en gama media. La pantalla AMOLED curva de 120Hz luce premium y el Dimensity 7200 Ultra ofrece buen rendimiento. La carga rápida de 67W es de las más veloces del segmento.",
    specs: {
      display: "6.67\" AMOLED curvo, 1.5K, 120Hz",
      processor: "MediaTek Dimensity 7200 Ultra",
      ram: "8GB / 12GB",
      storage: "256GB / 512GB",
      mainCamera: "200MP principal OIS + 8MP ultra angular + 2MP macro",
      frontCamera: "16MP",
      battery: "5100mAh",
      charging: "67W carga rápida",
      connectivity: "5G, Wi-Fi 6, Bluetooth 5.2, NFC",
      os: "Android 13 con MIUI 14",
      dimensions: "161.2 x 74.2 x 8 mm",
      weight: "187g",
      extras: "IP68, parlantes estéreo, IR blaster"
    },
    pros: [
      "Cámara de 200MP con detalle",
      "Carga rápida de 67W",
      "Pantalla AMOLED curva",
      "IP68",
      "Excelente relación precio"
    ],
    cons: [
      "MIUI con publicidad",
      "Sensor macro inútil",
      "Solo 3 años actualizaciones"
    ],
    forWho: "Entusiastas de fotografía con presupuesto ajustado que quieren máxima resolución.",
    prices: [
      { store: "Mercado Libre", price: 499999, url: "https://www.mercadolibre.com.ar/xiaomi-redmi-note-13-pro-5g", available: true },
      { store: "Frávega", price: 549999, url: "https://www.fravega.com/p/celular-xiaomi-redmi-note-13-pro-5g", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "motorola-moto-g84",
    name: "Motorola Moto G84 5G",
    brand: "Motorola",
    year: 2024,
    gama: "media",
    image: "https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g84.jpg",
    review: "El Moto G84 ofrece la experiencia Motorola más limpia de Android con Moto Experiences. Su pantalla pOLED de 120Hz impresiona para el precio. El Snapdragon 695 es modesto pero suficiente. Destaca el audio con parlantes estéreo Dolby Atmos.",
    specs: {
      display: "6.55\" pOLED, FHD+, 120Hz",
      processor: "Qualcomm Snapdragon 695",
      ram: "12GB",
      storage: "256GB (expandible microSD)",
      mainCamera: "50MP principal OIS + 8MP ultra angular",
      frontCamera: "16MP",
      battery: "5000mAh",
      charging: "33W TurboPower",
      connectivity: "5G, Wi-Fi 5, Bluetooth 5.1, NFC",
      os: "Android 13 (2 actualizaciones)",
      dimensions: "160 x 74.4 x 7.6 mm",
      weight: "174g",
      extras: "Cuero vegano, Dolby Atmos, IP54"
    },
    pros: [
      "Android casi stock fluido",
      "Pantalla pOLED excelente",
      "Diseño delgado y liviano",
      "Audio estéreo Dolby Atmos",
      "12GB RAM"
    ],
    cons: [
      "Snapdragon 695 algo justo",
      "Solo 2 actualizaciones Android",
      "IP54 básico"
    ],
    forWho: "Usuarios que prefieren software limpio sin bloatware y valoran el diseño.",
    prices: [
      { store: "Mercado Libre", price: 399999, url: "https://www.mercadolibre.com.ar/motorola-moto-g84-5g", available: true },
      { store: "Frávega", price: 449999, url: "https://www.fravega.com/p/celular-motorola-moto-g84", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "motorola-edge-50-pro",
    name: "Motorola Edge 50 Pro",
    brand: "Motorola",
    year: 2024,
    gama: "alta",
    image: "https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg",
    review: "El Edge 50 Pro combina diseño premium con rendimiento sólido del Snapdragon 7 Gen 3. La pantalla pOLED curva de 144Hz es de las más fluidas. Carga de 125W descomunal para el segmento. Android limpio con gestos intuitivos.",
    specs: {
      display: "6.7\" pOLED curvo, FHD+, 144Hz",
      processor: "Qualcomm Snapdragon 7 Gen 3",
      ram: "12GB",
      storage: "256GB / 512GB",
      mainCamera: "50MP principal OIS + 13MP ultra angular + 10MP tele 3x",
      frontCamera: "50MP",
      battery: "4500mAh",
      charging: "125W TurboPower, 50W inalámbrica",
      connectivity: "5G, Wi-Fi 6E, Bluetooth 5.4, NFC",
      os: "Android 14 (3 actualizaciones)",
      dimensions: "161.2 x 72.4 x 8.2 mm",
      weight: "186g",
      extras: "IP68, cuero vegano, Dolby Atmos"
    },
    pros: [
      "Carga de 125W ultrarrápida",
      "Pantalla 144Hz muy fluida",
      "Carga inalámbrica 50W",
      "Android limpio",
      "IP68"
    ],
    cons: [
      "Batería 4500mAh justa",
      "Sin zoom óptico real",
      "Precio cercano a flagships"
    ],
    forWho: "Usuarios que priorizan velocidad de carga y fluidez de pantalla con software limpio.",
    prices: [
      { store: "Mercado Libre", price: 799999, url: "https://www.mercadolibre.com.ar/motorola-edge-50-pro", available: true },
      { store: "Frávega", price: 879999, url: "https://www.fravega.com/p/celular-motorola-edge-50-pro", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "oppo-reno-12-pro",
    name: "OPPO Reno 12 Pro 5G",
    brand: "Oppo",
    year: 2024,
    gama: "media",
    image: "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno12-pro.jpg",
    review: "El Reno 12 Pro destaca por sus funciones de IA integradas y el Dimensity 7300-Energy eficiente. La pantalla AMOLED curva de 120Hz luce elegante. ColorOS 14 es pulido y tiene buenas opciones de personalización.",
    specs: {
      display: "6.7\" AMOLED curvo, FHD+, 120Hz",
      processor: "MediaTek Dimensity 7300-Energy",
      ram: "12GB",
      storage: "512GB",
      mainCamera: "50MP principal OIS + 8MP ultra angular + 50MP tele retrato",
      frontCamera: "50MP",
      battery: "5000mAh",
      charging: "80W SUPERVOOC",
      connectivity: "5G, Wi-Fi 6, Bluetooth 5.4, NFC",
      os: "Android 14 con ColorOS 14",
      dimensions: "161.4 x 74.8 x 7.4 mm",
      weight: "180g",
      extras: "IP65, AI Features, parlantes estéreo"
    },
    pros: [
      "Funciones de IA integradas",
      "Carga rápida de 80W",
      "Diseño delgado y elegante",
      "512GB de almacenamiento",
      "ColorOS pulido"
    ],
    cons: [
      "IP65 no es sumergible",
      "Marca con menor soporte en Argentina",
      "Historial de actualizaciones corto"
    ],
    forWho: "Usuarios que buscan gama media con IA integrada y diseño elegante.",
    prices: [
      { store: "Mercado Libre", price: 649999, url: "https://www.mercadolibre.com.ar/oppo-reno-12-pro-5g", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "infinix-note-40-pro",
    name: "Infinix Note 40 Pro 5G",
    brand: "Infinix",
    year: 2024,
    gama: "media",
    image: "https://fdn2.gsmarena.com/vv/bigpic/infinix-note-40-pro-5g.jpg",
    review: "Infinix sorprende con el Note 40 Pro que trae carga magnética inalámbrica de 20W, algo único en gama media. La carga con cable de 100W es impresionante. El Dimensity 7020 rinde bien para el día a día.",
    specs: {
      display: "6.78\" AMOLED curvo, FHD+, 120Hz",
      processor: "MediaTek Dimensity 7020",
      ram: "8GB (+8GB virtual)",
      storage: "256GB",
      mainCamera: "108MP principal + 2MP profundidad",
      frontCamera: "32MP",
      battery: "5000mAh",
      charging: "100W carga rápida, 20W MagCharge",
      connectivity: "5G, Wi-Fi 6, Bluetooth 5.2, NFC",
      os: "Android 14 con XOS 14",
      dimensions: "163.3 x 75.6 x 7.9 mm",
      weight: "190g",
      extras: "Carga magnética MagCharge, parlantes estéreo"
    },
    pros: [
      "Carga de 100W ultrarrápida",
      "Carga magnética inalámbrica única",
      "Pantalla AMOLED curva",
      "Precio competitivo"
    ],
    cons: [
      "Marca menos conocida",
      "Cámara secundaria inútil",
      "XOS con personalización excesiva"
    ],
    forWho: "Early adopters que quieren tecnología de carga innovadora a precio accesible.",
    prices: [
      { store: "Mercado Libre", price: 349999, url: "https://www.mercadolibre.com.ar/infinix-note-40-pro", available: true },
      { store: "Frávega", price: 389999, url: "https://www.fravega.com/p/celular-infinix-note-40-pro", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "honor-magic-6-lite",
    name: "Honor Magic 6 Lite",
    brand: "Honor",
    year: 2024,
    gama: "media",
    image: "https://fdn2.gsmarena.com/vv/bigpic/honor-magic6-lite.jpg",
    review: "Honor regresa con fuerza con el Magic 6 Lite. Destaca su pantalla AMOLED de 120Hz y batería de 5300mAh, la más grande del segmento. El Snapdragon 6 Gen 1 ofrece rendimiento consistente.",
    specs: {
      display: "6.78\" AMOLED, FHD+, 120Hz",
      processor: "Qualcomm Snapdragon 6 Gen 1",
      ram: "8GB",
      storage: "256GB",
      mainCamera: "108MP principal + 5MP ultra angular + 2MP macro",
      frontCamera: "16MP",
      battery: "5300mAh",
      charging: "35W HONOR SuperCharge",
      connectivity: "5G, Wi-Fi 5, Bluetooth 5.1, NFC",
      os: "Android 13 con MagicOS 7",
      dimensions: "162.6 x 75.1 x 7.98 mm",
      weight: "189g",
      extras: "Certificación MIL-STD-810H"
    },
    pros: [
      "Batería de 5300mAh excepcional",
      "Pantalla AMOLED grande",
      "Construcción robusta MIL-STD",
      "Cámara de 108MP"
    ],
    cons: [
      "Carga de 35W algo lenta",
      "Marca en reconstrucción",
      "Cámaras secundarias básicas"
    ],
    forWho: "Usuarios que priorizan autonomía de batería sobre todo lo demás.",
    prices: [
      { store: "Mercado Libre", price: 399999, url: "https://www.mercadolibre.com.ar/honor-magic-6-lite", available: true },
      { store: "Frávega", price: 449999, url: "https://www.fravega.com/p/celular-honor-magic-6-lite", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "samsung-galaxy-a15",
    name: "Samsung Galaxy A15",
    brand: "Samsung",
    year: 2024,
    gama: "baja",
    image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a15.jpg",
    review: "El Galaxy A15 democratiza la pantalla Super AMOLED de 90Hz en gama de entrada. Samsung incluye 4 años de actualizaciones de seguridad, algo inédito en este precio. El Helio G99 ofrece rendimiento suficiente para uso básico.",
    specs: {
      display: "6.5\" Super AMOLED, FHD+, 90Hz",
      processor: "MediaTek Helio G99",
      ram: "4GB / 6GB",
      storage: "128GB (expandible microSD)",
      mainCamera: "50MP principal + 5MP ultra angular + 2MP macro",
      frontCamera: "13MP",
      battery: "5000mAh",
      charging: "25W carga rápida",
      connectivity: "4G LTE, Wi-Fi 5, Bluetooth 5.3",
      os: "Android 14 con One UI 6.1 (4 años seguridad)",
      dimensions: "160.1 x 76.8 x 8.4 mm",
      weight: "200g",
      extras: "Sensor de huellas lateral, jack 3.5mm"
    },
    pros: [
      "Pantalla Super AMOLED excepcional",
      "4 años de seguridad",
      "Batería de 5000mAh",
      "Jack de auriculares"
    ],
    cons: [
      "Sin 5G ni NFC",
      "RAM 4GB justa",
      "Cámaras secundarias inútiles"
    ],
    forWho: "Primer smartphone para jóvenes o usuarios seniors que quieren buena pantalla.",
    prices: [
      { store: "Mercado Libre", price: 229999, url: "https://www.mercadolibre.com.ar/samsung-galaxy-a15", available: true },
      { store: "Frávega", price: 269999, url: "https://www.fravega.com/p/celular-samsung-galaxy-a15", available: true }
    ],
    has5G: false,
    hasNFC: false
  },
  {
    id: "xiaomi-redmi-13c",
    name: "Xiaomi Redmi 13C",
    brand: "Xiaomi",
    year: 2024,
    gama: "baja",
    image: "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-13c.jpg",
    review: "El Redmi 13C es la opción más económica de Xiaomi con pantalla grande de 6.74\". El Helio G85 es suficiente para tareas básicas. La batería de 5000mAh asegura todo el día sin problemas.",
    specs: {
      display: "6.74\" LCD IPS, HD+, 90Hz",
      processor: "MediaTek Helio G85",
      ram: "4GB / 6GB / 8GB",
      storage: "128GB / 256GB (expandible microSD)",
      mainCamera: "50MP principal",
      frontCamera: "8MP",
      battery: "5000mAh",
      charging: "18W carga rápida",
      connectivity: "4G LTE, Wi-Fi 5, Bluetooth 5.1",
      os: "Android 13 con MIUI 14",
      dimensions: "167.3 x 76.9 x 8.1 mm",
      weight: "192g",
      extras: "Sensor huellas lateral, jack 3.5mm, IR blaster"
    },
    pros: [
      "Precio muy accesible",
      "Pantalla grande de 6.74\"",
      "Buena autonomía",
      "IR blaster"
    ],
    cons: [
      "Pantalla LCD baja resolución",
      "Sin 5G ni NFC",
      "Carga lenta de 18W"
    ],
    forWho: "Usuarios con presupuesto muy ajustado que priorizan funcionalidad básica.",
    prices: [
      { store: "Mercado Libre", price: 149999, url: "https://www.mercadolibre.com.ar/xiaomi-redmi-13c", available: true },
      { store: "Frávega", price: 179999, url: "https://www.fravega.com/p/celular-xiaomi-redmi-13c", available: true }
    ],
    has5G: false,
    hasNFC: false
  },
  {
    id: "motorola-moto-g24",
    name: "Motorola Moto G24",
    brand: "Motorola",
    year: 2024,
    gama: "baja",
    image: "https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g24.jpg",
    review: "El Moto G24 trae la experiencia Motorola limpia a la gama de entrada. Pantalla de 90Hz fluida para el precio. El Helio G85 cumple para WhatsApp y redes. Android casi stock sin bloatware.",
    specs: {
      display: "6.56\" LCD IPS, HD+, 90Hz",
      processor: "MediaTek Helio G85",
      ram: "4GB / 8GB",
      storage: "128GB (expandible microSD)",
      mainCamera: "50MP principal + 2MP macro",
      frontCamera: "8MP",
      battery: "5000mAh",
      charging: "18W carga rápida",
      connectivity: "4G LTE, Wi-Fi 5, Bluetooth 5.0",
      os: "Android 14",
      dimensions: "163.5 x 74.5 x 8 mm",
      weight: "181g",
      extras: "Sensor huellas lateral, jack 3.5mm, IP52"
    },
    pros: [
      "Android limpio sin bloatware",
      "Pantalla 90Hz fluida",
      "Android 14 de fábrica",
      "IP52 básico"
    ],
    cons: [
      "Pantalla LCD HD+",
      "Sin 5G ni NFC",
      "Carga lenta 18W",
      "Cámara secundaria inútil"
    ],
    forWho: "Usuarios que valoran software limpio en un smartphone básico y confiable.",
    prices: [
      { store: "Mercado Libre", price: 179999, url: "https://www.mercadolibre.com.ar/motorola-moto-g24", available: true },
      { store: "Frávega", price: 209999, url: "https://www.fravega.com/p/celular-motorola-moto-g24", available: true }
    ],
    has5G: false,
    hasNFC: false
  },
  {
    id: "tcl-50-se",
    name: "TCL 50 SE",
    brand: "TCL",
    year: 2024,
    gama: "baja",
    image: "https://fdn2.gsmarena.com/vv/bigpic/tcl-50-se.jpg",
    review: "TCL trae su experiencia en pantallas al TCL 50 SE con tecnología NXTVISION. Pantalla grande de 6.78\" con buen brillo. El Helio G88 cumple para tareas básicas. Buena opción económica.",
    specs: {
      display: "6.78\" LCD IPS, HD+, 90Hz",
      processor: "MediaTek Helio G88",
      ram: "4GB / 6GB",
      storage: "128GB / 256GB (expandible microSD)",
      mainCamera: "50MP principal + 2MP macro + 2MP profundidad",
      frontCamera: "8MP",
      battery: "5010mAh",
      charging: "18W carga rápida",
      connectivity: "4G LTE, Wi-Fi 5, Bluetooth 5.0",
      os: "Android 14 con TCL UI",
      dimensions: "167.2 x 75.5 x 8.4 mm",
      weight: "190g",
      extras: "NXTVISION display, jack 3.5mm"
    },
    pros: [
      "Pantalla grande con NXTVISION",
      "Batería 5010mAh",
      "Precio accesible",
      "Android 14"
    ],
    cons: [
      "Sin 5G ni NFC",
      "Pantalla HD+",
      "Cámaras secundarias inútiles"
    ],
    forWho: "Usuarios que conocen TCL por sus TVs y buscan smartphone económico con pantalla grande.",
    prices: [
      { store: "Mercado Libre", price: 139999, url: "https://www.mercadolibre.com.ar/tcl-50-se", available: true },
      { store: "Frávega", price: 159999, url: "https://www.fravega.com/p/celular-tcl-50-se", available: true }
    ],
    has5G: false,
    hasNFC: false
  },
  {
    id: "vivo-y28",
    name: "Vivo Y28 5G",
    brand: "Vivo",
    year: 2024,
    gama: "media",
    image: "https://fdn2.gsmarena.com/vv/bigpic/vivo-y28-5g.jpg",
    review: "Vivo llega a Argentina con el Y28, un gama media competitivo con 5G. El Dimensity 6020 ofrece buen rendimiento y eficiencia. La batería de 5000mAh con carga de 44W es competitiva. Diseño atractivo con acabado premium.",
    specs: {
      display: "6.56\" LCD IPS, FHD+, 90Hz",
      processor: "MediaTek Dimensity 6020",
      ram: "8GB",
      storage: "128GB / 256GB (expandible microSD)",
      mainCamera: "50MP principal + 2MP profundidad",
      frontCamera: "8MP",
      battery: "5000mAh",
      charging: "44W FlashCharge",
      connectivity: "5G, Wi-Fi 5, Bluetooth 5.1, (sin NFC)",
      os: "Android 14 con Funtouch OS 14",
      dimensions: "164.1 x 76.2 x 8.2 mm",
      weight: "193g",
      extras: "Sensor huellas lateral, jack 3.5mm, IP54"
    },
    pros: [
      "5G en gama media accesible",
      "Carga rápida 44W",
      "Diseño atractivo",
      "Android 14"
    ],
    cons: [
      "Pantalla LCD (no AMOLED)",
      "Sin NFC",
      "Marca nueva en Argentina",
      "Cámara secundaria inútil"
    ],
    forWho: "Usuarios que buscan 5G accesible con buen diseño y carga rápida.",
    prices: [
      { store: "Mercado Libre", price: 349999, url: "https://www.mercadolibre.com.ar/vivo-y28-5g", available: true }
    ],
    has5G: true,
    hasNFC: false
  },
  {
    id: "zte-blade-a75",
    name: "ZTE Blade A75 5G",
    brand: "ZTE",
    year: 2024,
    gama: "media",
    image: "https://fdn2.gsmarena.com/vv/bigpic/zte-blade-a75-5g.jpg",
    review: "ZTE ofrece 5G económico con el Blade A75. El Dimensity 6100+ es eficiente y capaz. Pantalla LCD grande de 6.6\" y batería de 5000mAh. Buena opción para quienes buscan 5G sin gastar mucho.",
    specs: {
      display: "6.6\" LCD IPS, FHD+, 90Hz",
      processor: "MediaTek Dimensity 6100+",
      ram: "4GB / 6GB",
      storage: "128GB (expandible microSD)",
      mainCamera: "50MP principal + 2MP macro",
      frontCamera: "8MP",
      battery: "5000mAh",
      charging: "22.5W carga rápida",
      connectivity: "5G, Wi-Fi 5, Bluetooth 5.1, (sin NFC)",
      os: "Android 13",
      dimensions: "164 x 75.2 x 8.4 mm",
      weight: "185g",
      extras: "Sensor huellas lateral, jack 3.5mm"
    },
    pros: [
      "5G muy económico",
      "Pantalla FHD+",
      "Batería 5000mAh",
      "Precio accesible"
    ],
    cons: [
      "Sin NFC",
      "RAM 4GB justa",
      "Marca con menos soporte local",
      "Carga lenta 22.5W"
    ],
    forWho: "Usuarios que quieren 5G al menor precio posible sin renunciar a lo básico.",
    prices: [
      { store: "Mercado Libre", price: 279999, url: "https://www.mercadolibre.com.ar/zte-blade-a75-5g", available: true }
    ],
    has5G: true,
    hasNFC: false
  },

  // ==================== NUEVOS MODELOS 2025 ====================
  
  // Motorola Edge 60 Series
  {
    id: "motorola-edge-60-fusion",
    name: "Motorola Edge 60 Fusion",
    brand: "Motorola",
    year: 2025,
    gama: "media",
    image: "https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-60-fusion.jpg",
    review: "El Edge 60 Fusion es un gama media con aspiraciones altas. Dimensity 7300, pantalla pOLED de 144Hz y batería de 5500mAh con carga de 68W. Diseño elegante y Android limpio con promesa de actualizaciones.",
    specs: {
      display: "6.7\" pOLED, FHD+, 144Hz, HDR10+",
      processor: "MediaTek Dimensity 7300 (4nm)",
      ram: "8GB / 12GB",
      storage: "256GB / 512GB",
      mainCamera: "50MP principal OIS + 13MP ultra angular 120°",
      frontCamera: "32MP",
      battery: "5500mAh",
      charging: "68W TurboPower",
      connectivity: "5G, Wi-Fi 6E, Bluetooth 5.3, NFC",
      os: "Android 15 (2 años actualizaciones Android)",
      dimensions: "161.8 x 73.8 x 7.9 mm",
      weight: "175g",
      extras: "IP52, parlantes estéreo Dolby Atmos"
    },
    pros: [
      "Pantalla 144Hz fluida",
      "Carga rápida 68W",
      "Android limpio",
      "Diseño delgado y liviano",
      "Parlantes estéreo"
    ],
    cons: [
      "Solo IP52",
      "Sin telefoto",
      "2 años de actualizaciones limitados"
    ],
    forWho: "Usuarios que buscan un gama media con pantalla fluida y carga rápida.",
    prices: [
      { store: "Mercado Libre", price: 549999, url: "https://www.mercadolibre.com.ar/motorola-edge-60-fusion", available: true },
      { store: "Frávega", price: 599999, url: "https://www.fravega.com/p/celular-motorola-edge-60-fusion", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  
  // Motorola Razr 60 Series
  {
    id: "motorola-razr-60",
    name: "Motorola Razr 60",
    brand: "Motorola",
    year: 2025,
    gama: "alta",
    image: "https://fdn2.gsmarena.com/vv/bigpic/motorola-razr-60.jpg",
    review: "El Razr 60 es el plegable más accesible de Motorola. Pantalla externa de 3.6\" para uso básico sin abrir. Dimensity 7300 y batería mejorada de 4500mAh. Ideal para quienes quieren probar el formato flip sin gastar fortune.",
    specs: {
      display: "6.9\" pOLED plegable, FHD+, 120Hz + 3.6\" externa",
      processor: "MediaTek Dimensity 7300 (4nm)",
      ram: "8GB",
      storage: "256GB",
      mainCamera: "50MP principal OIS + 13MP ultra angular",
      frontCamera: "32MP",
      battery: "4500mAh",
      charging: "30W TurboPower",
      connectivity: "5G, Wi-Fi 6E, Bluetooth 5.3, NFC",
      os: "Android 15 (3 años actualizaciones)",
      dimensions: "171.3 x 74 x 7.2 mm (abierto)",
      weight: "188g",
      extras: "IPX8, parlantes estéreo"
    },
    pros: [
      "Formato flip compacto",
      "Pantalla externa útil",
      "Precio accesible para plegable",
      "Android limpio",
      "IPX8 resistente al agua"
    ],
    cons: [
      "Chip Dimensity medio",
      "Carga lenta 30W",
      "Sin carga inalámbrica"
    ],
    forWho: "Curiosos del formato plegable flip que quieren probar sin gastar tanto.",
    prices: [
      { store: "Mercado Libre", price: 1199999, url: "https://www.mercadolibre.com.ar/motorola-razr-60", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "motorola-razr-60-ultra",
    name: "Motorola Razr 60 Ultra",
    brand: "Motorola",
    year: 2025,
    gama: "alta",
    image: "https://fdn2.gsmarena.com/vv/bigpic/motorola-razr-60-ultra.jpg",
    review: "El Razr 60 Ultra es el plegable más premium de Motorola. Snapdragon 8 Elite, pantalla externa de 4\" que funciona como smartphone completo, y batería mejorada de 4500mAh. Certificación IP48 única en plegables.",
    specs: {
      display: "6.9\" pOLED plegable, FHD+, 165Hz + 4\" externa LTPO",
      processor: "Snapdragon 8 Elite",
      ram: "12GB",
      storage: "256GB / 512GB",
      mainCamera: "50MP principal OIS f/1.7 + 50MP tele 2x",
      frontCamera: "32MP",
      battery: "4500mAh",
      charging: "68W TurboPower, 15W inalámbrica",
      connectivity: "5G, Wi-Fi 7, Bluetooth 5.4, NFC, UWB",
      os: "Android 15 (3 años actualizaciones)",
      dimensions: "171.3 x 74 x 7.2 mm (abierto)",
      weight: "199g",
      extras: "IP48, pantalla externa completa, Moto AI"
    },
    pros: [
      "Snapdragon 8 Elite potente",
      "Pantalla externa de 4\" funcional",
      "IP48 única en plegables",
      "Cámara telefoto 2x",
      "Carga inalámbrica"
    ],
    cons: [
      "Precio elevado",
      "Batería moderada 4500mAh",
      "Solo 3 años de actualizaciones"
    ],
    forWho: "Usuarios que quieren el mejor plegable flip con rendimiento flagship.",
    prices: [
      { store: "Mercado Libre", price: 1899999, url: "https://www.mercadolibre.com.ar/motorola-razr-60-ultra", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  
  // Motorola Moto G Series
  {
    id: "motorola-moto-g86",
    name: "Motorola Moto G86",
    brand: "Motorola",
    year: 2025,
    gama: "media",
    image: "https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g86.jpg",
    review: "El Moto G86 mejora la fórmula ganadora de la serie G. Snapdragon 6 Gen 3, pantalla pOLED de 120Hz y carga de 68W. Android limpio y diseño resistente al agua IP52. Excelente opción de gama media.",
    specs: {
      display: "6.67\" pOLED, FHD+, 120Hz, HDR10+",
      processor: "Snapdragon 6 Gen 3",
      ram: "8GB / 12GB",
      storage: "256GB",
      mainCamera: "50MP principal OIS + 8MP ultra angular",
      frontCamera: "32MP",
      battery: "5000mAh",
      charging: "68W TurboPower",
      connectivity: "5G, Wi-Fi 6, Bluetooth 5.2, NFC",
      os: "Android 15 (2 años actualizaciones)",
      dimensions: "161.1 x 73.8 x 7.6 mm",
      weight: "172g",
      extras: "IP52, parlantes estéreo Dolby Atmos"
    },
    pros: [
      "Pantalla pOLED 120Hz",
      "Carga rápida 68W",
      "Android limpio",
      "Diseño liviano",
      "Buena cámara selfie"
    ],
    cons: [
      "Solo IP52",
      "2 años de actualizaciones",
      "Sin zoom óptico"
    ],
    forWho: "Usuarios que buscan gama media equilibrado con software limpio.",
    prices: [
      { store: "Mercado Libre", price: 449999, url: "https://www.mercadolibre.com.ar/motorola-moto-g86", available: true },
      { store: "Frávega", price: 479999, url: "https://www.fravega.com/p/celular-motorola-moto-g86", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "motorola-moto-g85",
    name: "Motorola Moto G85",
    brand: "Motorola",
    year: 2025,
    gama: "media",
    image: "https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g85.jpg",
    review: "El Moto G85 destaca por su pantalla pOLED curva en gama media. Snapdragon 6s Gen 3 y batería de 5000mAh con carga de 33W. Android limpio y diseño premium para su precio.",
    specs: {
      display: "6.67\" pOLED curvo, FHD+, 120Hz",
      processor: "Snapdragon 6s Gen 3",
      ram: "8GB / 12GB",
      storage: "256GB",
      mainCamera: "50MP principal OIS + 8MP ultra angular",
      frontCamera: "32MP",
      battery: "5000mAh",
      charging: "33W TurboPower",
      connectivity: "5G, Wi-Fi 5, Bluetooth 5.1, NFC",
      os: "Android 14 (2 años actualizaciones)",
      dimensions: "161.9 x 74 x 7.6 mm",
      weight: "173g",
      extras: "IP52, parlantes estéreo"
    },
    pros: [
      "Pantalla pOLED curva premium",
      "Diseño elegante",
      "Android limpio",
      "Buena cámara selfie 32MP",
      "Liviano"
    ],
    cons: [
      "Carga 33W moderada",
      "Solo IP52",
      "Wi-Fi 5 limitado"
    ],
    forWho: "Usuarios que priorizan diseño y pantalla premium en gama media.",
    prices: [
      { store: "Mercado Libre", price: 399999, url: "https://www.mercadolibre.com.ar/motorola-moto-g85", available: true },
      { store: "Frávega", price: 429999, url: "https://www.fravega.com/p/celular-motorola-moto-g85", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "motorola-moto-g75",
    name: "Motorola Moto G75",
    brand: "Motorola",
    year: 2025,
    gama: "media",
    image: "https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g75.jpg",
    review: "El Moto G75 es único en gama media con certificación IP68/IP69 militar. Snapdragon 6 Gen 3 y batería enorme de 5000mAh. Resistente para usuarios exigentes.",
    specs: {
      display: "6.78\" IPS LCD, FHD+, 120Hz",
      processor: "Snapdragon 6 Gen 3",
      ram: "8GB",
      storage: "128GB / 256GB (expandible microSD)",
      mainCamera: "50MP principal OIS + 8MP ultra angular",
      frontCamera: "16MP",
      battery: "5000mAh",
      charging: "30W TurboPower",
      connectivity: "5G, Wi-Fi 5, Bluetooth 5.1, NFC",
      os: "Android 14 (2 años actualizaciones)",
      dimensions: "166.3 x 76.1 x 8.3 mm",
      weight: "196g",
      extras: "IP68/IP69, MIL-STD-810H, parlantes estéreo"
    },
    pros: [
      "IP68/IP69 ultra resistente",
      "MIL-STD-810H militar",
      "Almacenamiento expandible",
      "Android limpio",
      "Batería confiable"
    ],
    cons: [
      "Pantalla LCD (no OLED)",
      "Carga 30W lenta",
      "Diseño algo grueso"
    ],
    forWho: "Usuarios que necesitan un teléfono resistente para trabajo o aventuras.",
    prices: [
      { store: "Mercado Libre", price: 349999, url: "https://www.mercadolibre.com.ar/motorola-moto-g75", available: true },
      { store: "Frávega", price: 379999, url: "https://www.fravega.com/p/celular-motorola-moto-g75", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  
  // Samsung Galaxy A Series
  {
    id: "samsung-galaxy-a36",
    name: "Samsung Galaxy A36 5G",
    brand: "Samsung",
    year: 2025,
    gama: "media",
    image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a36.jpg",
    review: "El Galaxy A36 trae la experiencia Samsung a un precio más accesible. Exynos 1380 mejorado, pantalla Super AMOLED de 120Hz y 6 años de actualizaciones. IP67 y One UI 7 completo.",
    specs: {
      display: "6.6\" Super AMOLED, FHD+, 120Hz",
      processor: "Exynos 1380",
      ram: "6GB / 8GB",
      storage: "128GB / 256GB (expandible microSD)",
      mainCamera: "50MP principal OIS + 8MP ultra angular + 5MP macro",
      frontCamera: "13MP",
      battery: "5000mAh",
      charging: "25W carga rápida",
      connectivity: "5G, Wi-Fi 6, Bluetooth 5.3, NFC",
      os: "Android 15 con One UI 7 (6 años actualizaciones)",
      dimensions: "162.6 x 77.9 x 7.4 mm",
      weight: "195g",
      extras: "IP67, parlantes estéreo"
    },
    pros: [
      "6 años de actualizaciones",
      "Pantalla AMOLED 120Hz",
      "IP67",
      "Almacenamiento expandible",
      "One UI 7 completo"
    ],
    cons: [
      "Carga 25W lenta",
      "Cámara macro poco útil",
      "Sin zoom óptico"
    ],
    forWho: "Usuarios que quieren la experiencia Samsung con actualizaciones garantizadas a buen precio.",
    prices: [
      { store: "Mercado Libre", price: 449999, url: "https://www.mercadolibre.com.ar/samsung-galaxy-a36-5g", available: true },
      { store: "Frávega", price: 479999, url: "https://www.fravega.com/p/celular-samsung-galaxy-a36", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "samsung-galaxy-a16",
    name: "Samsung Galaxy A16 5G",
    brand: "Samsung",
    year: 2024,
    gama: "baja",
    image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a16-5g.jpg",
    review: "El Galaxy A16 5G sorprende con 6 años de actualizaciones en gama de entrada. Exynos 1330, pantalla AMOLED de 90Hz y batería de 5000mAh. El mejor gama baja Samsung para longevidad.",
    specs: {
      display: "6.7\" Super AMOLED, FHD+, 90Hz",
      processor: "Exynos 1330",
      ram: "4GB / 8GB",
      storage: "128GB / 256GB (expandible microSD)",
      mainCamera: "50MP principal + 5MP ultra angular + 2MP macro",
      frontCamera: "13MP",
      battery: "5000mAh",
      charging: "25W carga rápida",
      connectivity: "5G, Wi-Fi 5, Bluetooth 5.3, NFC",
      os: "Android 14 con One UI 6.1 (6 años actualizaciones)",
      dimensions: "164.4 x 77.9 x 7.9 mm",
      weight: "200g",
      extras: "IP54"
    },
    pros: [
      "6 años de actualizaciones único",
      "Pantalla AMOLED en gama baja",
      "5G accesible",
      "Batería de 5000mAh",
      "Almacenamiento expandible"
    ],
    cons: [
      "Solo IP54",
      "RAM 4GB justa en versión base",
      "Cámaras secundarias limitadas"
    ],
    forWho: "Usuarios que quieren un Samsung duradero con 5G al menor precio posible.",
    prices: [
      { store: "Mercado Libre", price: 289999, url: "https://www.mercadolibre.com.ar/samsung-galaxy-a16-5g", available: true },
      { store: "Frávega", price: 309999, url: "https://www.fravega.com/p/celular-samsung-galaxy-a16-5g", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "samsung-galaxy-a06",
    name: "Samsung Galaxy A06",
    brand: "Samsung",
    year: 2024,
    gama: "baja",
    image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a06-1.jpg",
    review: "El Galaxy A06 es el Samsung más económico con actualizaciones garantizadas. Helio G85, pantalla de 6.7\" y batería de 5000mAh. Ideal como primer smartphone o uso básico.",
    specs: {
      display: "6.7\" PLS LCD, HD+, 60Hz",
      processor: "MediaTek Helio G85",
      ram: "4GB / 6GB",
      storage: "64GB / 128GB (expandible microSD)",
      mainCamera: "50MP principal + 2MP profundidad",
      frontCamera: "8MP",
      battery: "5000mAh",
      charging: "25W carga rápida",
      connectivity: "4G, Wi-Fi 5, Bluetooth 5.3, NFC (algunas variantes)",
      os: "Android 14 con One UI Core (2 años actualizaciones)",
      dimensions: "167.3 x 77.4 x 8 mm",
      weight: "189g",
      extras: "Ranura microSD"
    },
    pros: [
      "Precio muy accesible",
      "Batería de 5000mAh",
      "Cámara principal 50MP",
      "Almacenamiento expandible",
      "Marca confiable"
    ],
    cons: [
      "Sin 5G",
      "Pantalla LCD 60Hz",
      "Solo 2 años actualizaciones"
    ],
    forWho: "Primer smartphone, uso básico o regalo para usuarios no exigentes.",
    prices: [
      { store: "Mercado Libre", price: 179999, url: "https://www.mercadolibre.com.ar/samsung-galaxy-a06", available: true },
      { store: "Frávega", price: 199999, url: "https://www.fravega.com/p/celular-samsung-galaxy-a06", available: true }
    ],
    has5G: false,
    hasNFC: true
  },
  
  // Samsung Galaxy Fold & FE Series
  {
    id: "samsung-galaxy-z-fold7",
    name: "Samsung Galaxy Z Fold7",
    brand: "Samsung",
    year: 2025,
    gama: "alta",
    image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold7.jpg",
    review: "El Z Fold7 es el plegable más avanzado de Samsung. Snapdragon 8 Elite, pantalla interior de 7.6\" y exterior de 6.3\", ambas con 120Hz. Más delgado y liviano que su predecesor. Galaxy AI completo.",
    specs: {
      display: "7.6\" Dynamic AMOLED 2X plegable + 6.3\" exterior, 1-120Hz LTPO",
      processor: "Snapdragon 8 Elite for Galaxy",
      ram: "12GB / 16GB",
      storage: "256GB / 512GB / 1TB",
      mainCamera: "50MP principal OIS + 12MP ultra angular + 10MP tele 3x",
      frontCamera: "10MP (exterior) + 4MP bajo pantalla (interior)",
      battery: "4400mAh",
      charging: "25W carga rápida, 15W inalámbrica",
      connectivity: "5G, Wi-Fi 7, Bluetooth 5.4, NFC, UWB",
      os: "Android 15 con One UI 7 (7 años actualizaciones)",
      dimensions: "153.5 x 132.6 x 4.2 mm (abierto)",
      weight: "215g",
      extras: "S Pen compatible, IPX8, Gorilla Glass Victus 2"
    },
    pros: [
      "Pantalla plegable 7.6\" productiva",
      "Snapdragon 8 Elite máximo rendimiento",
      "7 años de actualizaciones",
      "Galaxy AI completo",
      "Más delgado que Z Fold6"
    ],
    cons: [
      "Precio muy elevado",
      "Batería moderada para el tamaño",
      "Carga lenta 25W"
    ],
    forWho: "Usuarios power que quieren máxima productividad con formato tablet plegable.",
    prices: [
      { store: "Mercado Libre", price: 3799999, url: "https://www.mercadolibre.com.ar/samsung-galaxy-z-fold7", available: true },
      { store: "Samsung Shop", price: 3999999, url: "https://shop.samsung.com.ar/galaxy-z-fold7", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "samsung-galaxy-s24-fe",
    name: "Samsung Galaxy S24 FE",
    brand: "Samsung",
    year: 2024,
    gama: "alta",
    image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-fe-r1.jpg",
    review: "El S24 FE trae la experiencia Galaxy S a un precio más accesible. Exynos 2400e con Galaxy AI completo, pantalla de 6.7\" AMOLED 120Hz y 7 años de actualizaciones. La mejor opción para entrar al ecosistema S.",
    specs: {
      display: "6.7\" Dynamic AMOLED 2X, FHD+, 1-120Hz LTPO",
      processor: "Exynos 2400e",
      ram: "8GB",
      storage: "128GB / 256GB / 512GB",
      mainCamera: "50MP principal OIS + 12MP ultra angular + 8MP tele 3x",
      frontCamera: "10MP",
      battery: "4700mAh",
      charging: "25W carga rápida, 15W inalámbrica",
      connectivity: "5G, Wi-Fi 6E, Bluetooth 5.3, NFC",
      os: "Android 14 con One UI 6.1 (7 años actualizaciones)",
      dimensions: "162 x 77.3 x 8 mm",
      weight: "213g",
      extras: "IP68, Galaxy AI, parlantes estéreo"
    },
    pros: [
      "Galaxy AI completo",
      "7 años de actualizaciones",
      "Pantalla grande 6.7\"",
      "IP68",
      "Precio más accesible que S24"
    ],
    cons: [
      "Exynos menos eficiente",
      "Carga 25W lenta",
      "Sin S Pen"
    ],
    forWho: "Usuarios que quieren experiencia Galaxy S con Galaxy AI sin el precio del S24.",
    prices: [
      { store: "Mercado Libre", price: 999999, url: "https://www.mercadolibre.com.ar/samsung-galaxy-s24-fe", available: true },
      { store: "Frávega", price: 1099999, url: "https://www.fravega.com/p/celular-samsung-galaxy-s24-fe", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "samsung-galaxy-s25-fe",
    name: "Samsung Galaxy S25 FE",
    brand: "Samsung",
    year: 2025,
    gama: "alta",
    image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-fe.jpg",
    review: "El S25 FE mejora con el Exynos 2400 completo y Galaxy AI evolucionado. Pantalla de 6.7\" AMOLED 120Hz más brillante, carga mejorada a 45W y 7 años de actualizaciones. El FE más completo hasta la fecha.",
    specs: {
      display: "6.7\" Dynamic AMOLED 2X, FHD+, 1-120Hz LTPO",
      processor: "Exynos 2400",
      ram: "8GB",
      storage: "128GB / 256GB / 512GB",
      mainCamera: "50MP principal OIS + 12MP ultra angular + 8MP tele 3x",
      frontCamera: "12MP",
      battery: "4900mAh",
      charging: "45W carga rápida, 15W inalámbrica",
      connectivity: "5G, Wi-Fi 6E, Bluetooth 5.3, NFC",
      os: "Android 16 con One UI 8 (7 años actualizaciones)",
      dimensions: "161.3 x 76.6 x 7.4 mm",
      weight: "190g",
      extras: "IP68, Galaxy AI mejorado, parlantes estéreo"
    },
    pros: [
      "Exynos 2400 completo",
      "Carga mejorada a 45W",
      "Galaxy AI evolucionado",
      "7 años de actualizaciones",
      "Más liviano que S24 FE"
    ],
    cons: [
      "Aún sin Snapdragon",
      "Cámara sin cambios",
      "Precio incrementado"
    ],
    forWho: "Usuarios que buscan la mejor relación calidad-precio en la línea Galaxy S.",
    prices: [
      { store: "Mercado Libre", price: 1199999, url: "https://www.mercadolibre.com.ar/samsung-galaxy-s25-fe", available: true },
      { store: "Frávega", price: 1299999, url: "https://www.fravega.com/p/celular-samsung-galaxy-s25-fe", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  
  // Xiaomi 17 Series
  {
    id: "xiaomi-17-ultra",
    name: "Xiaomi 17 Ultra",
    brand: "Xiaomi",
    year: 2025,
    gama: "alta",
    image: "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-17-ultra.jpg",
    review: "El Xiaomi 17 Ultra es una bestia fotográfica con sensor de 200MP y colaboración Leica. Snapdragon 8 Elite Gen 5 con 16GB RAM, batería de 6800mAh con carga de 90W+50W inalámbrica. El flagship más completo de Xiaomi.",
    specs: {
      display: "6.9\" LTPO AMOLED, 2K, 1-120Hz, 3200 nits",
      processor: "Snapdragon 8 Elite Gen 5 (3nm)",
      ram: "12GB / 16GB",
      storage: "512GB / 1TB (UFS 4.1)",
      mainCamera: "200MP principal 1\" sensor Leica + 50MP ultra angular + 50MP tele 3x periscópico",
      frontCamera: "32MP",
      battery: "6800mAh (Silicon-Carbon)",
      charging: "90W HyperCharge, 50W inalámbrica",
      connectivity: "5G, Wi-Fi 7, Bluetooth 5.4, NFC, UWB, IR",
      os: "Android 16 con HyperOS 3",
      dimensions: "164.2 x 77.5 x 8.5 mm",
      weight: "230g",
      extras: "IP68, Leica Summilux, anillo de zoom mecánico (edición especial)"
    },
    pros: [
      "Sensor 1\" de 200MP excepcional",
      "Batería 6800mAh monstruosa",
      "Carga 90W+50W rapidísima",
      "Snapdragon 8 Elite Gen 5",
      "Colaboración Leica"
    ],
    cons: [
      "Pesado 230g",
      "HyperOS con publicidad",
      "Precio flagship",
      "Disponibilidad limitada Argentina"
    ],
    forWho: "Entusiastas de fotografía móvil que quieren el mejor sistema de cámaras disponible.",
    prices: [
      { store: "Mercado Libre", price: 3299999, url: "https://www.mercadolibre.com.ar/xiaomi-17-ultra", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "xiaomi-17-pro",
    name: "Xiaomi 17 Pro",
    brand: "Xiaomi",
    year: 2025,
    gama: "alta",
    image: "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-17-pro.jpg",
    review: "El Xiaomi 17 Pro ofrece casi todo del Ultra en formato más compacto. Snapdragon 8 Elite Gen 5, pantalla de 6.3\" 2K con 120Hz, y batería de 6300mAh con carga de 90W+50W inalámbrica.",
    specs: {
      display: "6.3\" LTPO AMOLED, 2K, 1-120Hz, 3000 nits",
      processor: "Snapdragon 8 Elite Gen 5 (3nm)",
      ram: "12GB / 16GB",
      storage: "256GB / 512GB / 1TB (UFS 4.1)",
      mainCamera: "50MP principal Light Fusion + 50MP ultra angular + 50MP tele 3x",
      frontCamera: "32MP",
      battery: "6300mAh (Silicon-Carbon)",
      charging: "90W HyperCharge, 50W inalámbrica",
      connectivity: "5G, Wi-Fi 7, Bluetooth 5.4, NFC, IR",
      os: "Android 16 con HyperOS 3",
      dimensions: "152.7 x 71.8 x 8 mm",
      weight: "192g",
      extras: "IP68, Dragon Crystal Glass"
    },
    pros: [
      "Formato compacto premium",
      "Snapdragon 8 Elite Gen 5",
      "Batería 6300mAh enorme",
      "Carga 90W+50W",
      "Triple 50MP versátil"
    ],
    cons: [
      "Sin sensor de 1\"",
      "HyperOS con publicidad",
      "Precio elevado"
    ],
    forWho: "Usuarios que quieren flagship Xiaomi en formato más compacto.",
    prices: [
      { store: "Mercado Libre", price: 1999999, url: "https://www.mercadolibre.com.ar/xiaomi-17-pro", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "xiaomi-17",
    name: "Xiaomi 17",
    brand: "Xiaomi",
    year: 2025,
    gama: "alta",
    image: "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-17.jpg",
    review: "El Xiaomi 17 base ofrece el mismo Snapdragon 8 Elite Gen 5 que los Pro. Pantalla de 6.3\" AMOLED, batería de 5500mAh con carga de 90W. Excelente flagship a precio razonable.",
    specs: {
      display: "6.3\" LTPO AMOLED, FHD+, 1-120Hz",
      processor: "Snapdragon 8 Elite Gen 5 (3nm)",
      ram: "12GB",
      storage: "256GB / 512GB / 1TB",
      mainCamera: "50MP principal OIS + 50MP ultra angular + 50MP tele 2x",
      frontCamera: "32MP",
      battery: "5500mAh",
      charging: "90W HyperCharge, 50W inalámbrica",
      connectivity: "5G, Wi-Fi 7, Bluetooth 5.4, NFC, IR",
      os: "Android 16 con HyperOS 3",
      dimensions: "152.5 x 71.6 x 8.1 mm",
      weight: "191g",
      extras: "IP68, Gorilla Glass Victus 2"
    },
    pros: [
      "Mismo chip que Pro/Ultra",
      "Formato compacto liviano",
      "Carga 90W+50W",
      "Triple 50MP",
      "Precio más accesible"
    ],
    cons: [
      "Sin telefoto periscópico",
      "HyperOS con publicidad",
      "Batería menor que Pro"
    ],
    forWho: "Usuarios que quieren rendimiento flagship Xiaomi sin pagar precio Ultra.",
    prices: [
      { store: "Mercado Libre", price: 1399999, url: "https://www.mercadolibre.com.ar/xiaomi-17", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  
  // Xiaomi Redmi Note 15 Series
  {
    id: "xiaomi-redmi-note-15-pro",
    name: "Xiaomi Redmi Note 15 Pro",
    brand: "Xiaomi",
    year: 2026,
    gama: "media",
    image: "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-15-pro-5g.jpg",
    review: "El Redmi Note 15 Pro mejora con Dimensity 7400 Ultra, pantalla AMOLED curva de 120Hz y cámara de 200MP con OIS. Carga de 45W y batería de 5110mAh. Excelente gama media.",
    specs: {
      display: "6.67\" AMOLED curvo, 1.5K, 120Hz",
      processor: "MediaTek Dimensity 7400 Ultra",
      ram: "8GB / 12GB",
      storage: "256GB / 512GB",
      mainCamera: "200MP principal OIS + 8MP ultra angular + 2MP macro",
      frontCamera: "20MP",
      battery: "5110mAh",
      charging: "45W HyperCharge",
      connectivity: "5G, Wi-Fi 6, Bluetooth 5.4, NFC",
      os: "Android 15 con HyperOS 2",
      dimensions: "162.4 x 74.4 x 8 mm",
      weight: "210g",
      extras: "IP68, Gorilla Glass Victus 2"
    },
    pros: [
      "Cámara 200MP con OIS",
      "IP68 en gama media",
      "Pantalla 1.5K curva",
      "Batería de 5110mAh",
      "Gorilla Glass Victus 2"
    ],
    cons: [
      "Carga 45W moderada",
      "HyperOS con publicidad",
      "Macro 2MP inútil"
    ],
    forWho: "Usuarios que buscan la mejor cámara en gama media.",
    prices: [
      { store: "Mercado Libre", price: 549999, url: "https://www.mercadolibre.com.ar/xiaomi-redmi-note-15-pro", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  {
    id: "xiaomi-redmi-note-15",
    name: "Xiaomi Redmi Note 15",
    brand: "Xiaomi",
    year: 2026,
    gama: "media",
    image: "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-15-5g.jpg",
    review: "El Redmi Note 15 base ofrece Dimensity 6300, pantalla AMOLED de 120Hz y batería de 5160mAh con carga de 33W. Equilibrado para uso diario.",
    specs: {
      display: "6.67\" AMOLED, FHD+, 120Hz",
      processor: "MediaTek Dimensity 6300",
      ram: "6GB / 8GB",
      storage: "128GB / 256GB (expandible microSD)",
      mainCamera: "108MP principal + 2MP macro + 2MP profundidad",
      frontCamera: "16MP",
      battery: "5160mAh",
      charging: "33W HyperCharge",
      connectivity: "5G, Wi-Fi 5, Bluetooth 5.3, NFC",
      os: "Android 14 con HyperOS",
      dimensions: "162.4 x 75.7 x 7.4 mm",
      weight: "178g",
      extras: "IP54, parlantes estéreo"
    },
    pros: [
      "Pantalla AMOLED 120Hz",
      "Cámara 108MP",
      "Batería de 5160mAh",
      "5G accesible",
      "Liviano 178g"
    ],
    cons: [
      "Solo IP54",
      "Cámaras secundarias básicas",
      "Sin OIS"
    ],
    forWho: "Usuarios que buscan 5G y pantalla AMOLED a precio accesible.",
    prices: [
      { store: "Mercado Libre", price: 349999, url: "https://www.mercadolibre.com.ar/xiaomi-redmi-note-15", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  
  // Poco X7 Pro
  {
    id: "poco-x7-pro",
    name: "Poco X7 Pro",
    brand: "Xiaomi",
    year: 2025,
    gama: "media",
    image: "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x7-pro.jpg",
    review: "El Poco X7 Pro es el rey de la gama media gaming. Dimensity 8400 Ultra, pantalla AMOLED de 120Hz con 3200 nits, y batería de 6000mAh con carga de 90W. Rendimiento de flagship a precio de gama media.",
    specs: {
      display: "6.67\" AMOLED, 1220x2712, 120Hz, 3200 nits",
      processor: "MediaTek Dimensity 8400 Ultra (4nm)",
      ram: "8GB / 12GB",
      storage: "256GB / 512GB (UFS 4.0)",
      mainCamera: "50MP principal OIS + 8MP ultra angular",
      frontCamera: "20MP",
      battery: "6000mAh",
      charging: "90W HyperCharge",
      connectivity: "5G, Wi-Fi 6, Bluetooth 5.4, NFC",
      os: "Android 15 con HyperOS 2",
      dimensions: "160.8 x 74.8 x 8.3 mm",
      weight: "195g",
      extras: "IP54, parlantes estéreo, motor de vibración LiquidCool"
    },
    pros: [
      "Rendimiento casi flagship",
      "Batería 6000mAh enorme",
      "Carga 90W rapidísima",
      "Pantalla 3200 nits brillante",
      "Precio imbatible"
    ],
    cons: [
      "Solo IP54",
      "HyperOS con publicidad",
      "Sin zoom óptico"
    ],
    forWho: "Gamers y usuarios exigentes que quieren máximo rendimiento sin pagar flagship.",
    prices: [
      { store: "Mercado Libre", price: 499999, url: "https://www.mercadolibre.com.ar/poco-x7-pro", available: true },
      { store: "Frávega", price: 549999, url: "https://www.fravega.com/p/celular-poco-x7-pro", available: true }
    ],
    has5G: true,
    hasNFC: true
  },
  
  // Huawei Pura 80 Series
  {
    id: "huawei-pura-80",
    name: "Huawei Pura 80",
    brand: "Huawei",
    year: 2025,
    gama: "alta",
    image: "https://fdn2.gsmarena.com/vv/bigpic/huawei-pura80.jpg",
    review: "El Huawei Pura 80 es el flagship más accesible de la serie. Kirin 9010, pantalla OLED de 6.6\" con 120Hz y cámara triple de 50MP. Sin Google pero con AppGallery completo.",
    specs: {
      display: "6.6\" OLED LTPO, FHD+, 1-120Hz, 2500 nits",
      processor: "Kirin 9010 (7nm)",
      ram: "12GB",
      storage: "256GB / 512GB / 1TB",
      mainCamera: "50MP principal OIS + 12MP ultra angular + 12MP tele 5x periscópico",
      frontCamera: "13MP",
      battery: "4900mAh",
      charging: "66W carga rápida, 50W inalámbrica",
      connectivity: "4G LTE, Wi-Fi 6, Bluetooth 5.2, NFC",
      os: "EMUI 15 / HarmonyOS 5.1",
      dimensions: "161.2 x 74.8 x 8.2 mm",
      weight: "211g",
      extras: "IP68, Kunlun Glass 2"
    },
    pros: [
      "Precio más accesible de la serie",
      "Cámara periscópica 5x",
      "Carga 66W+50W inalámbrica",
      "Diseño premium",
      "IP68"
    ],
    cons: [
      "Sin Google Services",
      "Solo 4G (sin 5G global)",
      "Chip Kirin más lento"
    ],
    forWho: "Usuarios dispuestos a vivir sin Google que quieren hardware Huawei premium.",
    prices: [
      { store: "Mercado Libre", price: 1299999, url: "https://www.mercadolibre.com.ar/huawei-pura-80", available: true }
    ],
    has5G: false,
    hasNFC: true
  },
  {
    id: "huawei-pura-80-pro",
    name: "Huawei Pura 80 Pro",
    brand: "Huawei",
    year: 2025,
    gama: "alta",
    image: "https://fdn2.gsmarena.com/vv/bigpic/huawei-pura80-pro.jpg",
    review: "El Huawei Pura 80 Pro sube la apuesta con Kirin 9020, pantalla de 6.8\" OLED y sistema de cámaras mejorado con zoom 3.5x. Carga de 100W y batería de 5000mAh.",
    specs: {
      display: "6.8\" OLED LTPO, 1.5K, 1-120Hz, 3000 nits",
      processor: "Kirin 9020 (7nm)",
      ram: "12GB / 16GB",
      storage: "256GB / 512GB / 1TB",
      mainCamera: "50MP principal 1\" sensor OIS + 40MP ultra angular + 48MP tele 3.5x",
      frontCamera: "13MP 3D ToF",
      battery: "5000mAh",
      charging: "100W carga rápida, 80W inalámbrica",
      connectivity: "4G LTE, Wi-Fi 6E, Bluetooth 5.2, NFC",
      os: "EMUI 15 / HarmonyOS 5.1",
      dimensions: "162.9 x 75.8 x 8.3 mm",
      weight: "219g",
      extras: "IP68, Kunlun Glass 2, sensor bajo pantalla 3D"
    },
    pros: [
      "Sensor principal de 1\"",
      "Carga 100W+80W impresionante",
      "Pantalla 3000 nits brillante",
      "Diseño premium",
      "Face ID 3D"
    ],
    cons: [
      "Sin Google Services",
      "Solo 4G (sin 5G global)",
      "Precio elevado"
    ],
    forWho: "Usuarios Huawei que quieren hardware Pro sin el precio Ultra.",
    prices: [
      { store: "Mercado Libre", price: 1899999, url: "https://www.mercadolibre.com.ar/huawei-pura-80-pro", available: true }
    ],
    has5G: false,
    hasNFC: true
  },
  {
    id: "huawei-pura-80-ultra",
    name: "Huawei Pura 80 Ultra",
    brand: "Huawei",
    year: 2025,
    gama: "alta",
    image: "https://fdn2.gsmarena.com/vv/bigpic/huawei-pura80-ultra-.jpg",
    review: "El Huawei Pura 80 Ultra es el flagship fotográfico de Huawei. Sensor principal de 1\" de 50MP, zoom periscópico 9.4x y carga de 100W+80W inalámbrica. Sin Google pero con el mejor hardware fotográfico.",
    specs: {
      display: "6.8\" OLED LTPO, 1276x2848, 1-120Hz, 3000 nits",
      processor: "Kirin 9020 (7nm)",
      ram: "16GB",
      storage: "512GB / 1TB",
      mainCamera: "50MP principal 1\" f/1.6-4.0 + 40MP ultra angular + 50MP tele 3.7x + 12.5MP tele 9.4x periscópico",
      frontCamera: "13MP",
      battery: "5170mAh (Global) / 5700mAh (China)",
      charging: "100W carga rápida, 80W inalámbrica, 20W reversa",
      connectivity: "5G (China) / 4G (Global), Wi-Fi 6, Bluetooth 5.2, NFC",
      os: "EMUI 15 / HarmonyOS 5.1",
      dimensions: "163 x 76.1 x 8.3 mm",
      weight: "233.5g",
      extras: "IP68, Kunlun Glass 2, Tiantong satellite (China)"
    },
    pros: [
      "Sistema de cámaras excepcional",
      "Zoom periscópico 9.4x único",
      "Sensor 1\" con apertura variable",
      "Carga 100W+80W",
      "Diseño premium único"
    ],
    cons: [
      "Sin Google Services",
      "Sin 5G fuera de China",
      "Precio muy elevado",
      "Pesado 233g"
    ],
    forWho: "Entusiastas de fotografía que no dependen de Google y quieren lo mejor de Huawei.",
    prices: [
      { store: "Mercado Libre", price: 2499999, url: "https://www.mercadolibre.com.ar/huawei-pura-80-ultra", available: true }
    ],
    has5G: false,
    hasNFC: true
  }
];

export const brands = [...new Set(smartphones.map(s => s.brand))].sort();
export const years = [...new Set(smartphones.map(s => s.year))].sort((a, b) => b - a);

export function getMinPrice(phone: Smartphone): number | null {
  const candidates: number[] = [];

  // 1. Precio ML cacheado en DB (fuente primaria, actualizado cada 30 días)
  if (phone.mlLowestPrice) candidates.push(phone.mlLowestPrice);

  // 2. Precios de otras tiendas (Personal, Claro, Frávega, etc.)
  //    Excluimos Mercado Libre del store_prices ya que ahora se usa mlLowestPrice.
  for (const p of phone.prices) {
    if (!p.available || !p.price) continue;
    const norm = p.store.toLowerCase().replace(/\s+/g, '').replace(/á/g, 'a');
    if (norm === 'mercadolibre') continue;
    candidates.push(p.price);
  }

  return candidates.length > 0 ? Math.min(...candidates) : null;
}

export function formatPrice(price: number | null): string {
  if (price === null) return "No disponible";
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(price);
}
