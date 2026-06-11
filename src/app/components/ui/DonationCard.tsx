import { Link } from 'react-router';
import { MapPin, Heart, Shirt, Utensils, Armchair, BookOpen, Pill, Package } from 'lucide-react';
import { SafeImage } from './SafeImage';

export const CATEGORIES_MAP = [
  { value: 'ملابس', icon: Shirt, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-100 dark:bg-sky-900/30' },
  { value: 'طعام', icon: Utensils, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { value: 'أثاث', icon: Armchair, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  { value: 'كتب', icon: BookOpen, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/30' },
  { value: 'مستلزمات طبية', icon: Pill, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  { value: 'أخرى', icon: Package, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
];

export const getCategoryConfig = (category: string) => CATEGORIES_MAP.find(c => c.value === category) || CATEGORIES_MAP[CATEGORIES_MAP.length - 1];

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  'متاح': { label: 'متاح', className: 'bg-emerald-500/90 text-white' },
  'محجوز': { label: 'محجوز', className: 'bg-amber-500/90 text-white' },
  'تم التسليم': { label: 'تم التسليم', className: 'bg-slate-500/80 text-white' },
  'قيد المراجعة': { label: 'قيد المراجعة', className: 'bg-blue-500/90 text-white' },
};

const CONDITION_CONFIG: Record<string, { label: string; className: string }> = {
  'جديد': { label: 'جديد', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' },
  'جيد جداً': { label: 'جيد جداً', className: 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800' },
  'جيد': { label: 'جيد', className: 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800' },
  'مستعمل': { label: 'مستعمل', className: 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' },
};

const URGENCY_DOT: Record<string, string> = {
  'عالية': 'bg-red-500',
  'متوسطة': 'bg-amber-400',
  'منخفضة': 'bg-emerald-500',
};

export function DonationCard({ donation, user, toggleWishlist, onWishlistClick }: { donation: any, user: any, toggleWishlist: any, onWishlistClick?: () => void }) {
  const catCfg = getCategoryConfig(donation.category);
  const statusCfg = STATUS_CONFIG[donation.status] || { label: donation.status, className: 'bg-muted/80 text-muted-foreground' };
  const condCfg = donation.condition ? (CONDITION_CONFIG[donation.condition] || { label: donation.condition, className: 'bg-muted text-muted-foreground border border-border' }) : null;
  const isWishlisted = user?.wishlist?.includes(donation.id);
  const urgencyDot = donation.urgency ? URGENCY_DOT[donation.urgency] : null;

  return (
    <Link to={`/donations/${donation.id}`} className="group block cursor-pointer h-full">
      <article className="rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/25 transition-all duration-300 flex flex-col h-full">
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-muted flex-shrink-0">
          <SafeImage src={donation.image} alt={donation.title} category={donation.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Status badge */}
          <div className="absolute bottom-3 start-3">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${statusCfg.className}`}>
              {statusCfg.label}
            </span>
          </div>

          {/* Urgency dot */}
          {urgencyDot && (
            <div className="absolute top-3 start-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
              <span className={`h-2 w-2 rounded-full ${urgencyDot} flex-shrink-0`} />
              <span className="text-[10px] text-white font-medium">{donation.urgency}</span>
            </div>
          )}

          {/* Wishlist */}
          <button
            aria-label={isWishlisted ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            className={`absolute top-2 end-2 h-9 w-9 rounded-full flex items-center justify-center bg-white/90 dark:bg-black/60 shadow-md backdrop-blur-sm transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${isWishlisted ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              if (onWishlistClick) onWishlistClick();
              else toggleWishlist(donation.id);
            }}
          >
            <Heart className={`h-4 w-4 transition-transform duration-200 ${isWishlisted ? 'fill-current scale-110' : ''}`} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-4 gap-2">
          {/* Category + Condition */}
          <div className="flex flex-wrap gap-1.5">
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${catCfg.bg} ${catCfg.color}`}>
              <catCfg.icon className="h-3 w-3" />
              {donation.category}
            </span>
            {condCfg && (
              <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${condCfg.className}`}>
                {condCfg.label}
              </span>
            )}
          </div>

          <h3 className="font-bold text-sm leading-snug line-clamp-1 group-hover:text-primary transition-colors duration-200">
            {donation.title}
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {donation.description}
          </p>

          {/* Footer */}
          <div className="mt-auto pt-3 border-t border-border/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="truncate">{donation.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <img src={donation.donor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(donation.donor?.name || 'مجهول')}&background=7c3aed&color=fff&size=56&bold=true`} alt={donation.donor?.name || 'مجهول'} className="w-7 h-7 rounded-full object-cover ring-2 ring-background flex-shrink-0" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(donation.donor?.name || 'مجهول')}&background=7c3aed&color=fff&size=56&bold=true`; }} />
              <span className="text-xs text-muted-foreground font-medium truncate">
                {donation.donor?.name || 'مجهول'}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
