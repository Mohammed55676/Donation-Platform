import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, AlertCircle, LayoutList, Map as MapIcon, CheckCircle2, Navigation, Activity } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

// Data
import { mockCenters, mockCampaigns, DonationType, DonationCenter } from '../data/donationCenters';

// Components
import { DonationTypeFilters } from '../components/locations/DonationTypeFilters';
import { CampaignCards } from '../components/locations/CampaignCards';
import { CenterFilters, FiltersState } from '../components/locations/CenterFilters';
import { CenterCard } from '../components/locations/CenterCard';
import { CentersMap } from '../components/locations/CentersMap';
import { EmptyCentersState } from '../components/locations/EmptyCentersState';

// Helper: Haversine distance in KM
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in km
}

export function Locations() {
  const [selectedType, setSelectedType] = useState<DonationType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState('');
  
  const initialFilters: FiltersState = { city: 'all', deliveryMethod: 'all', centerType: 'all', status: 'all' };
  const [filters, setFilters] = useState<FiltersState>(initialFilters);
  
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);

  // Filter Campaigns based on selectedType
  const filteredCampaigns = useMemo(() => {
    if (selectedType === 'all') return mockCampaigns;
    return mockCampaigns.filter(c => c.type === selectedType);
  }, [selectedType]);

  // Filter Centers based on all criteria
  const filteredCenters = useMemo(() => {
    let result = [...mockCenters];

    // 1. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.city.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
      );
    }

    // 2. Donation Type Chip
    if (selectedType !== 'all') {
      result = result.filter(c => c.acceptedTypes.includes(selectedType));
    }

    // 3. Sidebar Filters
    if (filters.city !== 'all') {
      result = result.filter(c => c.city === filters.city);
    }
    
    if (filters.deliveryMethod !== 'all') {
      result = result.filter(c => c.deliveryMethods.includes(filters.deliveryMethod as any));
    }

    if (filters.centerType !== 'all') {
      result = result.filter(c => c.centerType === filters.centerType);
    }

    if (filters.status !== 'all') {
      if (filters.status === 'open_now') result = result.filter(c => c.isOpen);
      if (filters.status === 'urgent') result = result.filter(c => c.isUrgent);
      if (filters.status === 'requires_appointment') result = result.filter(c => c.requiresAppointment);
    }

    // 4. Calculate Distance if user location exists
    if (userLocation) {
      result = result.map(c => ({
        ...c,
        distanceKm: getDistanceFromLatLonInKm(userLocation[0], userLocation[1], c.lat, c.lng)
      }));
      // Sort by distance
      result.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    return result;
  }, [selectedType, searchQuery, filters, userLocation]);

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

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setSelectedType('all');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F1623]" dir="rtl">
      
      {/* ── Hero Section ── */}
      <section className="bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-none">بيانات تجريبية للعرض</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#0F172A] dark:text-white">أماكن ومراكز التبرع</h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
            ابحث عن أقرب جهة مناسبة حسب نوع تبرعك، وتواصل معها أو احجز استلاماً من المنزل.
          </p>
          
          <div className="relative max-w-3xl mx-auto flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <Input 
                type="text"
                placeholder="ابحث عن محافظة، مركز، أو نوع تبرع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-12 h-14 rounded-full border-slate-200 dark:border-slate-700 shadow-sm text-base bg-white dark:bg-[#1A2332]/60 dark:text-white focus-visible:ring-primary/20"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleNearestMe} className="h-14 px-6 rounded-full bg-[#10B981] hover:bg-[#059669] text-white shadow-md">
                <MapPin className="me-2 h-5 w-5" /> الأقرب إليّ
              </Button>
            </div>
          </div>
          
          {locationError && (
            <p className="text-rose-500 text-sm mt-3 flex items-center justify-center gap-1">
              <AlertCircle className="h-4 w-4" /> {locationError}
            </p>
          )}
        </div>
      </section>

      {/* ── Donation Type Chips (Sticky) ── */}
      <DonationTypeFilters selectedType={selectedType} onSelectType={setSelectedType} />

      <div className="container mx-auto px-4 py-12">
        
        {/* ── Featured Campaigns ── */}
        <section className="mb-16">
          <CampaignCards campaigns={filteredCampaigns} />
        </section>

        {/* ── Filters & Results Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Filters (Desktop) */}
          <div className="hidden lg:block lg:col-span-3">
            <CenterFilters 
              filters={filters} 
              onChange={setFilters} 
              onReset={() => setFilters(initialFilters)} 
              resultCount={filteredCenters.length}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            
            {/* Mobile Tabs */}
            <div className="lg:hidden mb-6">
              <Tabs defaultValue="list" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <TabsTrigger value="list" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[#1A2332] data-[state=active]:shadow-sm"><LayoutList className="me-2 h-4 w-4" /> القائمة</TabsTrigger>
                  <TabsTrigger value="map" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[#1A2332] data-[state=active]:shadow-sm"><MapIcon className="me-2 h-4 w-4" /> الخريطة</TabsTrigger>
                </TabsList>
                
                {/* Mobile Filters Trigger (Optional enhancement for real mobile UI) */}
                <div className="mt-4">
                   {/* We render filters directly for simplicity in this artifact, but a Drawer is better */}
                   <CenterFilters 
                    filters={filters} 
                    onChange={setFilters} 
                    onReset={() => setFilters(initialFilters)} 
                    resultCount={filteredCenters.length}
                  />
                </div>

                <TabsContent value="list" className="mt-6">
                  {filteredCenters.length === 0 ? (
                    <EmptyCentersState onReset={handleResetFilters} />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredCenters.map(center => (
                        <CenterCard 
                          key={center.id} 
                          center={center} 
                          isSelected={selectedCenterId === center.id}
                          onClick={() => setSelectedCenterId(center.id)}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="map" className="mt-6 h-[500px]">
                  <CentersMap 
                    centers={filteredCenters} 
                    selectedCenterId={selectedCenterId} 
                    onSelectCenter={setSelectedCenterId}
                    userLocation={userLocation}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Desktop Grid (List + Map) */}
            <div className="hidden lg:grid grid-cols-12 gap-6 h-[800px]">
              
              {/* List */}
              <div className="col-span-5 flex flex-col h-full bg-white dark:bg-[#1A2332]/60 rounded-3xl border border-border/50 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border/50 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-foreground">المراكز المتاحة</h3>
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md font-medium">{filteredCenters.length} نتيجة</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
                  {filteredCenters.length === 0 ? (
                    <EmptyCentersState onReset={handleResetFilters} />
                  ) : (
                    filteredCenters.map(center => (
                      <CenterCard 
                        key={center.id} 
                        center={center} 
                        isSelected={selectedCenterId === center.id}
                        onClick={() => setSelectedCenterId(center.id)}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Map */}
              <div className="col-span-7 h-full">
                <CentersMap 
                  centers={filteredCenters} 
                  selectedCenterId={selectedCenterId} 
                  onSelectCenter={setSelectedCenterId}
                  userLocation={userLocation}
                />
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* ── How It Works Section ── */}
      <section className="py-20 bg-white dark:bg-[#1A2332]/40 border-y border-border/50 mt-12">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h2 className="text-3xl font-bold mb-12 text-foreground">كيف تسلّم تبرعك؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 start-1/8 end-1/8 h-0.5 bg-slate-100 dark:bg-slate-800 z-0" />
            
            {[
              { icon: LayoutList, title: 'اختر نوع التبرع', desc: 'حدد ماذا تريد التبرع به من الأعلى' },
              { icon: Search, title: 'ابحث عن جهة', desc: 'استخدم الفلاتر والخريطة لإيجاد أقرب مركز' },
              { icon: Navigation, title: 'تواصل أو احجز', desc: 'تواصل معهم أو احجز استلام من المنزل' },
              { icon: Activity, title: 'تابع تبرعك', desc: 'تابع حالة التبرع من خلال لوحة التحكم' },
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-[#059669] text-white flex items-center justify-center shadow-lg mb-4">
                  <step.icon className="h-7 w-7" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-foreground">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-xs font-bold mt-4">
                  {i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Section ── */}
      <section className="py-20 bg-[#F8FAFC] dark:bg-[#0F1623] border-t border-border/40">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 dark:bg-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-3">
              <Shield className="h-3.5 w-3.5" />
              معايير الأمان والثقة
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">
              لماذا تثق بمنصة الخير؟
            </h3>
            <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
              نلتزم بأعلى معايير الشفافية والحماية لضمان وصول مساهماتك وتبرعاتك بأمان وموثوقية تامة.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: CheckCircle2, title: 'جهات موثقة', desc: 'مراكز وجمعيات معتمدة ومسجلة رسمياً' },
              { icon: MapPin, title: 'تتبع التبرعات', desc: 'متابعة مسار تبرعك خطوة بخطوة حتى وصوله' },
              { icon: LayoutList, title: 'تقارير شهرية', desc: 'شفافية كاملة وتقارير دورية بالأثر المحقق' },
              { icon: Shield, title: 'حماية بياناتك', desc: 'تشفير آمن لجميع بياناتك ومعلوماتك الشخصية' },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-[#1A2332]/60 p-6 rounded-2xl border border-border/80 dark:border-border/40 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h5 className="font-bold text-base text-foreground mb-1">{item.title}</h5>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Sticky Button */}
      <div className="fixed bottom-6 start-4 end-4 lg:hidden z-40">
        <Button onClick={handleNearestMe} className="w-full h-14 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 text-lg font-bold">
          <MapPin className="me-2 h-5 w-5" /> اعرض أقرب مركز
        </Button>
      </div>

    </div>
  );
}

// Just importing Shield directly since it was missing above
import { Shield } from 'lucide-react';
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>{children}</span>;
}
