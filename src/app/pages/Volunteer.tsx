import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import {
  Users,
  MapPin,
  Heart,
  Clock,
  TrendingUp,
  CheckCircle,
  Award,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications } from '../context/NotificationContext';
import { isValidEmail, isLettersOnly, sanitizePhone } from '../utils/validators';
import { useVolunteerOpportunities } from '../hooks/useVolunteerOpportunities';
import api from '../utils/api';

type VolunteerErrors = { name?: string; email?: string; phone?: string; nationality?: string; program?: string };
type ContactErrors = { name?: string; email?: string; message?: string };

export function Volunteer() {
  const { opportunities, fetchOpportunities } = useVolunteerOpportunities();
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', nationality: 'أردني', program: '', message: '' });
  const [errors, setErrors] = useState<VolunteerErrors>({});
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactErrors, setContactErrors] = useState<ContactErrors>({});
  const [isContactSending, setIsContactSending] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

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
    if (!formData.program) {
      e.program = 'يرجى اختيار البرنامج';
    }
    return e;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (!selectedOpportunity) return;

    setIsApplying(true);
    try {
      await api.post(`/volunteer/${selectedOpportunity}/apply`);
      
      toast.success('تم تسجيلك بنجاح!');
      addNotification({ 
        type: 'success', 
        title: 'تم تسجيلك بنجاح', 
        message: 'لقد تم تسجيلك في فرصة التطوع بنجاح.' 
      });

      setFormData({ name: '', email: '', phone: '', nationality: 'أردني', program: '', message: '' });
      setErrors({});
      setSelectedOpportunity(null);
      fetchOpportunities();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'حدث خطأ أثناء التسجيل. يرجى التأكد من تسجيل الدخول.');
      // Revert on error (optional, fetchOpportunities will fix it)
      fetchOpportunities();
    } finally {
      setIsApplying(false);
    }
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
    try {
      await api.post('/contact', contactForm);
      addNotification({ type: 'success', title: 'تم إرسال رسالتك', message: 'شكراً لتواصلك معنا! سنرد عليك قريباً.' });
      toast.success('تم إرسال رسالتك بنجاح ❤️');
      setContactForm({ name: '', email: '', message: '' });
      setContactErrors({});
      setIsContactOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsContactSending(false);
    }
  };

  const stats = [
    { label: 'المتطوعون النشطون', value: '156', icon: Users, color: 'text-primary', bg: 'bg-primary/10 dark:bg-primary/15' },
    { label: 'الفرص المتاحة', value: String(opportunities.length), icon: Heart, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'ساعات التطوع', value: '2,340', icon: Clock, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'الأنشطة المنجزة', value: '89', icon: Award, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  ];

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ─────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/8 via-background to-secondary/8 py-20 md:py-28">
        <div className="absolute top-0 end-0 w-96 h-96 bg-secondary/6 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg mb-6">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">انضم إلى فريق التطوع</h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              كن جزءاً من التغيير الإيجابي في المجتمع. ساهم بوقتك وجهدك لمساعدة الآخرين
            </p>
            <Button
              size="lg"
              className="h-12 px-8 rounded-xl font-semibold shadow-lg shadow-primary/25"
              onClick={() => document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <ArrowLeft className="me-2 h-5 w-5" />
              استعرض الفرص المتاحة
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* ── Stats ──────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-none card-shadow rounded-3xl hover:shadow-lg hover:shadow-primary/10 transition-all text-center group">
                <CardContent className="pt-6 pb-5">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${stat.bg} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <p className="text-3xl font-extrabold mb-0.5 font-display">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ── Why Volunteer ──────────────────────── */}
        <Card className="mb-12 border-none card-shadow rounded-3xl bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10">
          <CardContent className="p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">لماذا التطوع معنا؟</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Heart, title: 'اصنع فرقاً', description: 'ساهم في تحسين حياة الأشخاص المحتاجين في مجتمعك', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
                { icon: Users, title: 'تعرف على أصدقاء جدد', description: 'انضم إلى مجتمع دافئ من المتطوعين الملتزمين', color: 'text-primary', bg: 'bg-primary/10' },
                { icon: TrendingUp, title: 'اكتسب خبرات جديدة', description: 'طور مهاراتك وتعلم أشياء جديدة في بيئة داعمة', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="text-center group">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${item.bg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-7 w-7 ${item.color}`} />
                    </div>
                    <h3 className="font-bold text-base mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Opportunities ──────────────────────── */}
        <div className="mb-8" id="opportunities">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">فرص التطوع المتاحة</h2>
          <p className="text-muted-foreground mb-8">اختر الفرصة المناسبة لك وسجل الآن</p>
        </div>

        {opportunities.length === 0 ? (
          <Card className="p-12 text-center border-2 border-border/60 border-dashed rounded-3xl bg-card/50">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="font-semibold mb-2">لا توجد فرص متاحة</h3>
            <p className="text-muted-foreground text-sm">تابعنا للاطلاع على الفرص القادمة</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {opportunities.map((opportunity) => {
              const progress = (opportunity.volunteers / opportunity.maxVolunteers) * 100;
              const spotsLeft = opportunity.maxVolunteers - opportunity.volunteers;
              const isFull = spotsLeft === 0;

              return (
                <Card
                  key={opportunity.id}
                  className={`border-none card-shadow rounded-3xl transition-all duration-200 hover:shadow-xl hover:shadow-primary/10 ${
                    isFull ? 'opacity-75' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <CardTitle className="text-base leading-snug flex-1">{opportunity.title}</CardTitle>
                      <Badge
                        className={`flex-shrink-0 text-xs font-semibold border-0 ${
                          isFull
                            ? 'bg-red-100 text-red-600 dark:bg-red-900/30'
                            : spotsLeft <= 5
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                        }`}
                      >
                        {isFull ? 'مكتمل' : `${spotsLeft} مقعد متبقي`}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm leading-relaxed">{opportunity.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Info */}
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                        </div>
                        {opportunity.location}
                      </div>
                      {opportunity.date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                          </div>
                          {new Date(opportunity.date).toLocaleDateString('ar-SA')}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Users className="h-3.5 w-3.5 text-primary" />
                        </div>
                        {opportunity.volunteers} من {opportunity.maxVolunteers} متطوع
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">نسبة التسجيل</span>
                        <span className="font-semibold text-primary">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isFull ? 'bg-red-400' : 'bg-gradient-to-r from-primary to-secondary'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <Dialog
                      open={selectedOpportunity === opportunity.id}
                      onOpenChange={(open) => { if (!open) setSelectedOpportunity(null); }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          className="w-full h-10 rounded-xl font-semibold"
                          onClick={() => {
                            setSelectedOpportunity(opportunity.id);
                            setErrors({});
                            setFormData({ name: '', email: '', phone: '', nationality: 'أردني', program: opportunity.title, message: '' });
                          }}
                          disabled={isFull}
                          variant={isFull ? 'secondary' : 'default'}
                        >
                          {isFull ? (
                            <><CheckCircle className="me-2 h-4 w-4" />اكتمل التسجيل</>
                          ) : (
                            <><Users className="me-2 h-4 w-4" />سجل الآن</>
                          )}
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-lg">التسجيل في فرصة التطوع</DialogTitle>
                          <DialogDescription>{opportunity.title}</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSignUp} className="space-y-4 pt-2">
                          {/* Name */}
                          <div className="space-y-1.5">
                            <Label htmlFor="vol-name" className="text-sm font-semibold">الاسم الكامل *</Label>
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
                          <div className="space-y-1.5">
                            <Label htmlFor="vol-email" className="text-sm font-semibold">البريد الإلكتروني *</Label>
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
                          <div className="space-y-1.5">
                            <Label htmlFor="vol-phone" className="text-sm font-semibold">رقم الجوال *</Label>
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
                          {/* Nationality */}
                          <div className="space-y-1.5">
                            <Label htmlFor="vol-nationality" className="text-sm font-semibold">الجنسية *</Label>
                            <select
                              id="vol-nationality"
                              value={formData.nationality}
                              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                              className="flex h-10 w-full rounded-xl border border-input bg-input-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <option value="أردني">أردني</option>
                              <option value="فلسطيني">فلسطيني</option>
                              <option value="سوري">سوري</option>
                              <option value="عراقي">عراقي</option>
                              <option value="مصري">مصري</option>
                              <option value="جنسية أخرى">جنسية أخرى</option>
                            </select>
                          </div>
                          {/* Program */}
                          <div className="space-y-1.5">
                            <Label htmlFor="vol-program" className="text-sm font-semibold">البرنامج المختار *</Label>
                            <select
                              id="vol-program"
                              value={formData.program}
                              onChange={(e) => { setFormData({ ...formData, program: e.target.value }); setErrors(prev => ({ ...prev, program: undefined })); }}
                              className={`flex h-10 w-full rounded-xl border border-input bg-input-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.program ? 'border-destructive' : ''}`}
                            >
                              <option value="">اختر البرنامج</option>
                              {opportunities.map(opp => (
                                <option key={opp.id} value={opp.title}>{opp.title}</option>
                              ))}
                            </select>
                            {errors.program && <p className="text-xs text-destructive">{errors.program}</p>}
                          </div>
                          {/* Message */}
                          <div className="space-y-1.5">
                            <Label htmlFor="vol-message" className="text-sm font-semibold">رسالة (اختياري)</Label>
                            <Textarea
                              id="vol-message"
                              placeholder="أخبرنا لماذا ترغب في التطوع..."
                              value={formData.message}
                              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                              rows={3}
                              className="rounded-xl"
                            />
                          </div>
                          <Button type="submit" disabled={isApplying} className="w-full h-11 rounded-xl font-semibold bg-secondary hover:bg-secondary/90">
                            {isApplying ? 'جاري التسجيل...' : <><CheckCircle className="me-2 h-4 w-4" />تأكيد التسجيل</>}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* ── CTA ────────────────────────────────── */}
        <div className="mt-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary text-white p-8 md:p-10 shadow-xl shadow-primary/20">
          <div className="absolute top-0 end-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-5">
              <Heart className="h-7 w-7 text-white fill-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">لم تجد الفرصة المناسبة؟</h2>
            <p className="text-white/80 text-base mb-6 max-w-xl mx-auto">
              تواصل معنا وأخبرنا عن اهتماماتك، سنبقيك على اطلاع بالفرص الجديدة
            </p>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-bold px-8 h-11 rounded-xl shadow-lg"
              onClick={() => setIsContactOpen(true)}
            >
              <Users className="me-2 h-5 w-5" />
              تواصل معنا
            </Button>
          </div>
        </div>
      </div>

      {/* Contact Dialog */}
      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تواصل معنا</DialogTitle>
            <DialogDescription>أخبرنا عن اهتماماتك وسنتواصل معك قريباً</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContactSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="contact-name" className="text-sm font-semibold">الاسم الكامل</Label>
              <Input
                id="contact-name"
                placeholder="محمد أحمد"
                value={contactForm.name}
                onChange={e => { setContactForm(f => ({ ...f, name: e.target.value })); setContactErrors(c => ({ ...c, name: undefined })); }}
                className={contactErrors.name ? 'border-destructive' : ''}
              />
              {contactErrors.name && <p className="text-xs text-destructive">{contactErrors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-email" className="text-sm font-semibold">البريد الإلكتروني</Label>
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
            <div className="space-y-1.5">
              <Label htmlFor="contact-message" className="text-sm font-semibold">رسالتك</Label>
              <Textarea
                id="contact-message"
                placeholder="أخبرنا عن اهتماماتك وكيف تريد المساهمة..."
                rows={4}
                value={contactForm.message}
                onChange={e => { setContactForm(f => ({ ...f, message: e.target.value })); setContactErrors(c => ({ ...c, message: undefined })); }}
                className={contactErrors.message ? 'border-destructive rounded-xl' : 'rounded-xl'}
              />
              {contactErrors.message && <p className="text-xs text-destructive">{contactErrors.message}</p>}
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={isContactSending} className="flex-1 h-10 rounded-xl font-semibold">
                {isContactSending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsContactOpen(false)} disabled={isContactSending} className="rounded-xl">
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
