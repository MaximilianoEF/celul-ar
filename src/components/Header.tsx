import { Link, useLocation } from 'react-router-dom';
import { Smartphone, BarChart3, Home } from 'lucide-react';

export function Header() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-lg">
            <span className="gradient-text">Celu</span>
            <span className="text-foreground">AR</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/') 
                ? 'bg-primary/10 text-primary' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Inicio</span>
          </Link>
          <Link
            to="/catalogo"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/catalogo') 
                ? 'bg-primary/10 text-primary' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span className="hidden sm:inline">Catálogo</span>
          </Link>
          <Link
            to="/comparar"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/comparar') 
                ? 'bg-primary/10 text-primary' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Comparar</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
