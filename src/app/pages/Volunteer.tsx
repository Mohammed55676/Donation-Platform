import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { 
  Users, 
  Calendar, 
  MapPin, 
  Heart,
  Clock,
  TrendingUp,
  CheckCircle,
  Award
} from 'lucide-react';
import { volunteerOpportunities } from '../data/donations';
import { toast } from 'sonner';

export function Volunteer() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    toast.success('تم تسجيلك بنجاح! سنتواصل معك قريباً');
    setFormData({ name: '', email: '', phone: '', message: '' });
    setSelectedOpportunity(null);
  };

  const stats = [
    { label: 'المتطوعون النشطون', value: '156', icon: Users, color: 'text-primary' },
    { label: 'الفرص المتاحة', value: '12', icon: Heart, color: 'text-secondary' },
    { label: 'ساعات التطوع', value: '2,340', icon: Clock, color: 'text-purple-500' },
    { label: 'الأنشطة المنجزة', value: '89', icon: Award, color: 'text-orange-500' },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-6">
            <Users className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl mb-4">انضم إلى فريق التطوع</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            كن جزءاً من التغيير الإيجابي في المجتمع. ساهم بوقتك وجهدك لمساعدة الآخرين
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-3 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Why Volunteer Section */}
        <Card className="mb-12 bg-gradient-to-br from-primary/5 to-secondary/5 border-none">
          <CardContent className="p-8">
            <h2 className="text-2xl md:text-3xl mb-6 text-center">لماذا التطوع معنا؟</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Heart,
                  title: 'اصنع فرقاً',
                  description: 'ساهم في تحسين حياة الأشخاص المحتاجين',
                },
                {
                  icon: Users,
                  title: 'تعرف على أصدقاء جدد',
                  description: 'انضم إلى مجتمع من المتطوعين الملتزمين',
                },
                {
                  icon: TrendingUp,
                  title: 'اكتسب خبرات جديدة',
                  description: 'طور مهاراتك وتعلم أشياء جديدة',
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white mb-4 shadow-sm">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Volunteer Opportunities */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl mb-2">فرص التطوع المتاحة</h2>
          <p className="text-muted-foreground mb-6">اختر الفرصة المناسبة لك وسجل الآن</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {volunteerOpportunities.map((opportunity) => {
            const progress = (opportunity.volunteers / opportunity.maxVolunteers) * 100;
            const spotsLeft = opportunity.maxVolunteers - opportunity.volunteers;

            return (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="flex-1">{opportunity.title}</CardTitle>
                    <Badge 
                      variant={spotsLeft > 5 ? 'default' : 'destructive'}
                      className={spotsLeft > 5 ? 'bg-secondary text-white' : ''}
                    >
                      {spotsLeft} مقاعد متبقية
                    </Badge>
                  </div>
                  <CardDescription>{opportunity.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{opportunity.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">
                        {new Date(opportunity.date).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">
                        {opportunity.volunteers} من {opportunity.maxVolunteers} متطوع
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">نسبة التسجيل</span>
                      <span className="font-semibold text-primary">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-white"
                        onClick={() => setSelectedOpportunity(opportunity.id)}
                        disabled={spotsLeft === 0}
                      >
                        {spotsLeft === 0 ? (
                          <>
                            <CheckCircle className="ml-2 h-4 w-4" />
                            مكتمل
                          </>
                        ) : (
                          <>
                            <Users className="ml-2 h-4 w-4" />
                            سجل الآن
                          </>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>التسجيل في فرصة التطوع</DialogTitle>
                        <DialogDescription>{opportunity.title}</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div>
                          <Label htmlFor="name">الاسم *</Label>
                          <Input
                            id="name"
                            placeholder="أدخل اسمك الكامل"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">البريد الإلكتروني *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="example@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">رقم الجوال *</Label>
                          <Input
                            id="phone"
                            placeholder="+966 50 123 4567"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="message">رسالة (اختياري)</Label>
                          <Textarea
                            id="message"
                            placeholder="أخبرنا لماذا ترغب في التطوع..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            rows={3}
                            className="mt-2"
                          />
                        </div>
                        <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-white">
                          <CheckCircle className="ml-2 h-4 w-4" />
                          تأكيد التسجيل
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <Card className="mt-12 bg-gradient-to-br from-primary to-secondary text-white border-none">
          <CardContent className="p-8 md:p-12 text-center">
            <Heart className="h-16 w-16 mx-auto mb-6 fill-white" />
            <h2 className="text-2xl md:text-3xl mb-4">لم تجد الفرصة المناسبة؟</h2>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              تواصل معنا وأخبرنا عن اهتماماتك، سنبقيك على اطلاع بالفرص الجديدة
            </p>
            <Button size="lg" variant="secondary">
              <Users className="ml-2 h-5 w-5" />
              تواصل معنا
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
