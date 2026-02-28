import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { PhoneCard } from '@/components/PhoneCard';
import { Filters } from '@/components/Filters';
import { smartphones } from '@/data/smartphones';
import type { Gama } from '@/data/smartphones';

const Catalog = () => {
  const [search, setSearch] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedGamas, setSelectedGamas] = useState<Gama[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [has5G, setHas5G] = useState<boolean | null>(null);
  const [hasNFC, setHasNFC] = useState<boolean | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);

  const filteredPhones = useMemo(() => {
    return smartphones.filter(phone => {
      if (search && !phone.name.toLowerCase().includes(search.toLowerCase()) && 
          !phone.brand.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (selectedBrands.length > 0 && !selectedBrands.includes(phone.brand)) {
        return false;
      }
      if (selectedGamas.length > 0 && !selectedGamas.includes(phone.gama)) {
        return false;
      }
      if (selectedYears.length > 0 && !selectedYears.includes(phone.year)) {
        return false;
      }
      if (has5G === true && !phone.has5G) {
        return false;
      }
      if (hasNFC === true && !phone.hasNFC) {
        return false;
      }
      return true;
    });
  }, [search, selectedBrands, selectedGamas, selectedYears, has5G, hasNFC]);

  const stats = useMemo(() => ({
    total: filteredPhones.length,
    alta: filteredPhones.filter(p => p.gama === 'alta').length,
    media: filteredPhones.filter(p => p.gama === 'media').length,
    baja: filteredPhones.filter(p => p.gama === 'baja').length,
  }), [filteredPhones]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Catálogo de Smartphones</h1>
          <p className="text-muted-foreground">
            {stats.total} equipos disponibles • {stats.alta} gama alta • {stats.media} gama media • {stats.baja} gama baja
          </p>
        </div>

        <Filters
          search={search}
          onSearchChange={setSearch}
          selectedBrands={selectedBrands}
          onBrandsChange={setSelectedBrands}
          selectedGamas={selectedGamas}
          onGamasChange={setSelectedGamas}
          selectedYears={selectedYears}
          onYearsChange={setSelectedYears}
          has5G={has5G}
          onHas5GChange={setHas5G}
          hasNFC={hasNFC}
          onHasNFCChange={setHasNFC}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
        />

        {filteredPhones.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No se encontraron equipos con los filtros seleccionados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPhones.map(phone => (
              <PhoneCard key={phone.id} phone={phone} />
            ))}
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

export default Catalog;
