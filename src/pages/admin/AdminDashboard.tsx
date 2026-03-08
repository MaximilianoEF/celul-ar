import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, LogOut, Smartphone } from 'lucide-react';
import { usePhones, useDeletePhone } from '@/hooks/usePhones';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, getMinPrice } from '@/data/smartphones';

export default function AdminDashboard() {
  const { data: phones = [], isLoading } = usePhones();
  const deletePhone = useDeletePhone();
  const { user, signOut } = useAuth();

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    deletePhone.mutate(id);
  };

  const stats = {
    total: phones.length,
    alta: phones.filter(p => p.gama === 'alta').length,
    media: phones.filter(p => p.gama === 'media').length,
    baja: phones.filter(p => p.gama === 'baja').length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-lg font-bold gradient-text">CeluAR</Link>
            <span className="text-muted-foreground/50">|</span>
            <span className="text-sm font-medium text-muted-foreground">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground hidden sm:block">{user?.email}</span>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'text-foreground' },
            { label: 'Gama Alta', value: stats.alta, color: 'text-gama-alta' },
            { label: 'Gama Media', value: stats.media, color: 'text-gama-media' },
            { label: 'Gama Baja', value: stats.baja, color: 'text-gama-baja' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card p-4">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{isLoading ? '—' : value}</p>
            </div>
          ))}
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Catálogo de teléfonos
          </h2>
          <Link
            to="/admin/phones/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:brightness-110 transition-all"
          >
            <Plus className="h-4 w-4" />
            Agregar teléfono
          </Link>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="glass-card p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Cargando catálogo...</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Nombre</th>
                    <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Marca</th>
                    <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Año</th>
                    <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Gama</th>
                    <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Precio mín.</th>
                    <th className="p-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {phones.map(phone => (
                    <tr key={phone.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-foreground text-sm">{phone.name}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">{phone.brand} · {phone.year}</p>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{phone.brand}</td>
                      <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{phone.year}</td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className={
                          phone.gama === 'alta' ? 'badge-gama-alta' :
                          phone.gama === 'media' ? 'badge-gama-media' :
                          'badge-gama-baja'
                        }>
                          {phone.gama}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-medium text-foreground hidden lg:table-cell">
                        {formatPrice(getMinPrice(phone))}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/phones/${phone.id}/edit`}
                            className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4 text-foreground" />
                          </Link>
                          <button
                            onClick={() => handleDelete(phone.id, phone.name)}
                            disabled={deletePhone.isPending}
                            className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-50 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {phones.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">No hay teléfonos en el catálogo.</p>
                <Link
                  to="/admin/phones/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Agregar el primero
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
