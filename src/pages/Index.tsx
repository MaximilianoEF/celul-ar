import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Star, Zap } from 'lucide-react';
import { Header } from '@/components/Header';
import { PhoneCard } from '@/components/PhoneCard';
import { Filters } from '@/components/Filters';
import { smartphones, getMinPrice } from '@/data/smartphones';
import type { Gama } from '@/data/smartphones';

const Index = () => {
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

  // Featured phones (lowest price gama alta)
  const featuredPhones = useMemo(() => {
    return smartphones
      .filter(p => p.gama === 'alta')
      .sort((a, b) => (getMinPrice(a) || 0) - (getMinPrice(b) || 0))
      .slice(0, 3);
  }, []);

  // Best value (gama media with best specs)
  const bestValuePhones = useMemo(() => {
    return smartphones
      .filter(p => p.gama === 'media')
      .slice(0, 4);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <TrendingUp className="h-4 w-4" />
              Catálogo actualizado 2024-2025
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-slide-up">
              Encontrá tu próximo{' '}
              <span className="gradient-text">smartphone</span>
              {' '}ideal
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Comparamos precios en Mercado Libre, Frávega y más tiendas argentinas. 
              Reviews honestas, specs reales y el mejor precio disponible.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link
                to="/catalogo"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:brightness-110 glow-primary"
              >
                Ver Catálogo
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/comparar"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-secondary text-secondary-foreground font-semibold transition-all hover:bg-secondary/80"
              >
                Comparar Equipos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">Destacados</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Gama Alta
              </h2>
            </div>
            <Link 
              to="/catalogo?gama=alta" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPhones.map(phone => (
              <PhoneCard key={phone.id} phone={phone} />
            ))}
          </div>
        </div>
      </section>

      {/* Best Value Section */}
      <section className="py-12 bg-secondary/20">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-gama-media" />
                <span className="text-sm font-medium text-gama-media">Mejor relación precio-calidad</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Gama Media Recomendados
              </h2>
            </div>
            <Link 
              to="/catalogo?gama=media" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestValuePhones.map(phone => (
              <PhoneCard key={phone.id} phone={phone} />
            ))}
          </div>
        </div>
      </section>

      {/* Full Catalog Section */}
      <section className="py-12">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            Catálogo Completo
          </h2>
          
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
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 CeluAR. Precios actualizados de tiendas argentinas.
            </p>
            <p className="text-xs text-muted-foreground">
              Los precios pueden variar. Verificá siempre en la tienda oficial.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
