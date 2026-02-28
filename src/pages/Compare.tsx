import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Trophy, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { smartphones, formatPrice, getMinPrice, getPhoneImage, Smartphone } from '@/data/smartphones';
import { PhonePlaceholder } from '@/components/PhonePlaceholder';
import phoneImages from '@/assets/phones';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Compare = () => {
  const [selectedPhones, setSelectedPhones] = useState<Smartphone[]>([]);

  const addPhone = (phoneId: string) => {
    if (selectedPhones.length >= 3) return;
    const phone = smartphones.find(p => p.id === phoneId);
    if (phone && !selectedPhones.find(p => p.id === phoneId)) {
      setSelectedPhones([...selectedPhones, phone]);
    }
  };

  const removePhone = (phoneId: string) => {
    setSelectedPhones(selectedPhones.filter(p => p.id !== phoneId));
  };

  const availablePhones = smartphones.filter(
    p => !selectedPhones.find(sp => sp.id === p.id)
  );

  // Calculate winners
  const winners = useMemo(() => {
    if (selectedPhones.length < 2) return null;

    const result: Record<string, { phone: Smartphone; value: string }> = {};

    // Best price
    const byPrice = [...selectedPhones].sort((a, b) => 
      (getMinPrice(a) || Infinity) - (getMinPrice(b) || Infinity)
    );
    result.price = { 
      phone: byPrice[0], 
      value: formatPrice(getMinPrice(byPrice[0])) 
    };

    // Best camera (by MP)
    const byCamera = [...selectedPhones].sort((a, b) => {
      const mpA = parseInt(a.specs.mainCamera.split('MP')[0]) || 0;
      const mpB = parseInt(b.specs.mainCamera.split('MP')[0]) || 0;
      return mpB - mpA;
    });
    result.camera = { 
      phone: byCamera[0], 
      value: byCamera[0].specs.mainCamera.split(' ')[0] 
    };

    // Best battery
    const byBattery = [...selectedPhones].sort((a, b) => {
      const batA = parseInt(a.specs.battery) || 0;
      const batB = parseInt(b.specs.battery) || 0;
      return batB - batA;
    });
    result.battery = { 
      phone: byBattery[0], 
      value: byBattery[0].specs.battery 
    };

    // Best RAM
    const byRam = [...selectedPhones].sort((a, b) => {
      const ramA = parseInt(a.specs.ram) || 0;
      const ramB = parseInt(b.specs.ram) || 0;
      return ramB - ramA;
    });
    result.ram = { 
      phone: byRam[0], 
      value: byRam[0].specs.ram 
    };

    return result;
  }, [selectedPhones]);

  const comparisonRows = [
    { label: 'Precio mínimo', key: 'price', getValue: (p: Smartphone) => formatPrice(getMinPrice(p)) },
    { label: 'Pantalla', key: 'display', getValue: (p: Smartphone) => p.specs.display },
    { label: 'Procesador', key: 'processor', getValue: (p: Smartphone) => p.specs.processor },
    { label: 'RAM', key: 'ram', getValue: (p: Smartphone) => p.specs.ram },
    { label: 'Almacenamiento', key: 'storage', getValue: (p: Smartphone) => p.specs.storage },
    { label: 'Cámara principal', key: 'mainCamera', getValue: (p: Smartphone) => p.specs.mainCamera },
    { label: 'Cámara frontal', key: 'frontCamera', getValue: (p: Smartphone) => p.specs.frontCamera },
    { label: 'Batería', key: 'battery', getValue: (p: Smartphone) => p.specs.battery },
    { label: 'Carga', key: 'charging', getValue: (p: Smartphone) => p.specs.charging },
    { label: 'Conectividad', key: 'connectivity', getValue: (p: Smartphone) => p.specs.connectivity },
    { label: 'Sistema', key: 'os', getValue: (p: Smartphone) => p.specs.os },
    { label: '5G', key: '5g', getValue: (p: Smartphone) => p.has5G ? '✓ Sí' : '✗ No' },
    { label: 'NFC', key: 'nfc', getValue: (p: Smartphone) => p.hasNFC ? '✓ Sí' : '✗ No' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Comparador</h1>
          <p className="text-muted-foreground">
            Seleccioná hasta 3 equipos para comparar sus especificaciones
          </p>
        </div>

        {/* Phone Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[0, 1, 2].map(slot => {
            const phone = selectedPhones[slot];
            
            if (phone) {
              const localImage = phoneImages[phone.id];
              const imageUrl = localImage || getPhoneImage(phone);
              const isPlaceholder = !localImage && (imageUrl.includes('placehold.co') || imageUrl === '/placeholder.svg');
              
              return (
                <div key={slot} className="glass-card overflow-hidden">
                  <div className="p-2 flex justify-end">
                    <button
                      onClick={() => removePhone(phone.id)}
                      className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Imagen con mismo estilo que catálogo */}
                  <div className="phone-image-container aspect-square">
                    <div className="phone-image-bg" />
                    {isPlaceholder ? (
                      <div className="phone-image-wrapper">
                        <PhonePlaceholder brand={phone.brand} name={phone.name} size="md" />
                      </div>
                    ) : (
                      <div className="phone-image-wrapper">
                        <img
                          src={imageUrl}
                          alt={phone.name}
                          className="phone-image"
                          onError={(e) => {
                            e.currentTarget.src = `https://placehold.co/150x200/1a1f2e/14b8a6?text=${encodeURIComponent(phone.brand)}`;
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 text-center">
                    <p className="text-xs text-primary font-medium mb-1">{phone.brand}</p>
                    <h3 className="font-semibold text-foreground text-sm line-clamp-2">
                      {phone.name}
                    </h3>
                    <p className="text-lg font-bold gradient-text mt-2">
                      {formatPrice(getMinPrice(phone))}
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div key={slot} className="glass-card p-4 flex flex-col items-center justify-center min-h-[280px]">
                <div className="p-4 rounded-full bg-secondary mb-4">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">Agregar equipo</p>
                <Select onValueChange={addPhone}>
                  <SelectTrigger className="w-full max-w-[200px]">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePhones.map(phone => (
                      <SelectItem key={phone.id} value={phone.id}>
                        {phone.brand} {phone.name.replace(phone.brand, '').trim()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        {selectedPhones.length >= 2 && (
          <>
            <div className="glass-card overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground w-40">
                        Especificación
                      </th>
                      {selectedPhones.map(phone => (
                        <th key={phone.id} className="p-4 text-left text-sm font-medium text-foreground">
                          {phone.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row, idx) => (
                      <tr 
                        key={row.key} 
                        className={`border-b border-border/50 ${idx % 2 === 0 ? 'bg-secondary/20' : ''}`}
                      >
                        <td className="p-4 text-sm font-medium text-muted-foreground">
                          {row.label}
                        </td>
                        {selectedPhones.map(phone => (
                          <td key={phone.id} className="p-4 text-sm text-foreground">
                            {row.getValue(phone)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Winners */}
            {winners && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Ganadores por categoría
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground mb-1">💰 Mejor precio</p>
                    <p className="font-semibold text-foreground text-sm">{winners.price.phone.name}</p>
                    <p className="text-xs text-primary mt-1">{winners.price.value}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground mb-1">📷 Mejor cámara</p>
                    <p className="font-semibold text-foreground text-sm">{winners.camera.phone.name}</p>
                    <p className="text-xs text-primary mt-1">{winners.camera.value}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground mb-1">🔋 Mejor batería</p>
                    <p className="font-semibold text-foreground text-sm">{winners.battery.phone.name}</p>
                    <p className="text-xs text-primary mt-1">{winners.battery.value}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground mb-1">⚡ Más RAM</p>
                    <p className="font-semibold text-foreground text-sm">{winners.ram.phone.name}</p>
                    <p className="text-xs text-primary mt-1">{winners.ram.value}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {selectedPhones.length < 2 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              Seleccioná al menos 2 equipos para ver la comparación
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              Ver catálogo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
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

export default Compare;
