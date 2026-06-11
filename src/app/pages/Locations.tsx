import { useState, useMemo } from 'react';
import {
  Search, MapPin, AlertCircle, X, Gift,
  Droplet, Utensils, Armchair, Shirt, Pill, HeartHandshake, Users, LayoutGrid,
  Navigation, Activity, LayoutList, Shield, CheckCircle2, BookOpen
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

// Data
import { useDonationCenters } from '../hooks/useDonationCenters';
import { DonationCenter } from '../data/donationCenters';
import { useCampaigns } from '../hooks/useCampaigns';

// Components
import { CenterCard } from '../components/locations/CenterCard';
import { EmptyCentersState } from '../components/locations/EmptyCentersState';
import { CampaignCards } from '../components/locations/CampaignCards';
import { CenterDetailsModal } from '../components/locations/CenterDetailsModal';

// ── Category config ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'الكل', label: 'الكل', icon: LayoutGrid, color: 'text-slate-600', bg: 'bg-slate-100' },
  { value: 'ملابس', label: 'ملابس', icon: Shirt, color: 'text-sky-600', bg: 'bg-sky-100' },
  { value: 'أثاث', label: 'أثاث', icon: Armchair, color: 'text-orange-600', bg: 'bg-orange-100' },
  { value: 'أجهزة كهربائية', label: 'أجهزة', icon: Utensils, color: 'text-amber-600', bg: 'bg-amber-100' },
  { value: 'ألعاب', label: 'ألعاب', icon: Gift, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { value: 'كتب', label: 'كتب', icon: BookOpen, color: 'text-violet-600', bg: 'bg-violet-100' },
  { value: 'منسوجات', label: 'منسوجات', icon: HeartHandshake, color: 'text-emerald-600', bg: 'bg-emerald-100' },
] as const;

// ── Page ─────────────────────────────────────────────────────────────────────
export function Locations() {
  const { centers } = useDonationCenters();
  const [selectedType, setSelectedType] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('الكل');
  const [pickupFilter, setPickupFilter] = useState('الكل');
  
  const [selectedCenter, setSelectedCenter] = useState<DonationCenter | null>(null);

  // Filter centers
  const filteredCenters = useMemo(() => {
    let result = centers.filter(c => c.isActive);

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.cities.some(city => city.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedType !== 'الكل') {
      result = result.filter(c => c.category.includes(selectedType));
    }

    // City filter
    if (cityFilter !== 'الكل') {
      result = result.filter(c => c.cities.includes(cityFilter) || c.cities.includes('المحافظات الأخرى'));
    }

    // Pickup method filter
    if (pickupFilter === 'yes') {
      result = result.filter(c => c.pickupAvailable);
    } else if (pickupFilter === 'no') {
      result = result.filter(c => !c.pickupAvailable);
    }

    return result;
  }, [centers, selectedType, searchQuery, cityFilter, pickupFilter]);

  const { campaigns } = useCampaigns();
  const filteredCampaigns = campaigns.filter(c => c.isActive);

  const hasActiveFilters =
    selectedType !== 'الكل' || cityFilter !== 'الكل' || pickupFilter !== 'الكل' || !!searchQuery;

  const resetFilters = () => {
    setSelectedType('الكل');
    setCityFilter('الكل');
    setPickupFilter('الكل');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ── Page header ────────────────── */}
      <div className="border-b border-border/50 bg-card/60 backdrop-blur">
        <div className="container mx-auto px-4 py-7">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-1">أماكن ومراكز التبرع</h1>
              <p className="text-muted-foreground text-sm">
                {`${filteredCenters.length} جهة متاحة`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky filter bar ─────────── */}
      <div className="sticky top-[64px] md:top-[72px] z-20 bg-background/95 backdrop-blur border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-3 space-y-2.5">

          {/* Search + dropdowns */}
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[180px] max-w-sm">
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="ابحث عن جهة، محافظة..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pe-10 rounded-xl h-9 text-sm"
              />
            </div>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="rounded-xl h-9 w-[130px] text-sm">
                <SelectValue placeholder="المحافظة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="الكل">كل المحافظات</SelectItem>
                <SelectItem value="عمّان">عمّان</SelectItem>
                <SelectItem value="إربد">إربد</SelectItem>
                <SelectItem value="الزرقاء">الزرقاء</SelectItem>
                <SelectItem value="جرش">جرش</SelectItem>
              </SelectContent>
            </Select>
            <Select value={pickupFilter} onValueChange={setPickupFilter}>
              <SelectTrigger className="rounded-xl h-9 w-[150px] text-sm">
                <SelectValue placeholder="خدمة الاستلام" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="الكل">الكل</SelectItem>
                <SelectItem value="yes">يتوفر استلام منزلي</SelectItem>
                <SelectItem value="no">تسليم في المركز فقط</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-9 px-3 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 text-sm"
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
              const active = selectedType === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedType(cat.value)}
                  className={`snap-center flex-shrink-0 flex items-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                    active
                      ? 'bg-primary text-primary-foreground border-transparent shadow-sm'
                      : 'bg-card border-border/60 text-muted-foreground hover:border-border hover:text-foreground'
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

      {/* ── Grid ──────────────────────── */}
      <div className="container mx-auto px-4 py-8">
        {filteredCenters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCenters.map(center => (
              <CenterCard key={center.id} center={center} onClick={() => setSelectedCenter(center)} />
            ))}
          </div>
        ) : (
          <EmptyCentersState onReset={resetFilters} />
        )}
      </div>

      <CenterDetailsModal 
        isOpen={!!selectedCenter} 
        onClose={() => setSelectedCenter(null)} 
        center={selectedCenter} 
      />

      {/* ── Campaigns section (small, at bottom) ────────────────── */}
      {filteredCampaigns.length > 0 && (
        <section className="border-t border-border/50 bg-card/40">
          <div className="container mx-auto px-4 py-12">
            <CampaignCards campaigns={filteredCampaigns} />
          </div>
        </section>
      )}

      {/* ── How It Works — simplified ─────────────────────────────── */}
      <section className="py-16 bg-card/60 border-t border-border/50">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-2xl font-bold mb-10 text-foreground">كيف تسلّم تبرعك؟</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-6 start-1/8 end-1/8 h-0.5 bg-border/50 z-0" />

            {[
              { icon: LayoutList,  title: 'اختر نوع التبرع', desc: 'حدد ماذا تريد التبرع به' },
              { icon: Search,     title: 'ابحث عن جهة',    desc: 'استخدم الفلاتر لإيجاد أقرب مركز' },
              { icon: Navigation, title: 'تواصل أو احجز',  desc: 'تواصل معهم أو احجز استلام' },
              { icon: Activity,   title: 'تابع تبرعك',     desc: 'تابع الحالة من لوحة التحكم' },
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-[#059669] text-white flex items-center justify-center shadow-md mb-3">
                  <step.icon className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-sm mb-1 text-foreground">{step.title}</h4>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
                <div className="w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-bold mt-2">
                  {i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
