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
  Sparkles
} from 'lucide-react';
import { Header } from '@/components/Header';
import { smartphones, formatPrice, getMinPrice, getPhoneImage } from '@/data/smartphones';
import { getPurchaseUrl, getGoogleShoppingUrl } from '@/data/storesConfig';
import { PhonePlaceholder } from '@/components/PhonePlaceholder';
import phoneImages from '@/assets/phones';

const PhoneDetail = () => {
  const { id } = useParams();
  const phone = smartphones.find(p => p.id === id);
  const [imageError, setImageError] = useState(false);

  if (!phone) {
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

  const minPrice = getMinPrice(phone);
  
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
          {/* Image Section - alta calidad para detalle */}
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
              <p className="text-sm text-muted-foreground mb-2">Precio más bajo encontrado</p>
              <p className="text-3xl font-bold gradient-text mb-4">
                {formatPrice(minPrice)}
              </p>
              
              <div className="space-y-3">
                {phone.prices.map((price, idx) => {
                  // Usar sistema extensible de URLs con fallback
                  const storeUrl = getPurchaseUrl(phone.name, price.store, price.url);
                  
                  return (
                    <div 
                      key={idx}
                      className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-foreground">{price.store}</p>
                        {!price.available && (
                          <p className="text-xs text-destructive">Sin stock</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-semibold ${price.available ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                          {price.price ? formatPrice(price.price) : 'No disponible'}
                        </span>
                        {price.available && (
                          <a
                            href={storeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all"
                          >
                            Ver <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {/* Fallback universal: Google Shopping */}
                <div className="flex items-center justify-between py-3 border-t border-border/30 mt-2">
                  <div>
                    <p className="font-medium text-foreground">Google Shopping</p>
                    <p className="text-xs text-muted-foreground">Buscar en todas las tiendas</p>
                  </div>
                  <a
                    href={getGoogleShoppingUrl(phone.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-all"
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
              {specItems.map((spec, idx) => (
                <div 
                  key={idx}
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
              {phone.pros.map((pro, idx) => (
                <li key={idx} className="flex items-start gap-3">
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
              {phone.cons.map((con, idx) => (
                <li key={idx} className="flex items-start gap-3">
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

      {/* Footer */}
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
