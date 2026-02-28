import { Link } from 'react-router-dom';
import { Camera, Battery, Cpu, Signal } from 'lucide-react';
import { Smartphone, getMinPrice, formatPrice, getPhoneImage } from '@/data/smartphones';
import { useState } from 'react';
import { PhonePlaceholder } from './PhonePlaceholder';
import phoneImages from '@/assets/phones';

interface PhoneCardProps {
  phone: Smartphone;
  onCompare?: (phone: Smartphone) => void;
  isInCompare?: boolean;
}

export function PhoneCard({ phone, onCompare, isInCompare }: PhoneCardProps) {
  const minPrice = getMinPrice(phone);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const gamaClass = phone.gama === 'alta' ? 'badge-gama-alta' 
    : phone.gama === 'media' ? 'badge-gama-media' 
    : 'badge-gama-baja';

  // Prioridad: 1) Imagen local, 2) customImage, 3) URL remota
  const localImage = phoneImages[phone.id];
  const imageUrl = localImage || getPhoneImage(phone);
  const isPlaceholder = !localImage && (imageUrl.includes('placehold.co') || imageUrl === '/placeholder.svg');

  return (
    <div className="glass-card-hover flex flex-col h-full group overflow-hidden">
      {/* Container de imagen - diseño profesional con fondo uniforme */}
      <div className="relative">
        {/* Badges sobre la imagen */}
        <div className="absolute top-3 left-3 flex gap-2 z-20">
          <span className={gamaClass}>
            {phone.gama.charAt(0).toUpperCase() + phone.gama.slice(1)}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/90 text-secondary-foreground backdrop-blur-sm">
            {phone.year}
          </span>
        </div>

        {/* Contenedor de imagen con fondo consistente y dimensiones fijas */}
        <div className="phone-image-container">
          <div className="phone-image-bg" />
          
          {(imageError || isPlaceholder) ? (
            <div className="phone-image-wrapper">
              <PhonePlaceholder brand={phone.brand} name={phone.name} size="md" />
            </div>
          ) : (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}
              <div className="phone-image-wrapper">
                <img
                  src={imageUrl}
                  alt={phone.name}
                  className={`phone-image transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onError={() => setImageError(true)}
                  onLoad={() => setImageLoaded(true)}
                  loading="lazy"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Info - contenido con padding */}
      <div className="flex-1 flex flex-col p-4 pt-3">
        <p className="text-xs text-primary font-medium mb-1">{phone.brand}</p>
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 leading-tight text-sm">
          {phone.name}
        </h3>

        {/* Quick specs */}
        <div className="grid grid-cols-2 gap-1.5 mb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Cpu className="h-3 w-3 text-primary/70 flex-shrink-0" />
            <span className="truncate">{phone.specs.processor.split(' ').slice(0, 2).join(' ')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Camera className="h-3 w-3 text-primary/70 flex-shrink-0" />
            <span>{phone.specs.mainCamera.split(' ')[0]}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Battery className="h-3 w-3 text-primary/70 flex-shrink-0" />
            <span>{phone.specs.battery}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Signal className="h-3 w-3 text-primary/70 flex-shrink-0" />
            <span>{phone.has5G ? '5G' : '4G'}</span>
          </div>
        </div>

        {/* Price */}
        <div className="mt-auto">
          <p className="text-xs text-muted-foreground mb-0.5">Desde</p>
          <p className="text-lg font-bold gradient-text">
            {formatPrice(minPrice)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <Link 
            to={`/celular/${phone.id}`}
            className="flex-1 py-2 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium text-center transition-all hover:brightness-110"
          >
            Ver más
          </Link>
          {onCompare && (
            <button
              onClick={() => onCompare(phone)}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                isInCompare 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {isInCompare ? '✓' : '+'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
