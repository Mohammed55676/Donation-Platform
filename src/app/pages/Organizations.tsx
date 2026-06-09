import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { MapPin, Search, SlidersHorizontal, X, Building, ArrowLeft, Heart, Users, DollarSign } from 'lucide-react';
import { useOrganizations } from '../hooks/useOrganizations';
import { useLanguage } from '../context/LanguageContext';

export function Organizations() {
  const { organizations, loading } = useOrganizations();
  const { t, language } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('الكل');

  const filteredOrganizations = useMemo(() => {
    let result = organizations.filter(org => org.isActive);

    if (locationFilter !== 'الكل') {
      result = result.filter(org => org.location === locationFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(org =>
        org.name.toLowerCase().includes(q) ||
        org.description.toLowerCase().includes(q) ||
        org.location.toLowerCase().includes(q)
      );
    }

    return result;
  }, [organizations, searchQuery, locationFilter]);

  const hasActiveFilters = locationFilter !== 'الكل' || searchQuery;

  const resetFilters = () => {
    setLocationFilter('الكل');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen py-12 bg-muted/20 dark:bg-[#0F1623]/20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F1623] to-[#1A2332] border border-white/5 p-8 md:p-12 text-white shadow-2xl mb-12">
          <div className="absolute top-0 end-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 start-0 w-60 h-60 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl text-start">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground rounded-full px-4 py-1.5 text-xs font-semibold mb-6 border border-primary/20">
              <Building className="h-4 w-4" />
              {language === 'ar' ? 'المؤسسات الخيرية الشريكة' : 'Partner Charity Organizations'}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight">
              {language === 'ar' ? 'شركاء العطاء والمستقبل' : 'Partners in Giving and the Future'}
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              {language === 'ar' 
                ? 'تعرف على المؤسسات والجمعيات المعتمدة لدينا. يمكنك التطوع لدعمهم أو تقديم التبرعات النقدية لتوسيع أثرهم الخيري.'
                : 'Meet our certified partner organizations. Volunteer to support them or make cash donations to expand their charitable impact.'}
            </p>
          </div>
        </div>

        {/* Filters and List */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Card className="border-none shadow-md rounded-2xl bg-card sticky top-24">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between text-sm font-semibold text-muted-foreground mb-2">
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    {language === 'ar' ? 'تصفية النتائج' : 'Filter Results'}
                  </span>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2.5 text-xs rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                      onClick={resetFilters}
                    >
                      <X className="h-3 w-3" />
                      {language === 'ar' ? 'مسح الفلاتر' : 'Reset'}
                    </Button>
                  )}
                </div>

                {/* Search */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    {language === 'ar' ? 'بحث' : 'Search'}
                  </label>
                  <div className="relative">
                    <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder={language === 'ar' ? 'ابحث عن مؤسسة...' : 'Search organization...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pe-10 rounded-xl h-10 border-none bg-muted/50 focus-visible:ring-primary"
                    />
                  </div>
                </div>

                {/* Location Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    {language === 'ar' ? 'الموقع الجغرافي' : 'Location'}
                  </label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="rounded-xl h-10 border-none bg-muted/50">
                      <SelectValue placeholder={language === 'ar' ? 'اختر المدينة' : 'Choose City'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="الكل">{language === 'ar' ? 'كل المدن' : 'All Cities'}</SelectItem>
                      <SelectItem value="عمان">{language === 'ar' ? 'عمان' : 'Amman'}</SelectItem>
                      <SelectItem value="إربد">{language === 'ar' ? 'إربد' : 'Irbid'}</SelectItem>
                      <SelectItem value="الزرقاء">{language === 'ar' ? 'الزرقاء' : 'Zarqa'}</SelectItem>
                      <SelectItem value="العقبة">{language === 'ar' ? 'العقبة' : 'Aqaba'}</SelectItem>
                      <SelectItem value="السلط">{language === 'ar' ? 'السلط' : 'Salt'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Organizations Grid */}
          <div className="lg:w-3/4 flex flex-col gap-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden border-none bg-card rounded-2xl shadow-sm">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-5 space-y-3">
                      <Skeleton className="h-6 w-3/4 rounded" />
                      <Skeleton className="h-4 w-full rounded" />
                      <Skeleton className="h-4 w-5/6 rounded" />
                      <div className="flex gap-4 pt-3">
                        <Skeleton className="h-8 w-20 rounded" />
                        <Skeleton className="h-8 w-24 rounded" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredOrganizations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredOrganizations.map((org) => (
                  <Card
                    key={org.id}
                    className="overflow-hidden border-none bg-card rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group"
                  >
                    {/* Image Header */}
                    <div className="relative h-48 overflow-hidden bg-muted">
                      {org.image ? (
                        <img
                          src={org.image}
                          alt={org.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                          <Building className="h-12 w-12 text-primary/40 animate-pulse" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      
                      {/* Location Badge on Image */}
                      <div className="absolute top-4 start-4">
                        <Badge className="bg-white/90 dark:bg-[#1A2332]/90 text-foreground border-none backdrop-blur-sm text-xs font-semibold px-3 py-1 shadow flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-primary" />
                          {org.location}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-2 pt-5">
                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                        {org.name}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-2 leading-relaxed min-h-[40px]">
                        {org.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-4 mt-auto pt-2 pb-6">
                      {/* Stats Section */}
                      <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/40 dark:bg-[#0F1623]/20 text-start">
                        <div>
                          <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mb-0.5">
                            <DollarSign className="h-3 w-3 text-emerald-500" />
                            {language === 'ar' ? 'التبرعات المستلمة' : 'Funds Raised'}
                          </p>
                          <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                            {org.raisedFunds} {language === 'ar' ? 'د.أ' : 'JOD'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mb-0.5">
                            <Users className="h-3 w-3 text-primary" />
                            {language === 'ar' ? 'المتطوعون المسجلون' : 'Volunteers'}
                          </p>
                          <p className="text-base font-extrabold text-foreground">
                            {org.volunteersCount} {language === 'ar' ? 'متطوع' : 'Volunteers'}
                          </p>
                        </div>
                      </div>

                      {/* Detail Link */}
                      <Link to={`/organizations/${org.id}`} className="w-full">
                        <Button className="w-full h-10 rounded-xl font-semibold shadow-md shadow-primary/10 gap-2">
                          {language === 'ar' ? 'التفاصيل والتبرع' : 'View Details & Donate'}
                          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-card rounded-3xl p-8 shadow-sm">
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
                  <Building className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {language === 'ar' ? 'لم يتم العثور على مؤسسات' : 'No Organizations Found'}
                </h3>
                <p className="text-muted-foreground mb-6 text-sm">
                  {language === 'ar' 
                    ? 'لا توجد مؤسسات نشطة تطابق معايير البحث الحالية.' 
                    : 'There are no active organizations matching current search filters.'}
                </p>
                <Button variant="outline" className="rounded-xl font-semibold px-6" onClick={resetFilters}>
                  <X className="me-2 h-4 w-4" />
                  {language === 'ar' ? 'إعادة تعيين الفلاتر' : 'Reset Filters'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
