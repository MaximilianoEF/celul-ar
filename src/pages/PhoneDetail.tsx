import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Check,
  X,
  Monitor,
  Cpu,
  HardDrive,
  Camera,
  Battery,
  Wifi,
  Smartphone as SmartphoneIcon,
  Ruler,
  Scale,
  Sparkles,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { formatPrice, getPhoneImage } from '@/data/smartphones';
import { getGoogleShoppingUrl } from '@/data/storesConfig';
import { PhonePlaceholder } from '@/components/PhonePlaceholder';
import { PhoneCardSkeleton } from '@/components/PhoneCardSkeleton';
import { usePhone } from '@/hooks/usePhones';
import { useLiveMLPrice } from '@/hooks/useLiveMLPrice';
import { useLiveFravegaPrice } from '@/hooks/useLiveFravegaPrice';
import { useMLPriceSync } from '@/hooks/useMLPriceSync';
import phoneImages from '@/assets/phones';

const PhoneDetail = () => {
  const { id } = useParams();
  const { data: phone, isLoading, isError } = usePhone(id ?? '');
  const [imageError, setImageError] = useState(false);

  // ── Sincronización automática del precio ML en DB (cada 30 días) ──────────
  // Si ml_price_updated_at es null o tiene más de 30 días, dispara un fetch
  // a la API de ML y guarda el resultado en la DB via RPC.
  useMLPriceSync(phone);

  // ── Precios en tiempo real (para mostrar listados individuales) ────────────
  const {
    data: mlListings = [],
    isLoading: mlLoading,
    isError: mlError,
    refetch: refetchML,
  } = useLiveMLPrice(phone?.name ?? '', phone?.year);

  const {
    data: fravegaResult,
    isLoading: fravegaLoading,
  } = useLiveFravegaPrice(phone?.name ?? '');

  // Precio de cabecera: priorizamos el precio ML cacheado en DB.
  // Si todavía no está disponible (primera carga), usamos el precio en tiempo real.
  const cheapestML = mlListings[0]?.price;
  const cheapestFravega = fravegaResult?.price;
  const dbMLPrice = phone?.mlLowestPrice ?? null;
  const lowestLivePrice = (() => {
    const candidates = [dbMLPrice, cheapestML, cheapestFravega].filter((p): p is number => !!p);
    return candidates.length > 0 ? Math.min(...candidates) : null;
  })();

  // Fecha de última actualización del precio ML
  const mlPriceDate = phone?.mlPriceUpdatedAt
    ? new Date(phone.mlPriceUpdatedAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null;


  // Precios de otras tiendas desde la DB (excluimos ML y Frávega, que ahora son live)
  const otherStorePrices = (phone?.prices ?? []).filter((p) => {
    const normalized = p.store.toLowerCase().replace(/\s+/g, '').replace(/á/g, 'a');
    return !['mercadolibre', 'fravega'].includes(normalized);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <PhoneCardSkeleton />
            <div className="space-y-4 animate-pulse">
              <div className="h-4 w-32 bg-secondary rounded" />
              <div className="h-8 w-3/4 bg-secondary rounded" />
              <div className="h-32 bg-secondary/50 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !phone) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Equipo no encontrado</h1>
          <Link to="/" className="text-primary hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const gamaClass = phone.gama === 'alta' ? 'badge-gama-alta'
    : phone.gama === 'media' ? 'badge-gama-media'
    : 'badge-gama-baja';

  // Prioridad: imagen local > customImage > URL remota
  const localImage = phoneImages[phone.id];
  const imageUrl = localImage || getPhoneImage(phone);
  const isPlaceholder = !localImage && (imageUrl.includes('placehold.co') || imageUrl === '/placeholder.svg');

  const specItems = [
    { icon: Monitor, label: 'Pantalla', value: phone.specs.display },
    { icon: Cpu, label: 'Procesador', value: phone.specs.processor },
    { icon: HardDrive, label: 'RAM / Almacenamiento', value: `${phone.specs.ram} / ${phone.specs.storage}` },
    { icon: Camera, label: 'Cámara principal', value: phone.specs.mainCamera },
    { icon: Camera, label: 'Cámara frontal', value: phone.specs.frontCamera },
    { icon: Battery, label: 'Batería', value: phone.specs.battery },
    { icon: Sparkles, label: 'Carga', value: phone.specs.charging },
    { icon: Wifi, label: 'Conectividad', value: phone.specs.connectivity },
    { icon: SmartphoneIcon, label: 'Sistema', value: phone.specs.os },
  ];

  if (phone.specs.dimensions) {
    specItems.push({ icon: Ruler, label: 'Dimensiones', value: phone.specs.dimensions });
  }
  if (phone.specs.weight) {
    specItems.push({ icon: Scale, label: 'Peso', value: phone.specs.weight });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Breadcrumb */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Section */}
          <div className="glass-card overflow-hidden">
            <div className="phone-image-container-hq">
              <div className="phone-image-bg" />
              {imageError || isPlaceholder ? (
                <div className="phone-image-wrapper-hq">
                  <PhonePlaceholder brand={phone.brand} name={phone.name} size="lg" />
                </div>
              ) : (
                <div className="phone-image-wrapper-hq">
                  <img
                    src={imageUrl}
                    alt={phone.name}
                    className="phone-image-hq phone-image-hq-shadow"
                    loading="eager"
                    decoding="sync"
                    onError={() => setImageError(true)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className={gamaClass}>
                Gama {phone.gama.charAt(0).toUpperCase() + phone.gama.slice(1)}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                {phone.year}
              </span>
              {phone.has5G && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                  5G
                </span>
              )}
              {phone.hasNFC && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent">
                  NFC
                </span>
              )}
            </div>

            <p className="text-primary font-medium mb-2">{phone.brand}</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              {phone.name}
            </h1>

            {/* Price */}
            <div className="glass-card p-6 mb-8">
              {/* ── Encabezado con precio más bajo ── */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Mejor precio
                    {mlPriceDate && (
                      <span className="ml-1 text-xs opacity-60">· actualizado {mlPriceDate}</span>
                    )}
                  </p>
                  {/* Mostramos el precio DB inmediatamente si existe; si no, esperamos ML live */}
                  {dbMLPrice ? (
                    <p className="text-3xl font-bold gradient-text">
                      {formatPrice(lowestLivePrice ?? dbMLPrice)}
                    </p>
                  ) : mlLoading ? (
                    <div className="h-9 w-40 bg-secondary animate-pulse rounded-lg" />
                  ) : lowestLivePrice ? (
                    <p className="text-3xl font-bold gradient-text">
                      {formatPrice(lowestLivePrice)}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No disponible</p>
                  )}
                </div>
                <button
                  onClick={() => refetchML()}
                  disabled={mlLoading}
                  title="Actualizar precios"
                  className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 text-muted-foreground ${mlLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="space-y-4">
                {/* ── Mercado Libre (precios en vivo) ── */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-semibold text-foreground">🛒 Mercado Libre</p>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-500/15 text-green-400 border border-green-500/20">
                      EN VIVO
                    </span>
                  </div>

                  {mlLoading && (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-11 bg-secondary/50 animate-pulse rounded-lg" />
                      ))}
                    </div>
                  )}

                  {mlError && (
                    <div className="flex items-center justify-between py-2">
                      <p className="text-xs text-muted-foreground italic">
                        No se pudo obtener el precio. Intentá de nuevo.
                      </p>
                      <a
                        href={`https://listado.mercadolibre.com.ar/${encodeURIComponent(phone.name.replace(/\s+/g, '-'))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-all shrink-0"
                      >
                        Buscar <Search className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {!mlLoading && !mlError && mlListings.length === 0 && (
                    <p className="text-xs text-muted-foreground italic py-2">
                      Sin resultados en esta categoría.
                    </p>
                  )}

                  {!mlLoading && mlListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0 gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-foreground truncate">{listing.title}</p>
                        {listing.soldQuantity > 0 && (
                          <p className="text-[10px] text-muted-foreground">{listing.soldQuantity} vendidos</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                          {formatPrice(listing.price)}
                        </span>
                        <a
                          href={listing.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:brightness-110 transition-all"
                        >
                          Ver <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Frávega (scraping o link de búsqueda) ── */}
                <div className="pt-2 border-t border-border/30">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-semibold text-foreground">🏪 Frávega</p>
                    {fravegaResult && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-500/15 text-green-400 border border-green-500/20">
                        EN VIVO
                      </span>
                    )}
                  </div>

                  {fravegaLoading ? (
                    <div className="h-11 bg-secondary/50 animate-pulse rounded-lg" />
                  ) : fravegaResult ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-foreground truncate">{fravegaResult.title}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                          {formatPrice(fravegaResult.price)}
                        </span>
                        <a
                          href={fravegaResult.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:brightness-110 transition-all"
                        >
                          Ver <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Buscá el precio actualizado</p>
                      <a
                        href={`https://www.fravega.com/l/?keyword=${encodeURIComponent(phone.name.replace(/^Apple\s+/i, ''))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-all"
                      >
                        Buscar en Frávega <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* ── Otras tiendas (admin-managed, excluye ML y Frávega) ── */}
                {otherStorePrices.length > 0 && (
                  <div className="pt-2 border-t border-border/30 space-y-2">
                    <p className="text-sm font-semibold text-foreground mb-1">🏬 Otras tiendas</p>
                    {otherStorePrices.map((price) => (
                      <div
                        key={price.store}
                        className="flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{price.store}</p>
                          {!price.available && (
                            <p className="text-xs text-destructive">Sin stock</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {price.price && (
                            <span className={`text-sm font-semibold ${price.available ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                              {formatPrice(price.price)}
                            </span>
                          )}
                          {price.available && price.url && (
                            <a
                              href={price.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:brightness-110 transition-all"
                            >
                              Ver <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Google Shopping fallback ── */}
                <div className="flex items-center justify-between py-2 border-t border-border/30">
                  <div>
                    <p className="text-sm font-medium text-foreground">🔍 Google Shopping</p>
                    <p className="text-xs text-muted-foreground">Comparar en todas las tiendas</p>
                  </div>
                  <a
                    href={getGoogleShoppingUrl(phone.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-all"
                  >
                    Buscar <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Review */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Review</h2>
              <p className="text-muted-foreground leading-relaxed">
                {phone.review}
              </p>
            </div>

            {/* For Who */}
            <div className="glass-card p-4 mb-8 border-l-4 border-primary">
              <p className="text-sm font-medium text-primary mb-1">¿Para quién conviene?</p>
              <p className="text-foreground">{phone.forWho}</p>
            </div>
          </div>
        </div>

        {/* Specs Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Especificaciones técnicas</h2>

          <div className="glass-card p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {specItems.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-start gap-4 py-4 border-b border-border/30 last:border-0"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <spec.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{spec.label}</p>
                    <p className="text-foreground font-medium">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {phone.specs.extras && (
              <div className="mt-6 pt-6 border-t border-border/30">
                <p className="text-sm text-muted-foreground mb-2">Extras</p>
                <p className="text-foreground font-medium">{phone.specs.extras}</p>
              </div>
            )}
          </div>
        </section>

        {/* Pros & Cons */}
        <section className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-green-500/20">
                <Check className="h-4 w-4 text-green-500" />
              </div>
              Puntos positivos
            </h3>
            <ul className="space-y-3">
              {phone.pros.map((pro) => (
                <li key={pro} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                  <span className="text-muted-foreground">{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-500/20">
                <X className="h-4 w-4 text-red-500" />
              </div>
              Puntos negativos
            </h3>
            <ul className="space-y-3">
              {phone.cons.map((con) => (
                <li key={con} className="flex items-start gap-3">
                  <X className="h-4 w-4 text-red-500 mt-1 shrink-0" />
                  <span className="text-muted-foreground">{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-12 text-center">
          <Link
            to="/comparar"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-secondary text-secondary-foreground font-semibold transition-all hover:bg-secondary/80"
          >
            Comparar con otros equipos
          </Link>
        </section>
      </main>

      <footer className="py-8 border-t border-border/50 mt-12">
        <div className="container">
          <p className="text-sm text-muted-foreground text-center">
            Los precios pueden variar. Verificá siempre en la tienda oficial.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PhoneDetail;
