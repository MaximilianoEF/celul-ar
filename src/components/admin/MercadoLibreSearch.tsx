import { useState } from 'react';
import { Search, ExternalLink } from 'lucide-react';

interface MLListing {
  id: string;
  title: string;
  price: number;
  currency_id: string;
  permalink: string;
  condition: string;
  thumbnail: string;
}

interface MLSearchResponse {
  results: MLListing[];
}

interface Props {
  phoneName: string;
  onSelectPrice: (price: number, url: string) => void;
}

export function MercadoLibreSearch({ phoneName, onSelectPrice }: Props) {
  const [results, setResults] = useState<MLListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (!phoneName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // Importamos fetchMLListings que maneja el fallback automáticamente
      const { fetchMLListings } = await import('@/hooks/useLiveMLPrice');
      const listings = await fetchMLListings(phoneName);
      if (listings.length === 0) {
        setError('Sin resultados. Intentá con otro nombre.');
      }
      setResults(
        listings.map(l => ({
          id: l.id,
          title: l.title,
          price: l.price,
          currency_id: 'ARS',
          permalink: l.permalink,
          condition: 'new',
          thumbnail: l.thumbnail,
        }))
      );
      setSearched(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo conectar a Mercado Libre');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-border/50 rounded-lg p-4 bg-secondary/20">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-medium">Referencia de precios — MercadoLibre</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Busca el precio actual en el mercado argentino
          </p>
        </div>
        <button
          type="button"
          onClick={search}
          disabled={loading || !phoneName.trim()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 disabled:opacity-50 transition-colors"
        >
          <Search className="h-3 w-3" />
          {loading ? 'Buscando...' : 'Buscar precios'}
        </button>
      </div>

      {error && (
        <p className="text-xs text-destructive mb-2 bg-destructive/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {searched && results.length === 0 && !error && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Sin resultados para "{phoneName}"
        </p>
      )}

      <div className="space-y-2">
        {results.map(listing => (
          <div
            key={listing.id}
            className="flex items-center gap-3 py-2 px-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
          >
            <img
              src={listing.thumbnail}
              alt=""
              className="h-10 w-10 object-contain rounded shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground truncate leading-tight">{listing.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-semibold text-primary">
                  {new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                    maximumFractionDigits: 0,
                  }).format(listing.price)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {listing.condition === 'new' ? 'Nuevo' : 'Usado'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onSelectPrice(listing.price, listing.permalink)}
                className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
              >
                Usar precio
              </button>
              <a
                href={listing.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                title="Ver en MercadoLibre"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
