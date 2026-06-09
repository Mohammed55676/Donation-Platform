import { Heart, Target, Users, Shield, Globe, Star, Award, Code2, Lock, Monitor, Gift, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';

const slideUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: 'easeOut' as const },
};

const goals = [
  {
    icon: Heart,
    title: 'ربط المتبرعين بالمحتاجين',
    desc: 'نبني جسراً مباشراً بين من يريد العطاء ومن يحتاج المساعدة في مختلف محافظات المملكة الأردنية الهاشمية، لضمان وصول كل تبرع إلى مستحقيه.',
    color: 'from-rose-400 to-pink-500',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    img: 'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    icon: Users,
    title: 'تمكين المتطوعين',
    desc: 'نوفر منصة متكاملة تمنح المتطوعين الأدوات والتنسيق اللازمين للعمل بكفاءة وأثر حقيقي في مجتمعاتهم المحلية.',
    color: 'from-primary to-sky-500',
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    img: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    icon: Globe,
    title: 'تعزيز التكافل الاجتماعي',
    desc: 'نؤمن بأن المجتمع القوي يُبنى على أكتاف أبنائه المتكاتفين. رسالتنا تعزيز ثقافة التطوع والعطاء في كل بيت أردني.',
    color: 'from-secondary to-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    img: 'https://images.unsplash.com/photo-1559735442-535a7c982953?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    icon: Shield,
    title: 'ضمان الشفافية والأمان',
    desc: 'نلتزم بأعلى معايير الأمان وحماية البيانات، مع شفافية تامة في كل عملية تبرع وتتبع دقيق يطمئن المانح والجمعية الشريكة.',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    img: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    icon: Target,
    title: 'الوصول إلى كل محتاج',
    desc: 'هدفنا توسيع نطاق الخدمة ليشمل جميع المحافظات الأردنية، من عمّان إلى العقبة، لا يُستثنى أحد من دائرة العطاء.',
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    img: 'https://images.unsplash.com/photo-1698023424292-fd31ed53d4fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
  {
    icon: Star,
    title: 'جودة الخدمة والمتابعة',
    desc: 'نقيس نجاحنا برضا الجمعيات الشريكة وثقة المتبرعين. نتابع كل حالة ونسعى دوماً للارتقاء بتجربة جميع مستخدمي المنصة.',
    color: 'from-teal-400 to-cyan-500',
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    img: 'https://images.unsplash.com/photo-1755202321667-e455e8000df2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80',
  },
];

const team = [
  {
    name: 'محمد حمدي',
    role: 'قائد الفريق — مطور Full Stack',
    specialty: 'هندسة البرمجيات',
    icon: Code2,
    badge: 'Team Leader',
    badgeColor: 'bg-primary text-white',
    gradient: 'from-primary/20 to-sky-400/20',
    img: 'https://images.unsplash.com/photo-1603969409447-ba86143a03f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80',
  },
  {
    name: 'عبدالله جبر',
    role: 'مطور Front End',
    specialty: 'هندسة البرمجيات',
    icon: Monitor,
    badge: 'Front End',
    badgeColor: 'bg-secondary text-white',
    gradient: 'from-secondary/20 to-emerald-400/20',
    img: 'https://images.unsplash.com/photo-1675869940341-d495d49010b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80',
  },
  {
    name: 'يزن عباس',
    role: 'مطور برمجيات',
    specialty: 'هندسة البرمجيات',
    icon: Code2,
    badge: 'BackEnd',
    badgeColor: 'bg-violet-500 text-white',
    gradient: 'from-violet-400/20 to-purple-400/20',
    img: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80',
  },
  {
    name: 'ابراهيم باسل',
    role: 'متخصص أمن سيبراني',
    specialty: 'الأمن السيبراني',
    icon: Lock,
    badge: 'Cyber Security',
    badgeColor: 'bg-rose-500 text-white',
    gradient: 'from-rose-400/20 to-pink-400/20',
    img: 'https://images.unsplash.com/photo-1752738372136-2602aaafdcb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80',
  },
];

const heroStats = [
  { value: '٢٣٤٠+', label: 'تبرع مُكتمل' },
  { value: '١٥٦', label: 'متطوع نشط' },
  { value: '٨٩٢', label: 'جمعية شريكة' },
  { value: '١٢', label: 'محافظة أردنية' },
];

export function About() {
  const { t } = useLanguage();

  const impactStats = useMemo(() => [
    { label: t('home.stats_donations'), value: '2,340', icon: Gift, color: 'text-primary', bg: 'bg-primary/10 dark:bg-primary/20' },
    { label: t('home.stats_volunteers'), value: '156', icon: Users, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: t('home.stats_posts'), value: '4,521', icon: MessageCircle, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-100 dark:bg-pink-900/30' },
  ], [t]);

  return (
    <div className="min-h-screen bg-background" dir="rtl">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/5 py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white dark:bg-[#1A2332]/60 shadow-md rounded-full px-5 py-2 mb-6 text-sm font-medium text-primary border border-border/50">
              <Heart className="h-4 w-4 fill-primary" />
              منصة الخير — من نحن
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight font-extrabold">
              نصنع الفرق معاً
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10">
              منصة رقمية أردنية تجمع المتبرعين والمتطوعين مع الأسر المحتاجة، لنبني مجتمعاً أكثر تكافلاً وعطاءً — لبسة تُدفئ، وجبة تُشبع، ابتسامة لا تُنسى.
            </p>
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {heroStats.map((s, i) => (
                <div key={i} className="bg-white dark:bg-[#1A2332]/60 rounded-2xl shadow p-4 text-center border border-border/50">
                  <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-display">{s.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-20 bg-white dark:bg-[#0F1623]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative order-2 lg:order-1">
              <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900&q=80"
                  alt="فريق العمل التطوعي"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-5 -left-5 bg-white dark:bg-[#1A2332] shadow-xl rounded-2xl px-5 py-3 flex items-center gap-3 border border-border/50">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">منصة موثوقة</p>
                  <p className="text-xs text-muted-foreground">منذ ٢٠٢٤</p>
                </div>
              </div>
            </div>
            {/* Text */}
            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-block bg-primary/10 text-primary rounded-full px-4 py-1 text-sm font-medium">
                رسالتنا
              </div>
              <h2 className="text-3xl md:text-4xl font-bold leading-snug">
                نؤمن بأن كل شخص يستحق <span className="text-primary">حياة كريمة</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                انطلقنا من إيمان راسخ بأن التكنولوجيا يمكن أن تُحدث فارقاً حقيقياً في حياة الناس. بنينا منصة الخير لتكون جسراً بين قلوب المعطين وأيدي المحتاجين في الأردن.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                نعمل على مدار الساعة لضمان وصول التبرعات بأمان وسرعة، مع تمكين المتطوعين من تنسيق جهودهم عبر منصة واحدة متكاملة تغطي جميع محافظات المملكة.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                {['شفافية تامة', 'أمان مضمون', 'وصول سريع', 'دعم مستمر'].map((tag) => (
                  <span key={tag} className="bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Second Mission block (reversed) ── */}
      <section className="py-20 bg-gradient-to-br from-secondary/5 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div className="space-y-6">
              <div className="inline-block bg-secondary/10 text-secondary rounded-full px-4 py-1 text-sm font-medium">
                قصتنا
              </div>
              <h2 className="text-3xl md:text-4xl font-bold leading-snug">
                من <span className="text-secondary">الفكرة</span> إلى الأثر الحقيقي
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                بدأت فكرة المنصة من مشروع تخرج جمع شباباً أردنياً يحمل روح المبادرة. رأينا الفجوة بين من يريد التبرع ولا يعرف كيف، وبين من يحتاج ولا يجد طريقاً.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                فقررنا أن نكون تلك الجسرة. اليوم نفتخر بخدمة آلاف الأسر عبر المملكة، وما زلنا نبني ونطور لأن رحلة العطاء لا تنتهي.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-white dark:bg-[#1A2332]/60 border border-border/50 rounded-2xl p-4 shadow text-center">
                  <p className="text-2xl font-bold text-primary font-display">٩٨٪</p>
                  <p className="text-sm text-muted-foreground mt-1">رضا الجمعيات الشريكة</p>
                </div>
                <div className="bg-white dark:bg-[#1A2332]/60 border border-border/50 rounded-2xl p-4 shadow text-center">
                  <p className="text-2xl font-bold text-secondary font-display">٤٨ ساعة</p>
                  <p className="text-sm text-muted-foreground mt-1">متوسط وصول التبرع</p>
                </div>
              </div>
            </div>
            {/* Image */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1556484687-30636164638b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900&q=80"
                  alt="يد العطاء"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-5 -right-5 bg-white dark:bg-[#1A2332] border border-border/50 shadow-xl rounded-2xl px-5 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-secondary to-emerald-400 rounded-full flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white fill-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm font-display">٢٣٤٠+ تبرع</p>
                  <p className="text-xs text-muted-foreground">تم توصيلها بنجاح</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Goals / أهدافنا ── */}
      <section className="py-24 bg-white dark:bg-[#0F1623]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-primary/10 text-primary rounded-full px-4 py-1 text-sm font-medium mb-4">
              أهدافنا
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">ما نسعى إليه كل يوم</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              كل هدف من أهدافنا يعكس التزامنا بخدمة المجتمع الأردني وبناء منظومة عطاء متكاملة ومستدامة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {goals.map((goal, i) => {
              const Icon = goal.icon;
              return (
                <Card key={i} className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group bg-white dark:bg-[#1A2332]/60">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={goal.img}
                      alt={goal.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {/* Icon badge */}
                    <div className={`absolute bottom-4 right-4 w-12 h-12 rounded-2xl bg-gradient-to-br ${goal.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <CardContent className={`p-6 ${goal.bg}`}>
                    <h3 className="text-lg font-bold mb-2">{goal.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{goal.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Stats Section (أثرنـا في المجتمع) ────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-muted/40 dark:bg-[#1A2332]/40">
        <div className="container mx-auto px-4">
          <motion.div {...slideUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('home.stats_title')}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t('home.stats_subtitle')}</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {impactStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12, duration: 0.5 }}
                >
                  <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group bg-card border-none">
                    <CardContent className="p-8 flex flex-col items-center">
                      <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`h-7 w-7 ${stat.color}`} />
                      </div>
                      <p className="text-4xl font-extrabold mb-1 font-display">{stat.value}</p>
                      <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials (قصص نجاح وتأثير) ─────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white dark:bg-[#0F1623]">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div {...slideUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">قصص نجاح وتأثير</h2>
            <p className="text-muted-foreground">تجارب حقيقية من مجتمعنا تعكس أثر العطاء</p>
          </motion.div>
          <motion.div {...slideUp} transition={{ duration: 0.5, delay: 0.15 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "أحمد محمود",
                role: "متبرع",
                quote: "تجربة التبرع عبر المنصة كانت سلسة وموثوقة. شعرت بسعادة غامرة عندما رأيت الأثر المباشر لتبرعي على العائلات المحتاجة.",
                rating: 5,
              },
              {
                name: "سارة عبدالرحمن",
                role: "جمعية خيرية",
                quote: "المنصة مكّنتنا من الوصول إلى المتبرعين بسهولة وسرعة. أداة لا غنى عنها لكل جمعية تسعى لتوسيع أثرها.",
                rating: 5,
              },
              {
                name: "خالد عبدالله",
                role: "متبرع",
                quote: "أكثر ما يعجبني هو الشفافية وسهولة الاستخدام. أستطيع تتبع تبرعاتي ومعرفة أين تذهب بالضبط. شكراً للقائمين على هذا العمل.",
                rating: 4,
              }
            ].map((testimonial, i) => (
              <Card key={i} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-[#1A2332]/60 rounded-2xl overflow-hidden group">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-6 text-amber-500">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className={`h-4 w-4 ${j < testimonial.rating ? 'fill-current' : 'text-muted stroke-current'}`} />
                    ))}
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-8 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-4 border-t border-border/50 pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                      <span className="text-sm text-primary font-medium">{testimonial.role}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 dark:from-[#1A2332]/40 dark:to-[#0F1623]/80">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-secondary/10 text-secondary rounded-full px-4 py-1 text-sm font-medium mb-4">
              الفريق
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">العقول التي بنت المنصة</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              فريق متكامل من المهندسين والمتخصصين يعملون بشغف لجعل كل تبرع يصل إلى مستحقه.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {team.map((member, i) => {
              const Icon = member.icon;
              return (
                <Card key={i} className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group text-center bg-white dark:bg-[#1A2332]">
                  {/* Photo */}
                  <div className={`relative h-56 bg-gradient-to-br ${member.gradient} overflow-hidden`}>
                    <img
                      src={member.img}
                      alt={member.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${member.badgeColor} shadow`}>
                        {member.badge}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-primary" />
                      <h3 className="font-bold text-base">{member.name}</h3>
                    </div>
                    <p className="text-primary text-sm font-medium mb-1">{member.role}</p>
                    <p className="text-muted-foreground text-xs">{member.specialty}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            أنت أيضاً جزء من الفرق
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            سواء كنت متبرعاً أو متطوعاً أو محتاجاً للمساعدة — مكانك دائماً محفوظ في منصة الخير.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/add-donation" className="inline-flex items-center justify-center gap-2 bg-white text-primary font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all">
              <Heart className="h-5 w-5 fill-primary" />
              تبرع الآن
            </Link>
            <Link to="/volunteer" className="inline-flex items-center justify-center gap-2 border-2 border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-all">
              <Users className="h-5 w-5" />
              انضم كمتطوع
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
