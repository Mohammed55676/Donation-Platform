import { useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { MapPin, Search, Filter } from 'lucide-react';
import { donations, type Donation } from '../data/donations';

export function Donations() {
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>(donations);
  const [categoryFilter, setCategoryFilter] = useState<string>('الكل');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('الكل');
  const [conditionFilter, setConditionFilter] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState('');

  const applyFilters = (
    category: string,
    urgency: string,
    condition: string,
    search: string
  ) => {
    let filtered = donations;

    if (category !== 'الكل') {
      filtered = filtered.filter(d => d.category === category);
    }

    if (urgency !== 'الكل') {
      filtered = filtered.filter(d => d.urgency === urgency);
    }

    if (condition !== 'الكل') {
      filtered = filtered.filter(d => d.condition === condition);
    }

    if (search) {
      filtered = filtered.filter(d =>
        d.title.includes(search) ||
        d.description.includes(search) ||
        d.location.includes(search)
      );
    }

    setFilteredDonations(filtered);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    applyFilters(value, urgencyFilter, conditionFilter, searchQuery);
  };

  const handleUrgencyChange = (value: string) => {
    setUrgencyFilter(value);
    applyFilters(categoryFilter, value, conditionFilter, searchQuery);
  };

  const handleConditionChange = (value: string) => {
    setConditionFilter(value);
    applyFilters(categoryFilter, urgencyFilter, value, searchQuery);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    applyFilters(categoryFilter, urgencyFilter, conditionFilter, value);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'عالية':
        return 'bg-red-500 hover:bg-red-600';
      case 'متوسطة':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'منخفضة':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'جديد':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'جيد جداً':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'جيد':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'مستعمل':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl mb-2">جميع التبرعات</h1>
          <p className="text-muted-foreground">تصفح التبرعات المتاحة واطلب ما تحتاج</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              تصفية النتائج
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن تبرع..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الكل">جميع الفئات</SelectItem>
                  <SelectItem value="ملابس">ملابس</SelectItem>
                  <SelectItem value="طعام">طعام</SelectItem>
                  <SelectItem value="أثاث">أثاث</SelectItem>
                  <SelectItem value="كتب">كتب</SelectItem>
                  <SelectItem value="أخرى">أخرى</SelectItem>
                </SelectContent>
              </Select>
              <Select value={urgencyFilter} onValueChange={handleUrgencyChange}>
                <SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الكل">جميع الحالات</SelectItem>
                  <SelectItem value="جديد">جديد</SelectItem>
                  <SelectItem value="جيد جداً">جيد جداً</SelectItem>
                  <SelectItem value="جيد">جيد</SelectItem>
                  <SelectItem value="مستعمل">مستعمل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            تم العثور على <span className="font-semibold text-foreground">{filteredDonations.length}</span> تبرع
          </p>
        </div>

        {/* Donations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDonations.map((donation) => (
            <Link key={donation.id} to={`/donations/${donation.id}`}>
              <Card className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer h-full">
                <div className="relative h-48">
                  <img
                    src={donation.image}
                    alt={donation.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className={`absolute top-3 right-3 ${getUrgencyColor(donation.urgency)} text-white border-0`}>
                    {donation.urgency}
                  </Badge>
                  <Badge 
                    className={`absolute top-3 left-3 ${getConditionColor(donation.condition)}`}
                  >
                    {donation.condition}
                  </Badge>
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="border-primary text-primary">
                      {donation.category}
                    </Badge>
                    <Badge 
                      variant={donation.status === 'متاح' ? 'default' : 'secondary'}
                      className={donation.status === 'متاح' ? 'bg-secondary hover:bg-secondary/90 text-white' : ''}
                    >
                      {donation.status}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-1">{donation.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{donation.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{donation.location}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <img
                          src={donation.donor.avatar}
                          alt={donation.donor.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm text-muted-foreground">{donation.donor.name}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredDonations.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">لم يتم العثور على تبرعات تطابق معايير البحث</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setCategoryFilter('الكل');
                setUrgencyFilter('الكل');
                setConditionFilter('الكل');
                setSearchQuery('');
                setFilteredDonations(donations);
              }}
            >
              إعادة تعيين الفلاتر
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
