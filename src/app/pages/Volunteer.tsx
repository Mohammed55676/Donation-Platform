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
import { useNotifications } from '../context/NotificationContext';
import { isValidEmail, isLettersOnly, sanitizePhone } from '../utils/validators';

type VolunteerErrors = { name?: string; email?: string; phone?: string };
type ContactErrors = { name?: string; email?: string; message?: string };

export function Volunteer() {
  const [opportunities, setOpportunities] = useState(volunteerOpportunities);
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<VolunteerErrors>({});
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactErrors, setContactErrors] = useState<ContactErrors>({});
  const [isContactSending, setIsContactSending] = useState(false);

  const validate = (): VolunteerErrors => {
    const e: VolunteerErrors = {};
    if (!formData.name.trim()) {
      e.name = 'الاسم مطلوب';
    } else if (!isLettersOnly(formData.name)) {
      e.name = 'الاسم يجب أن يحتوي على حروف فقط';
    } else if (formData.name.trim().length < 3) {
      e.name = 'الاسم يجب أن يكون 3 أحرف على الأقل';
    }
    if (!formData.email.trim()) {
      e.email = 'البريد الإلكتروني مطلوب';
    } else if (!isValidEmail(formData.email)) {
      e.email = 'البريد الإلكتروني غير صحيح';
    }
    if (!formData.phone.trim()) {
      e.phone = 'رقم الهاتف مطلوب';
    } else if (!/^07[789]\d{7}$/.test(formData.phone.trim())) {
      e.phone = 'يجب أن يبدأ بـ 077 أو 078 أو 079 ومكوّن من 10 أرقام';
    }
    return e;
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    addNotification({
      type: 'success',
      title: 'تم تسجيلك بنجاح!',
      message: 'شكراً لانضمامك لفريق التطوع. سنتواصل معك قريباً.',
    });
    
    // Update progress locally
    if (selectedOpportunity) {
      setOpportunities(prev => prev.map(opp => 
        opp.id === selectedOpportunity 
          ? { ...opp, volunteers: opp.volunteers + 1 }
          : opp
      ));
    }

    toast.success('تم تسجيلك بنجاح!');
    setFormData({ name: '', email: '', phone: '', message: '' });
    setErrors({});
    setSelectedOpportunity(null);
  };

  const validateContact = (): ContactErrors => {
    const e: ContactErrors = {};
    if (!contactForm.name.trim()) e.name = 'الاسم مطلوب';
    else if (contactForm.name.trim().length < 3) e.name = 'الاسم يجب أن يكون 3 أحرف على الأقل';
    if (!contactForm.email.trim()) e.email = 'البريد مطلوب';
    else if (!isValidEmail(contactForm.email)) e.email = 'بريد إلكتروني غير صحيح';
    if (!contactForm.message.trim()) e.message = 'الرسالة مطلوبة';
    else if (contactForm.message.trim().length < 10) e.message = 'الرسالة يجب أن تحتوي على 10 أحرف على الأقل';
    return e;
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateContact();
    if (Object.keys(errs).length > 0) { setContactErrors(errs); return; }
    setIsContactSending(true);
    await new Promise(r => setTimeout(r, 1200));
    addNotification({ type: 'success', title: 'تم إرسال رسالتك', message: 'شكراً لتواصلك معنا! سنرد عليك قريباً.' });
    toast.success('تم إرسال رسالتك بنجاح ❤️');
    setContactForm({ name: '', email: '', message: '' });
    setContactErrors({});
    setIsContactSending(false);
    setIsContactOpen(false);
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
                { icon: Heart, title: 'اصنع فرقاً', description: 'ساهم في تحسين حياة الأشخاص المحتاجين' },
                { icon: Users, title: 'تعرف على أصدقاء جدد', description: 'انضم إلى مجتمع من المتطوعين الملتزمين' },
                { icon: TrendingUp, title: 'اكتسب خبرات جديدة', description: 'طور مهاراتك وتعلم أشياء جديدة' },
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
          {opportunities.map((opportunity) => {
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
                        {new Date(opportunity.date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{opportunity.volunteers} من {opportunity.maxVolunteers} متطوع</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">نسبة التسجيل</span>
                      <span className="font-semibold text-primary">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <Dialog open={selectedOpportunity === opportunity.id} onOpenChange={(open) => { if (!open) setSelectedOpportunity(null); }}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-white"
                        onClick={() => { setSelectedOpportunity(opportunity.id); setErrors({}); setFormData({ name: '', email: '', phone: '', message: '' }); }}
                        disabled={spotsLeft === 0}
                      >
                        {spotsLeft === 0 ? (
                          <><CheckCircle className="ml-2 h-4 w-4" />مكتمل</>
                        ) : (
                          <><Users className="ml-2 h-4 w-4" />سجل الآن</>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md" dir="rtl">
                      <DialogHeader>
                        <DialogTitle>التسجيل في فرصة التطوع</DialogTitle>
                        <DialogDescription>{opportunity.title}</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSignUp} className="space-y-4">
                        {/* Name */}
                        <div className="space-y-1">
                          <Label htmlFor="vol-name">الاسم الكامل *</Label>
                          <Input
                            id="vol-name"
                            placeholder="أدخل اسمك الكامل"
                            value={formData.name}
                            onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors(prev => ({ ...prev, name: undefined })); }}
                            className={errors.name ? 'border-destructive' : ''}
                          />
                          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>
                        {/* Email */}
                        <div className="space-y-1">
                          <Label htmlFor="vol-email">البريد الإلكتروني *</Label>
                          <Input
                            id="vol-email"
                            type="email"
                            placeholder="example@email.com"
                            value={formData.email}
                            onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors(prev => ({ ...prev, email: undefined })); }}
                            className={errors.email ? 'border-destructive' : ''}
                            dir="ltr"
                          />
                          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                        </div>
                        {/* Phone */}
                        <div className="space-y-1">
                          <Label htmlFor="vol-phone">رقم الجوال *</Label>
                          <Input
                            id="vol-phone"
                            placeholder="07X XXXX XXXX"
                            value={formData.phone}
                            onChange={(e) => {
                              const clean = sanitizePhone(e.target.value);
                              setFormData({ ...formData, phone: clean });
                              setErrors(prev => ({ ...prev, phone: undefined }));
                            }}
                            className={errors.phone ? 'border-destructive' : ''}
                            dir="ltr"
                            maxLength={10}
                          />
                          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                        </div>
                        {/* Message */}
                        <div className="space-y-1">
                          <Label htmlFor="vol-message">رسالة (اختياري)</Label>
                          <Textarea
                            id="vol-message"
                            placeholder="أخبرنا لماذا ترغب في التطوع..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            rows={3}
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
            <Button size="lg" variant="secondary" onClick={() => setIsContactOpen(true)}>
              <Users className="ml-2 h-5 w-5" />
              تواصل معنا
            </Button>
          </CardContent>
        </Card>

        {/* Contact Us Dialog */}
        <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>تواصل معنا</DialogTitle>
              <DialogDescription>أخبرنا عن اهتماماتك وسنتواصل معك قريباً</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="contact-name">الاسم الكامل</Label>
                <Input
                  id="contact-name"
                  placeholder="محمد أحمد"
                  value={contactForm.name}
                  onChange={e => { setContactForm(f => ({ ...f, name: e.target.value })); setContactErrors(c => ({ ...c, name: undefined })); }}
                  className={contactErrors.name ? 'border-destructive' : ''}
                />
                {contactErrors.name && <p className="text-xs text-destructive">{contactErrors.name}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="contact-email">البريد الإلكتروني</Label>
                <Input
                  id="contact-email"
                  placeholder="example@email.com"
                  dir="ltr"
                  value={contactForm.email}
                  onChange={e => { setContactForm(f => ({ ...f, email: e.target.value })); setContactErrors(c => ({ ...c, email: undefined })); }}
                  className={contactErrors.email ? 'border-destructive' : ''}
                />
                {contactErrors.email && <p className="text-xs text-destructive">{contactErrors.email}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="contact-message">رسالتك</Label>
                <Textarea
                  id="contact-message"
                  placeholder="أخبرنا عن اهتماماتك وكيف تريد المساهمة..."
                  rows={4}
                  value={contactForm.message}
                  onChange={e => { setContactForm(f => ({ ...f, message: e.target.value })); setContactErrors(c => ({ ...c, message: undefined })); }}
                  className={contactErrors.message ? 'border-destructive' : ''}
                />
                {contactErrors.message && <p className="text-xs text-destructive">{contactErrors.message}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isContactSending} className="flex-1 bg-primary hover:bg-primary/90 text-white">
                  {isContactSending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsContactOpen(false)} disabled={isContactSending}>إلغاء</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
