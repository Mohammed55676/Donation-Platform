import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import {
  MapPin, Search, Gift, Heart, X,
  Shirt, Utensils, Armchair, BookOpen, Pill, Package, LayoutGrid,
} from 'lucide-react';
import { useDonations } from '../context/DonationContext';
import { useAuth } from '../context/AuthContext';
import { DonationCard } from '../components/ui/DonationCard';

// ── Category config ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'الكل',           label: 'الكل',   icon: LayoutGrid, color: 'text-slate-600 dark:text-slate-300',   bg: 'bg-slate-100 dark:bg-slate-800' },
  { value: 'ملابس',          label: 'ملابس',  icon: Shirt,      color: 'text-sky-600 dark:text-sky-400',        bg: 'bg-sky-100 dark:bg-sky-900/30' },
  { value: 'طعام',           label: 'طعام',   icon: Utensils,   color: 'text-amber-600 dark:text-amber-400',    bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { value: 'أثاث',           label: 'أثاث',   icon: Armchair,   color: 'text-orange-600 dark:text-orange-400',  bg: 'bg-orange-100 dark:bg-orange-900/30' },
  { value: 'كتب',            label: 'كتب',    icon: BookOpen,   color: 'text-violet-600 dark:text-violet-400',  bg: 'bg-violet-100 dark:bg-violet-900/30' },
  { value: 'مستلزمات طبية', label: 'طبية',   icon: Pill,       color: 'text-rose-600 dark:text-rose-400',      bg: 'bg-rose-100 dark:bg-rose-900/30' },
  { value: 'أخرى',           label: 'أخرى',   icon: Package,    color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
] as const;

const getCategoryConfig = (category: string) =>
  CATEGORIES.find(c => c.value === category) ?? CATEGORIES[CATEGORIES.length - 1];

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  'متاح':       { label: 'متاح',       className: 'bg-emerald-500/90 text-white' },
  'محجوز':      { label: 'محجوز',      className: 'bg-amber-500/90 text-white' },
  'تم التسليم': { label: 'تم التسليم', className: 'bg-slate-500/80 text-white' },
};

