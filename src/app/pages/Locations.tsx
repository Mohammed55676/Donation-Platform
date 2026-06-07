import { useState, useMemo } from 'react';
import {
  Search, MapPin, AlertCircle, X, Gift,
  Droplet, Utensils, Armchair, Shirt, Pill, HeartHandshake, Users, LayoutGrid,
  Navigation, Activity, LayoutList, Shield, CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';

// Data
import { mockCenters, DonationType } from '../data/donationCenters';
import { useCampaigns } from '../hooks/useCampaigns';

// Components
import { CenterCard } from '../components/locations/CenterCard';
import { EmptyCentersState } from '../components/locations/EmptyCentersState';
import { CampaignCards } from '../components/locations/CampaignCards';

// ── Category config (matches Donations page) ─────────────────────────────────
const CATEGORIES = [
  { value: 'all' as const,       label: 'الكل',   icon: LayoutGrid,    color: 'text-slate-600 dark:text-slate-300',   bg: 'bg-slate-100 dark:bg-slate-800' },
  { value: 'blood' as const,     label: 'دم',     icon: Droplet,       color: 'text-rose-600 dark:text-rose-400',     bg: 'bg-rose-100 dark:bg-rose-900/30' },
  { value: 'food' as const,      label: 'طعام',   icon: Utensils,      color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { value: 'furniture' as const, label: 'أثاث',   icon: Armchair,      color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  { value: 'clothes' as const,   label: 'ملابس',  icon: Shirt,         color: 'text-sky-600 dark:text-sky-400',       bg: 'bg-sky-100 dark:bg-sky-900/30' },
  { value: 'medicine' as const,  label: 'أدوية',  icon: Pill,          color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/30' },
  { value: 'money' as const,     label: 'مال',    icon: HeartHandshake,color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  { value: 'volunteer' as const, label: 'تطوع',   icon: Users,         color: 'text-teal-600 dark:text-teal-400',     bg: 'bg-teal-100 dark:bg-teal-900/30' },
] as const;

// ── Haversine distance helper ─────────────────────────────────────────────────
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ── Page ─────────────────────────────────────────────────────────────────────
export function Locations() {
  const [selectedType, setSelectedType] = useState<DonationType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('الكل');
  const [deliveryFilter, setDeliveryFilter] = useState('الكل');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState('');

  // Filter centers
  const filteredCenters = useMemo(() => {
    let result = [...mockCenters];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedType !== 'all') {
      result = result.filter(c => c.acceptedTypes.includes(selectedType));
    }

    // City filter
    if (cityFilter !== 'الكل') {
      result = result.filter(c => c.city === cityFilter);
    }

    // Delivery method filter
    if (deliveryFilter !== 'الكل') {
      result = result.filter(c => c.deliveryMethods.includes(deliveryFilter as any));
    }

    // Calculate distance if user location exists
    if (userLocation) {
      result = result.map(c => ({
        ...c,
        distanceKm: getDistanceKm(userLocation[0], userLocation[1], c.lat, c.lng),
      }));
      result.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    return result;
  }, [selectedType, searchQuery, cityFilter, deliveryFilter, userLocation]);

  const { campaigns } = useCampaigns();
  const filteredCampaigns = campaigns.filter(c => c.isActive);

  const hasActiveFilters =
    selectedType !== 'all' || cityFilter !== 'الكل' || deliveryFilter !== 'الكل' || !!searchQuery;

  const resetFilters = () => {
    setSelectedType('all');
    setCityFilter('الكل');
    setDeliveryFilter('الكل');
    setSearchQuery('');
  };

  const handleNearestMe = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('متصفحك لا يدعم تحديد الموقع.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        setLocationError('لم نتمكن من الوصول لموقعك. يمكنك اختيار المحافظة يدويًا.');
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ── Page header — same style as Donations ────────────────── */}
      <div className="border-b border-border/50 bg-card/60 backdrop-blur">
        <div className="container mx-auto px-4 py-7">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-1">أماكن ومراكز التبرع</h1>
              <p className="text-muted-foreground text-sm">
                {`${filteredCenters.length} مركز متاح`}
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                size="lg"
                onClick={handleNearestMe}
                className="h-11 px-7 rounded-xl font-semibold shadow-md shadow-emerald-500/20 bg-[#10B981] hover:bg-[#059669] text-white w-full sm:w-auto"
              >
                <MapPin className="me-2 h-5 w-5" />
                الأقرب إليّ
              </Button>
            </div>
          </div>
          {locationError && (
            <p className="text-rose-500 text-sm mt-3 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> {locationError}
            </p>
          )}
        </div>
      </div>

      {/* ── Sticky filter bar — same style as Donations ─────────── */}
      <div className="sticky top-[64px] md:top-[72px] z-20 bg-background/95 backdrop-blur border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-3 space-y-2.5">

          {/* Search + dropdowns */}
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[180px] max-w-sm">
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="ابحث عن مركز، محافظة، أو نوع تبرع..."
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
                <SelectItem value="عمان">عمان</SelectItem>
                <SelectItem value="إربد">إربد</SelectItem>
                <SelectItem value="الزرقاء">الزرقاء</SelectItem>
                <SelectItem value="العقبة">العقبة</SelectItem>
                <SelectItem value="الكرك">الكرك</SelectItem>
              </SelectContent>
            </Select>
            <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
              <SelectTrigger className="rounded-xl h-9 w-[140px] text-sm">
                <SelectValue placeholder="طريقة التسليم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="الكل">كل الطرق</SelectItem>
                <SelectItem value="self_delivery">أوصلها بنفسي</SelectItem>
                <SelectItem value="home_pickup">استلام منزلي</SelectItem>
                <SelectItem value="online">تبرع أونلاين</SelectItem>
                <SelectItem value="mobile_campaign">حملة متنقلة</SelectItem>
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

      {/* ── Grid — same layout as Donations ──────────────────────── */}
      <div className="container mx-auto px-4 py-8">
        {filteredCenters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCenters.map(center => (
              <CenterCard key={center.id} center={center} />
            ))}
          </div>
        ) : (
          <EmptyCentersState onReset={resetFilters} />
        )}
      </div>

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

      {/* ── Trust section — simplified ────────────────────────────── */}
      <section className="py-16 bg-background border-t border-border/40">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 dark:bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-2">
              <Shield className="h-3 w-3" />
              معايير الأمان والثقة
            </div>
            <h3 className="text-xl md:text-2xl font-extrabold text-foreground">
              لماذا تثق بمنصة الخير؟
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: CheckCircle2, title: 'جهات موثقة',    desc: 'مراكز معتمدة رسمياً' },
              { icon: MapPin,       title: 'تتبع التبرعات', desc: 'متابعة خطوة بخطوة' },
              { icon: LayoutList,   title: 'تقارير شهرية', desc: 'شفافية كاملة' },
              { icon: Shield,       title: 'حماية بياناتك', desc: 'تشفير آمن' },
            ].map((item, i) => (
              <div key={i} className="bg-card p-5 rounded-xl border border-border/60 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h5 className="font-bold text-sm text-foreground mb-0.5">{item.title}</h5>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
