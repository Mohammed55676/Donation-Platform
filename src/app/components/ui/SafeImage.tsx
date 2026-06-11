import { useState } from 'react';
import { Shirt, Utensils, Armchair, BookOpen, Pill, Package, Users, Target } from 'lucide-react';

const CATEGORY_FALLBACKS: Record<string, { icon: any; bg: string; color: string }> = {
  'ملابس': { icon: Shirt, bg: 'bg-sky-100 dark:bg-sky-900/30', color: 'text-sky-600 dark:text-sky-400' },
  'طعام': { icon: Utensils, bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
  'أثاث': { icon: Armchair, bg: 'bg-orange-100 dark:bg-orange-900/30', color: 'text-orange-600 dark:text-orange-400' },
  'كتب': { icon: BookOpen, bg: 'bg-violet-100 dark:bg-violet-900/30', color: 'text-violet-600 dark:text-violet-400' },
  'مستلزمات طبية': { icon: Pill, bg: 'bg-rose-100 dark:bg-rose-900/30', color: 'text-rose-600 dark:text-rose-400' },
  'فرص تطوع': { icon: Users, bg: 'bg-indigo-100 dark:bg-indigo-900/30', color: 'text-indigo-600 dark:text-indigo-400' },
  'حملات': { icon: Target, bg: 'bg-primary/10', color: 'text-primary' },
  'أخرى': { icon: Package, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
};

interface SafeImageProps {
  src?: string | null;
  alt: string;
  category?: string;
  className?: string;
}

export function SafeImage({ src, alt, category = 'أخرى', className = "w-full h-full object-cover" }: SafeImageProps) {
  const [error, setError] = useState(false);
  const fallback = CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS['أخرى'];
  const Icon = fallback.icon;

  if (!src || error) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${fallback.bg} ${className}`}>
        <Icon className={`h-14 w-14 ${fallback.color} opacity-40`} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setError(true)}
    />
  );
}
