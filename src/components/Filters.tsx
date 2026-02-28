import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { brands, years } from '@/data/smartphones';
import type { Gama } from '@/data/smartphones';

interface FiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedBrands: string[];
  onBrandsChange: (brands: string[]) => void;
  selectedGamas: Gama[];
  onGamasChange: (gamas: Gama[]) => void;
  selectedYears: number[];
  onYearsChange: (years: number[]) => void;
  has5G: boolean | null;
  onHas5GChange: (value: boolean | null) => void;
  hasNFC: boolean | null;
  onHasNFCChange: (value: boolean | null) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
}

export function Filters({
  search,
  onSearchChange,
  selectedBrands,
  onBrandsChange,
  selectedGamas,
  onGamasChange,
  selectedYears,
  onYearsChange,
  has5G,
  onHas5GChange,
  hasNFC,
  onHasNFCChange,
}: FiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const toggleBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      onBrandsChange(selectedBrands.filter(b => b !== brand));
    } else {
      onBrandsChange([...selectedBrands, brand]);
    }
  };

  const toggleGama = (gama: Gama) => {
    if (selectedGamas.includes(gama)) {
      onGamasChange(selectedGamas.filter(g => g !== gama));
    } else {
      onGamasChange([...selectedGamas, gama]);
    }
  };

  const toggleYear = (year: number) => {
    if (selectedYears.includes(year)) {
      onYearsChange(selectedYears.filter(y => y !== year));
    } else {
      onYearsChange([...selectedYears, year]);
    }
  };

  const clearFilters = () => {
    onSearchChange('');
    onBrandsChange([]);
    onGamasChange([]);
    onYearsChange([]);
    onHas5GChange(null);
    onHasNFCChange(null);
  };

  const hasActiveFilters = search || selectedBrands.length > 0 || selectedGamas.length > 0 || 
    selectedYears.length > 0 || has5G !== null || hasNFC !== null;

  return (
    <div className="glass-card p-4 mb-6">
      {/* Search bar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar smartphone..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-secondary/50 border-border/50 focus:border-primary"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? 'border-primary text-primary' : ''}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtros
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
            <X className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Expandable filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-border/50 animate-slide-up">
          {/* Brands */}
          <div>
            <h4 className="text-sm font-medium mb-3 text-foreground">Marca</h4>
            <div className="flex flex-wrap gap-2">
              {brands.map(brand => (
                <button
                  key={brand}
                  onClick={() => toggleBrand(brand)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedBrands.includes(brand)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Gama */}
          <div>
            <h4 className="text-sm font-medium mb-3 text-foreground">Gama</h4>
            <div className="flex flex-wrap gap-2">
              {(['alta', 'media', 'baja'] as Gama[]).map(gama => (
                <button
                  key={gama}
                  onClick={() => toggleGama(gama)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                    selectedGamas.includes(gama)
                      ? gama === 'alta' ? 'badge-gama-alta bg-opacity-100' 
                        : gama === 'media' ? 'badge-gama-media bg-opacity-100'
                        : 'badge-gama-baja bg-opacity-100'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {gama}
                </button>
              ))}
            </div>
          </div>

          {/* Year */}
          <div>
            <h4 className="text-sm font-medium mb-3 text-foreground">Año</h4>
            <div className="flex flex-wrap gap-2">
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => toggleYear(year)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedYears.includes(year)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Connectivity */}
          <div>
            <h4 className="text-sm font-medium mb-3 text-foreground">Conectividad</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="5g" 
                  checked={has5G === true}
                  onCheckedChange={(checked) => onHas5GChange(checked ? true : null)}
                />
                <Label htmlFor="5g" className="text-sm cursor-pointer">Solo 5G</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="nfc" 
                  checked={hasNFC === true}
                  onCheckedChange={(checked) => onHasNFCChange(checked ? true : null)}
                />
                <Label htmlFor="nfc" className="text-sm cursor-pointer">Con NFC</Label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
