import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Trophy, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { usePhones } from '@/hooks/usePhones';
import { formatPrice, getMinPrice, getPhoneImage, Smartphone } from '@/data/smartphones';
import { PhonePlaceholder } from '@/components/PhonePlaceholder';
import phoneImages from '@/assets/phones';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── Tabla de scores de procesadores (mayor = mejor rendimiento) ─────────────
const PROCESSOR_SCORES: [string, number][] = [
  // Apple
  ['a19 pro', 1000], ['a19', 980], ['a18 pro', 960], ['a18', 940],
  ['a17 pro', 920], ['a17', 900], ['a16', 860], ['a15', 820], ['a14', 780],
  // Snapdragon flagship
  ['snapdragon 8 elite', 990], ['snapdragon 8s elite', 920],
  ['snapdragon 8 gen 3', 950], ['snapdragon 8 gen 2', 910],
  ['snapdragon 8 gen 1', 860], ['snapdragon 888', 820], ['snapdragon 870', 780],
  // Snapdragon mid-range
  ['snapdragon 7s gen 3', 700], ['snapdragon 7 gen 3', 720],
  ['snapdragon 7 gen 2', 680], ['snapdragon 695', 600],
  ['snapdragon 680', 560], ['snapdragon 4 gen 2', 480], ['snapdragon 4 gen 1', 440],
  // Dimensity flagship
  ['dimensity 9400', 970], ['dimensity 9300', 940],
  ['dimensity 9200', 900], ['dimensity 8300', 800],
  ['dimensity 8200', 760], ['dimensity 7300', 680],
  ['dimensity 7025', 620], ['dimensity 6300', 560], ['dimensity 6020', 520],
  // Exynos
  ['exynos 2500', 960], ['exynos 2400', 930], ['exynos 2200', 870],
  ['exynos 1480', 720], ['exynos 1380', 680], ['exynos 1330', 620],
  // Kirin
  ['kirin 9010', 880], ['kirin 9000s', 860], ['kirin 9000', 850],
  ['kirin 990', 780], ['kirin 710', 560],
  // Google Tensor
  ['tensor g4', 860], ['tensor g3', 820], ['tensor g2', 780],
  // Helio/otros
  ['helio g99', 600], ['helio g96', 560], ['helio g88', 520], ['helio g85', 480],
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const extractNumber = (str: string): number => {
  const match = str.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

const getProcessorScore = (processor: string): number => {
  const normalized = processor.toLowerCase();
  for (const [name, score] of PROCESSOR_SCORES) {
    if (normalized.includes(name)) return score;
  }
  return 400;
};

const getRefreshRate = (display: string): number => {
  const match = display.match(/(\d{2,3})hz/i);
  return match ? parseInt(match[1]) : 60;
};

// ─── Component ────────────────────────────────────────────────────────────────
const Compare = () => {
  const { data: allPhones = [], isLoading } = usePhones();
  const [selectedPhones, setSelectedPhones] = useState<Smartphone[]>([]);

  const addPhone = (phoneId: string) => {
    if (selectedPhones.length >= 3) return;
    const phone = allPhones.find(p => p.id === phoneId);
    if (phone && !selectedPhones.find(p => p.id === phoneId)) {
      setSelectedPhones([...selectedPhones, phone]);
    }
  };

  const removePhone = (phoneId: string) => {
    setSelectedPhones(selectedPhones.filter(p => p.id !== phoneId));
  };

  const availablePhones = allPhones.filter(
    p => !selectedPhones.find(sp => sp.id === p.id)
  );

  const winners = useMemo(() => {
    if (selectedPhones.length < 2) return null;

    const result: Record<string, { phone: Smartphone; value: string } | null> = {};

    // 💰 Mejor precio
    const byPrice = [...selectedPhones].sort((a, b) =>
      (getMinPrice(a) || Infinity) - (getMinPrice(b) || Infinity)
    );
    result.price = { phone: byPrice[0], value: formatPrice(getMinPrice(byPrice[0])) };

    // 📷 Mejor cámara (MP)
    const byCamera = [...selectedPhones].sort((a, b) =>
      extractNumber(b.specs.mainCamera) - extractNumber(a.specs.mainCamera)
    );
    result.camera = { phone: byCamera[0], value: byCamera[0].specs.mainCamera.split(' ')[0] };

    // 🔋 Mejor batería
    const byBattery = [...selectedPhones].sort((a, b) =>
      extractNumber(b.specs.battery) - extractNumber(a.specs.battery)
    );
    result.battery = { phone: byBattery[0], value: byBattery[0].specs.battery };

    // ⚡ Más RAM
    const byRam = [...selectedPhones].sort((a, b) =>
      extractNumber(b.specs.ram) - extractNumber(a.specs.ram)
    );
    result.ram = { phone: byRam[0], value: byRam[0].specs.ram };

    // 🚀 Mejor rendimiento: score procesador + bonus RAM
    const byRendimiento = [...selectedPhones].sort((a, b) => {
      const sA = getProcessorScore(a.specs.processor) + extractNumber(a.specs.ram) * 5;
      const sB = getProcessorScore(b.specs.processor) + extractNumber(b.specs.ram) * 5;
      return sB - sA;
    });
    result.rendimiento = {
      phone: byRendimiento[0],
      value: byRendimiento[0].specs.processor.split('(')[0].trim(),
    };

    // 🎮 Mejor gaming: RAM × 20 + batería/100 + Hz/2 + procesador/10
    const byGaming = [...selectedPhones].sort((a, b) => {
      const sA =
        extractNumber(a.specs.ram) * 20 +
        extractNumber(a.specs.battery) / 100 +
        getRefreshRate(a.specs.display) / 2 +
        getProcessorScore(a.specs.processor) / 10;
      const sB =
        extractNumber(b.specs.ram) * 20 +
        extractNumber(b.specs.battery) / 100 +
        getRefreshRate(b.specs.display) / 2 +
        getProcessorScore(b.specs.processor) / 10;
      return sB - sA;
    });
    result.gaming = {
      phone: byGaming[0],
      value: `${byGaming[0].specs.ram} · ${extractNumber(byGaming[0].specs.battery)}mAh · ${getRefreshRate(byGaming[0].specs.display)}Hz`,
    };

    // 🥈 Mejor gama media: mejor relación rendimiento/precio entre los teléfonos gama media seleccionados
    const mediaPhones = selectedPhones.filter(p => p.gama === 'media');
    if (mediaPhones.length > 0) {
      const byMedia = [...mediaPhones].sort((a, b) => {
        const priceA = getMinPrice(a) || 9_999_999;
        const priceB = getMinPrice(b) || 9_999_999;
        const sA = (getProcessorScore(a.specs.processor) + extractNumber(a.specs.ram) * 5) / (priceA / 100_000);
        const sB = (getProcessorScore(b.specs.processor) + extractNumber(b.specs.ram) * 5) / (priceB / 100_000);
        return sB - sA;
      });
      result.gamaMed = {
        phone: byMedia[0],
        value: `${formatPrice(getMinPrice(byMedia[0]))} · ${byMedia[0].specs.ram}`,
      };
    } else {
      result.gamaMed = null;
    }

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

  // Categorías de ganadores siempre visibles (las de gama media solo si aplica)
  const winnerCategories = winners ? [
    { key: 'price',      emoji: '💰', label: 'Mejor precio' },
    { key: 'camera',     emoji: '📷', label: 'Mejor cámara' },
    { key: 'battery',    emoji: '🔋', label: 'Mejor batería' },
    { key: 'ram',        emoji: '⚡', label: 'Más RAM' },
    { key: 'rendimiento',emoji: '🚀', label: 'Mejor rendimiento' },
    { key: 'gaming',     emoji: '🎮', label: 'Mejor gaming' },
    ...(winners.gamaMed ? [{ key: 'gamaMed', emoji: '🥈', label: 'Mejor gama media' }] : []),
  ] : [];

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
                <div key={phone.id} className="glass-card overflow-hidden">
                  <div className="p-2 flex justify-end">
                    <button
                      onClick={() => removePhone(phone.id)}
                      className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

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
                    <h3 className="font-semibold text-foreground text-sm line-clamp-2">{phone.name}</h3>
                    <p className="text-lg font-bold gradient-text mt-2">{formatPrice(getMinPrice(phone))}</p>
                  </div>
                </div>
              );
            }

            return (
              <div key={`slot-${slot}`} className="glass-card p-4 flex flex-col items-center justify-center min-h-[280px]">
                <div className="p-4 rounded-full bg-secondary mb-4">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">Agregar equipo</p>
                <Select onValueChange={addPhone} disabled={isLoading}>
                  <SelectTrigger className="w-full max-w-[200px]">
                    <SelectValue placeholder={isLoading ? 'Cargando...' : 'Seleccionar...'} />
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

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {winnerCategories.map(({ key, emoji, label }) => {
                    const winner = winners[key];
                    if (!winner) return null;
                    return (
                      <div key={key} className="p-4 rounded-lg bg-secondary/50 border border-border/30">
                        <p className="text-xs text-muted-foreground mb-1">{emoji} {label}</p>
                        <p className="font-semibold text-foreground text-sm leading-tight">{winner.phone.name}</p>
                        <p className="text-xs text-primary mt-1.5 leading-snug">{winner.value}</p>
                      </div>
                    );
                  })}
                </div>

                {!winners.gamaMed && (
                  <p className="text-xs text-muted-foreground mt-4">
                    💡 Agregá un teléfono de gama media para ver la categoría "Mejor gama media"
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {selectedPhones.length < 2 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              Seleccioná al menos 2 equipos para ver la comparación
            </p>
            <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline">
              Ver catálogo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
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

export default Compare;
