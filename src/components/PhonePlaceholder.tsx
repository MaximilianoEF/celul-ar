import { Smartphone } from 'lucide-react';

interface PhonePlaceholderProps {
  brand: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PhonePlaceholder({ brand, name, size = 'md' }: PhonePlaceholderProps) {
  const sizeClasses = {
    sm: 'h-32 w-24',
    md: 'h-48 w-36',
    lg: 'h-72 w-52'
  };

  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Colores por marca
  const brandColors: Record<string, { bg: string; accent: string }> = {
    Samsung: { bg: 'from-blue-900/30 to-blue-950/50', accent: 'text-blue-400' },
    Apple: { bg: 'from-gray-800/30 to-gray-900/50', accent: 'text-gray-300' },
    Xiaomi: { bg: 'from-orange-900/30 to-orange-950/50', accent: 'text-orange-400' },
    Motorola: { bg: 'from-cyan-900/30 to-cyan-950/50', accent: 'text-cyan-400' },
    Honor: { bg: 'from-indigo-900/30 to-indigo-950/50', accent: 'text-indigo-400' },
    Oppo: { bg: 'from-green-900/30 to-green-950/50', accent: 'text-green-400' },
    Infinix: { bg: 'from-purple-900/30 to-purple-950/50', accent: 'text-purple-400' },
    TCL: { bg: 'from-red-900/30 to-red-950/50', accent: 'text-red-400' },
    Vivo: { bg: 'from-sky-900/30 to-sky-950/50', accent: 'text-sky-400' },
    ZTE: { bg: 'from-emerald-900/30 to-emerald-950/50', accent: 'text-emerald-400' },
    Huawei: { bg: 'from-rose-900/30 to-rose-950/50', accent: 'text-rose-400' },
    Lenovo: { bg: 'from-red-900/30 to-red-950/50', accent: 'text-red-400' },
  };

  const colors = brandColors[brand] || { bg: 'from-primary/20 to-primary/5', accent: 'text-primary' };

  // Limpiar el nombre quitando la marca
  const cleanName = name.replace(brand, '').trim();

  return (
    <div className={`${sizeClasses[size]} flex flex-col items-center justify-center rounded-3xl bg-gradient-to-b ${colors.bg} border border-white/5 backdrop-blur-sm`}>
      <Smartphone className={`${iconSizes[size]} ${colors.accent} mb-2 opacity-60`} />
      <span className={`${textSizes[size]} font-medium ${colors.accent} text-center px-2`}>
        {brand}
      </span>
      <span className={`${textSizes[size]} text-muted-foreground text-center px-2 line-clamp-2`}>
        {cleanName}
      </span>
    </div>
  );
}