const CONDITION_CONFIG: Record<string, { label: string; className: string }> = {
  'جديد':   { label: 'جديد',   className: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' },
  'جيد':    { label: 'جيد',    className: 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800' },
  'مستعمل': { label: 'مستعمل', className: 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' },
};

const URGENCY_DOT: Record<string, string> = {
  'عالية':    'bg-red-500',
  'متوسطة':  'bg-amber-400',
  'منخفضة':  'bg-emerald-500',
};

// ── DonationImage ──────────────────────────────────────────────────────────────
function DonationImage({ src, alt, category }: { src?: string; alt: string; category: string }) {
  const [error, setError] = useState(false);
  const cfg = getCategoryConfig(category);
  const Icon = cfg.icon;

  if (!src || error) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${cfg.bg}`}>
        <Icon className={`h-14 w-14 ${cfg.color} opacity-25`} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      onError={() => setError(true)}
    />
  );
}

// ── DonorAvatar ────────────────────────────────────────────────────────────────
function DonorAvatar({ donor }: { donor: any }) {
  const name = donor?.name || 'مجهول';
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&size=56&bold=true`;
  const [src, setSrc] = useState<string>(donor?.avatar || fallback);

  return (
    <img
      src={src}
      alt={name}
      className="w-7 h-7 rounded-full object-cover ring-2 ring-background flex-shrink-0"
      onError={() => setSrc(fallback)}
    />
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export function Donations() {
  const { user, toggleWishlist } = useAuth();
  const { donations, loading } = useDonations();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [categoryFilter, setCategoryFilter]   = useState('الكل');
  const [urgencyFilter,  setUrgencyFilter]    = useState('الكل');
  const [conditionFilter, setConditionFilter] = useState('الكل');
  const [searchQuery, setSearchQuery]         = useState('');

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setCategoryFilter(cat);
  }, [searchParams]);

  const filteredDonations = useMemo(() => {
    let result = donations.filter(
      d => d.status === 'متاح' || d.status === 'محجوز' || d.status === 'تم التسليم',
    );
    if (categoryFilter !== 'الكل')  result = result.filter(d => d.category  === categoryFilter);
    if (urgencyFilter  !== 'الكل')  result = result.filter(d => d.urgency   === urgencyFilter);
    if (conditionFilter !== 'الكل') result = result.filter(d => d.condition === conditionFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        d =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q),
      );
    }
    return result;
  }, [donations, categoryFilter, urgencyFilter, conditionFilter, searchQuery]);

  const hasActiveFilters =
    categoryFilter !== 'الكل' || urgencyFilter !== 'الكل' || conditionFilter !== 'الكل' || !!searchQuery;

  const resetFilters = () => {
    setCategoryFilter('الكل');
    setUrgencyFilter('الكل');
    setConditionFilter('الكل');
    setSearchQuery('');
  };

  const availableCount = useMemo(
    () => donations.filter(d => d.status === 'متاح').length,
    [donations],
  );

  return (
    <div className="min-h-screen bg-background">

      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-border/50">
        {/* gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-violet-500/5 pointer-events-none" />
        <div className="relative container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Gift className="h-4 w-4 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">التبرعات</h1>
              </div>
              <p className="text-muted-foreground text-sm">
                {loading ? (
                  <Skeleton className="h-4 w-32 inline-block" />
                ) : (
                  <>
                    <span className="font-semibold text-primary">{availableCount}</span>
                    {' '}تبرع متاح الآن
                    {hasActiveFilters && filteredDonations.length !== availableCount && (
                      <span className="text-muted-foreground/70"> · {filteredDonations.length} نتيجة</span>
                    )}
                  </>
                )}
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => navigate(user ? '/add-donation' : '/login')}
              className="h-11 px-7 rounded-xl font-semibold shadow-md shadow-primary/25 w-full sm:w-auto cursor-pointer"
            >
              <Gift className="me-2 h-5 w-5" />
              تبرع الآن
            </Button>
          </div>
        </div>
      </div>

      {/* ── Sticky filter bar ──────────────────────────────────────── */}
      <div className="sticky top-[64px] md:top-[72px] z-20 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-3 space-y-2.5">

          {/* Search + dropdowns */}
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[180px] max-w-sm">
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="ابحث في التبرعات..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pe-10 rounded-xl h-9 text-sm"
              />
            </div>

            {/* Priority select — no emoji, use colored dots */}
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="rounded-xl h-9 w-[140px] text-sm cursor-pointer">
                <SelectValue placeholder="الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="الكل">كل الأولويات</SelectItem>
                <SelectItem value="عالية">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 inline-block flex-shrink-0" />
                    عالية
                  </span>
                </SelectItem>
                <SelectItem value="متوسطة">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400 inline-block flex-shrink-0" />
                    متوسطة
                  </span>
                </SelectItem>
                <SelectItem value="منخفضة">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block flex-shrink-0" />
                    منخفضة
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={conditionFilter} onValueChange={setConditionFilter}>
              <SelectTrigger className="rounded-xl h-9 w-[120px] text-sm cursor-pointer">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="الكل">كل الحالات</SelectItem>
                <SelectItem value="جديد">جديد</SelectItem>
                <SelectItem value="جيد">جيد</SelectItem>
                <SelectItem value="مستعمل">مستعمل</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-9 px-3 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 text-sm cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                مسح
              </Button>
            )}
          </div>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide snap-x">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const active = categoryFilter === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`snap-center flex-shrink-0 flex items-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                    active
                      ? 'bg-primary text-primary-foreground border-transparent shadow-md shadow-primary/25 scale-[1.03]'
                      : 'bg-card border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-border/50 bg-card">
                <Skeleton className="h-52 w-full" />
                <div className="p-4 space-y-3">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-10 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredDonations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredDonations.map(donation => (
              <DonationCard
                key={donation.id}
                donation={donation}
                user={user}
                toggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        ) : (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="relative mb-6">
              {/* outer ring */}
              <div className="h-28 w-28 rounded-3xl bg-primary/5 flex items-center justify-center">
                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Gift className="h-9 w-9 text-primary/40" />
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-2 text-foreground">
              {hasActiveFilters ? 'لا توجد نتائج مطابقة' : 'لا توجد تبرعات حالياً'}
            </h3>
            <p className="text-muted-foreground text-sm mb-7 max-w-xs leading-relaxed">
              {hasActiveFilters
                ? 'جرب تغيير معايير البحث أو مسح الفلاتر للاطلاع على كل التبرعات'
                : 'كن أول من يضيف تبرعاً ويساعد من يحتاج'}
            </p>
            {hasActiveFilters ? (
              <Button
                variant="outline"
                className="rounded-xl font-semibold cursor-pointer"
                onClick={resetFilters}
              >
                <X className="me-2 h-4 w-4" />
                مسح الفلاتر
              </Button>
            ) : (
              <Button
                className="rounded-xl font-semibold shadow-md shadow-primary/20 cursor-pointer"
                onClick={() => navigate(user ? '/add-donation' : '/login')}
              >
                <Gift className="me-2 h-4 w-4" />
                أضف تبرعاً
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
