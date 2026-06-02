import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { MapPin, Search, Filter, Gift, Heart, SlidersHorizontal, X } from 'lucide-react';
import { useDonations, type ExtendedDonation } from '../context/DonationContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';

export function Donations() {
  const { user, toggleWishlist } = useAuth();
  const { donations, loading: donationsLoading } = useDonations();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isLoading = donationsLoading;

  const [categoryFilter, setCategoryFilter] = useState<string>('الكل');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('الكل');
  const [conditionFilter, setConditionFilter] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setCategoryFilter(cat);
    }
  }, [searchParams]);

  const filteredDonations = useMemo(() => {
    let result = donations.filter(d => d.status === 'متاح' || d.status === 'محجوز' || d.status === 'تم التسليم');
    if (categoryFilter !== 'الكل') result = result.filter(d => d.category === categoryFilter);
    if (urgencyFilter !== 'الكل') result = result.filter(d => d.urgency === urgencyFilter);
    if (conditionFilter !== 'الكل') result = result.filter(d => d.condition === conditionFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      result = result.filter(d =>
        d.title.includes(q) ||
        d.description.includes(q) ||
        d.location.includes(q)
      );
    }
    return result;
  }, [donations, categoryFilter, urgencyFilter, conditionFilter, searchQuery]);

  const handleCategoryChange = (value: string) => { setCategoryFilter(value); };
  const handleUrgencyChange = (value: string) => { setUrgencyFilter(value); };
  const handleConditionChange = (value: string) => { setConditionFilter(value); };
  const handleSearchChange = (value: string) => { setSearchQuery(value); };

  const hasActiveFilters = categoryFilter !== 'الكل' || urgencyFilter !== 'الكل' || conditionFilter !== 'الكل' || searchQuery;

  const resetFilters = () => {
    setCategoryFilter('الكل');
    setUrgencyFilter('الكل');
    setConditionFilter('الكل');
    setSearchQuery('');
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'عالية': return 'bg-red-500 text-white border-0';
      case 'متوسطة': return 'bg-amber-500 text-white border-0';
      case 'منخفضة': return 'bg-emerald-500 text-white border-0';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-1.5 tracking-tight">جميع التبرعات</h1>
            <p className="text-muted-foreground">تصفح التبرعات المتاحة واطلب ما تحتاج</p>
          </div>
          <Button
            size="lg"
            onClick={() => user ? navigate('/add-donation') : navigate('/login')}
            className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto h-11 px-7 rounded-xl font-semibold shadow-md shadow-primary/20"
          >
            <Gift className="me-2 h-5 w-5" />
            تبرع الآن
          </Button>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters (25%) */}
          <div className="lg:w-1/4 flex flex-col gap-5">
            <Card className="border-none shadow-sm sticky top-24">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-4">
              <SlidersHorizontal className="h-4 w-4" />
              تصفية النتائج
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-3 text-xs rounded-lg ms-auto text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                  onClick={resetFilters}
                >
                  <X className="h-3 w-3" />
                  مسح الفلاتر
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="ابحث عن تبرع..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pe-10 rounded-xl h-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                <SelectTrigger className="rounded-xl h-10">
                  <SelectValue placeholder="الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الكل">جميع الفئات</SelectItem>
                  <SelectItem value="ملابس">ملابس</SelectItem>
                  <SelectItem value="طعام">طعام</SelectItem>
                  <SelectItem value="أثاث">أثاث</SelectItem>
                  <SelectItem value="كتب">كتب</SelectItem>
                  <SelectItem value="مستلزمات طبية">مستلزمات طبية</SelectItem>
                  <SelectItem value="أخرى">أخرى</SelectItem>
                </SelectContent>
              </Select>
              <Select value={urgencyFilter} onValueChange={handleUrgencyChange}>
                <SelectTrigger className="rounded-xl h-10">
                  <SelectValue placeholder="مستوى الأولوية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الكل">جميع المستويات</SelectItem>
                  <SelectItem value="عالية">عالية</SelectItem>
                  <SelectItem value="متوسطة">متوسطة</SelectItem>
                  <SelectItem value="منخفضة">منخفضة</SelectItem>
                </SelectContent>
              </Select>
              <Select value={conditionFilter} onValueChange={handleConditionChange}>
                <SelectTrigger className="rounded-xl h-10">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الكل">جميع الحالات</SelectItem>
                  <SelectItem value="جديد">جديد</SelectItem>
                  <SelectItem value="جيد">جيد</SelectItem>
                  <SelectItem value="مستعمل">مستعمل</SelectItem>
                </SelectContent>
              </Select>
              </div>
            </CardContent>
          </Card>
          </div>

          {/* Grid Area (75%) */}
          <div className="lg:w-3/4 flex flex-col">
            {/* Results count */}
            {!isLoading && (
              <div className="mb-5 flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  تم العثور على <span className="font-bold text-foreground">{filteredDonations.length}</span> تبرع
                </p>
              </div>
            )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-none bg-card">
                <Skeleton className="h-48 w-full rounded-none" />
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="flex items-center gap-2 pt-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredDonations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredDonations.map((donation) => (
              <Link key={donation.id} to={`/donations/${donation.id}`}>
                <Card className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col border-none group bg-card">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={donation.image}
                      alt={donation.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    {/* Urgency badge on image (Only for medical items) */}
                    {donation.category === 'مستلزمات طبية' && (
                      <div className="absolute top-3 start-3">
                        <Badge className="bg-red-500 text-white border-0 text-xs font-semibold shadow">عاجل</Badge>
                      </div>
                    )}
                    {/* Wishlist button */}
                    <Button
                      size="icon"
                      variant="secondary"
                      className={`absolute top-3 end-3 h-8 w-8 rounded-full bg-white/90 dark:bg-black/60 shadow hover:bg-white transition-all ${user?.wishlist?.includes(donation.id) ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                        }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!user) { navigate('/login'); return; }
                        toggleWishlist(donation.id);
                      }}
                    >
                      <Heart className={`h-3.5 w-3.5 ${user?.wishlist?.includes(donation.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>

                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <Badge variant="outline" className="text-xs font-semibold border-primary/30 text-primary bg-primary/5">
                        {donation.category}
                      </Badge>
                      <Badge
                        className={`text-xs font-semibold ${donation.status === 'متاح'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0'
                            : 'bg-muted text-muted-foreground border-0'
                          }`}
                      >
                        {donation.status}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-1 text-base group-hover:text-primary transition-colors">{donation.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">{donation.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="mt-auto pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span className="truncate">{donation.location}</span>
                      </div>
                      <div className="flex items-center gap-2.5 pt-2 border-t border-border/60">
                        <img
                          src={donation.donor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(donation.donor.name)}&background=random&color=fff`}
                          alt={donation.donor.name}
                          className="w-7 h-7 rounded-full object-cover ring-2 ring-background"
                        />
                        <span className="text-sm text-muted-foreground font-medium truncate">{donation.donor.name}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-5">
              <Gift className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-bold mb-2">لم يتم العثور على تبرعات</h3>
            <p className="text-muted-foreground mb-6 text-sm">لا توجد تبرعات تطابق معايير البحث الحالية</p>
            <Button variant="outline" className="rounded-xl font-semibold" onClick={resetFilters}>
              <X className="me-2 h-4 w-4" />
              إعادة تعيين الفلاتر
            </Button>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
