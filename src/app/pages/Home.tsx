import { campaigns, donations } from '../data/donations';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { 
  Shirt, UtensilsCrossed, Armchair, BookOpen, Package, 
  Gift, Users, Heart, ArrowLeft, TrendingUp, Clock 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';

export function Home() {
  const categories = [
    { name: 'ملابس', icon: Shirt, color: 'bg-blue-500', count: 45 },
    { name: 'طعام', icon: UtensilsCrossed, color: 'bg-green-500', count: 32 },
    { name: 'أثاث', icon: Armchair, color: 'bg-purple-500', count: 18 },
    { name: 'كتب', icon: BookOpen, color: 'bg-orange-500', count: 28 },
    { name: 'أخرى', icon: Package, color: 'bg-pink-500', count: 15 },
  ];

  const stats = [
    { label: 'إجمالي التبرعات', value: '2,340', icon: Gift, color: 'text-primary' },
    { label: 'المتطوعون النشطون', value: '156', icon: Users, color: 'text-secondary' },
    { label: 'الأسر المستفيدة', value: '892', icon: Heart, color: 'text-pink-500' },
  ];

  const urgentDonations = donations.filter(d => d.urgency === 'عالية').slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              أعطِ ما تستطيع، ساعد من تستطيع
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              انضم إلينا في رحلة العطاء. كل تبرع يصنع فرقاً في حياة شخص محتاج
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/add-donation">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
                  <Gift className="ml-2 h-5 w-5" />
                  تبرع الآن
                </Button>
              </Link>
              <Link to="/donations">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 w-full sm:w-auto">
                  <Heart className="ml-2 h-5 w-5" />
                  اطلب مساعدة
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className={`p-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 ${stat.color}`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">فئات التبرعات</h2>
            <p className="text-muted-foreground">اختر الفئة التي ترغب في التبرع بها أو الحصول عليها</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.name} to={`/donations?category=${category.name}`}>
                  <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/50">
                    <CardContent className="p-6 text-center">
                      <div className={`${category.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="mb-1">{category.name}</h3>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                        {category.count} عنصر
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl mb-2">الحملات العاجلة</h2>
              <p className="text-muted-foreground">حملات تحتاج دعمك الفوري</p>
            </div>
            <Link to="/donations">
              <Button variant="outline">
                عرض الكل
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {campaigns.map((campaign) => {
              const progress = (campaign.current / campaign.target) * 100;
              return (
                <Card key={campaign.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-48">
                    <img
                      src={campaign.image}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge
                      className={`absolute top-3 right-3 ${campaign.urgency === 'عالية'
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-orange-500 hover:bg-orange-600'
                        } text-white border-0`}
                    >
                      {campaign.urgency === 'عالية' ? 'عاجل' : 'مهم'}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle>{campaign.title}</CardTitle>
                    <CardDescription>{campaign.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">التقدم</span>
                        <span className="font-semibold text-primary">
                          {campaign.current} من {campaign.target}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <Link to="/add-donation">
                        <Button className="w-full bg-secondary hover:bg-secondary/90 text-white">
                          <TrendingUp className="ml-2 h-4 w-4" />
                          ساهم الآن
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Urgent Needs */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl mb-2">احتياجات عاجلة</h2>
              <p className="text-muted-foreground">تبرعات تحتاج اهتمام فوري</p>
            </div>
            <Link to="/donations?urgency=عالية">
              <Button variant="outline">
                عرض الكل
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {urgentDonations.map((donation) => (
              <Link key={donation.id} to={`/donations/${donation.id}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
                  <div className="relative h-48">
                    <img
                      src={donation.image}
                      alt={donation.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white border-0">
                      <Clock className="ml-1 h-3 w-3" />
                      عاجل
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{donation.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{donation.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={donation.donor.avatar}
                          alt={donation.donor.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm text-muted-foreground">{donation.donor.name}</span>
                      </div>
                      <Badge variant="outline" className="border-secondary text-secondary">
                        {donation.location}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <Heart className="h-16 w-16 mx-auto mb-6 fill-white" />
          <h2 className="text-3xl md:text-4xl mb-4">كن جزءاً من التغيير</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            انضم إلى آلاف المتطوعين والمتبرعين في صنع فرق حقيقي في حياة الآخرين
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/volunteer">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <Users className="ml-2 h-5 w-5" />
                انضم كمتطوع
              </Button>
            </Link>
            <Link to="/add-donation">
              <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20 w-full sm:w-auto">
                <Gift className="ml-2 h-5 w-5" />
                ابدأ التبرع
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}