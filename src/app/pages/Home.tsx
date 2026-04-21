import { campaigns, donations } from '../data/donations';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Shirt, UtensilsCrossed, Armchair, BookOpen, Package,
  Gift, Users, Heart, ArrowLeft, TrendingUp, HelpCircle, Lightbulb, MessageCircle, Target, ChevronLeft
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

export function Home() {
  const { user, toggleWishlist } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const handleDonateClick = () => {
    if (user) {
      navigate('/add-donation');
    } else {
      navigate('/login');
    }
  };

  const categories = [
    { name: 'ملابس', nameEn: 'Clothes', icon: Shirt, color: 'from-blue-500 to-blue-600', count: donations.filter(d => d.category === 'ملابس').length },
    { name: 'طعام', nameEn: 'Food', icon: UtensilsCrossed, color: 'from-emerald-500 to-emerald-600', count: donations.filter(d => d.category === 'طعام').length },
    { name: 'أثاث', nameEn: 'Furniture', icon: Armchair, color: 'from-purple-500 to-purple-600', count: donations.filter(d => d.category === 'أثاث').length },
    { name: 'كتب', nameEn: 'Books', icon: BookOpen, color: 'from-orange-500 to-orange-600', count: donations.filter(d => d.category === 'كتب').length },
    { name: 'أخرى', nameEn: 'Other', icon: Package, color: 'from-pink-500 to-pink-600', count: donations.filter(d => d.category === 'أخرى').length },
  ];

  const stats = [
    { label: t('home.stats_donations'), value: '2,340', icon: Gift, color: 'text-primary', bg: 'bg-primary/10 dark:bg-primary/20' },
    { label: t('home.stats_volunteers'), value: '156', icon: Users, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: t('home.stats_posts'), value: '4,521', icon: MessageCircle, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-100 dark:bg-pink-900/30' },
  ];

  const urgentDonations = donations.filter(d => d.urgency === 'عالية').slice(0, 3);

  const slideUp = {
    initial: { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.55, ease: "easeOut" as const }
  };

  return (
    <div className="min-h-screen">

      {/* ── Hero Section ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/8 via-background to-secondary/8 pt-20 pb-28 md:pt-28 md:pb-36">
        {/* Decorative blobs */}
        <div className="absolute top-0 end-0 w-[500px] h-[500px] bg-primary/6 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 start-0 w-[400px] h-[400px] bg-secondary/6 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div {...slideUp} className="max-w-3xl mx-auto text-center">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/15 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-8 border border-primary/15">
              <Heart className="h-3.5 w-3.5 fill-current" />
              منصة الخير — نربط القلوب بالعطاء
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-br from-primary via-primary/80 to-secondary bg-clip-text text-transparent leading-[1.1] tracking-tight">
              {t('home.hero_title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
              {t('home.hero_subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={handleDonateClick}
                className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all text-base px-8 h-12 rounded-xl font-semibold"
              >
                <Gift className="me-2 h-5 w-5" />
                {t('home.hero_donate_btn')}
              </Button>
              <Link to="/community" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted w-full sm:w-auto text-base px-8 h-12 rounded-xl font-semibold"
                >
                  <MessageCircle className="me-2 h-5 w-5" />
                  {t('home.hero_request_btn')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Section ────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white dark:bg-[#1A2332]/40">
        <div className="container mx-auto px-4">
          <motion.div {...slideUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('home.stats_title')}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t('home.stats_subtitle')}</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12, duration: 0.5 }}
                >
                  <Card className="border border-border/60 hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center group">
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

      {/* ── Active Campaigns ─────────────────────────────── */}
      <section className="py-20 md:py-28 bg-muted/40 dark:bg-[#0F1623]">
        <div className="container mx-auto px-4">
          <motion.div {...slideUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('home.campaigns_title')}</h2>
            <p className="text-muted-foreground">{t('home.campaigns_subtitle')}</p>
          </motion.div>
          <motion.div
            {...slideUp}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {campaigns.map((campaign) => {
              const percentage = Math.round((campaign.current / campaign.target) * 100);
              return (
                <Card
                  key={campaign.id}
                  className="overflow-hidden hover:shadow-xl hover:shadow-black/6 hover:-translate-y-1 transition-all duration-300 flex flex-col border border-border/60 group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={campaign.image}
                      alt={campaign.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-3 end-3">
                      <Badge className={`text-white border-0 text-xs font-semibold shadow-sm ${campaign.urgency === 'عالية' ? 'bg-red-500' : 'bg-amber-500'}`}>
                        {campaign.urgency === 'عالية' ? t('home.campaigns_urgency_high') : t('home.campaigns_urgency_med')}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-base leading-snug">{campaign.title}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">{campaign.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-col gap-3 mt-auto">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="font-medium text-primary">{percentage}%</span>
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" /> {campaign.target}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-primary font-semibold">{campaign.current} {t('home.categories_item')}</span>
                      <span className="text-muted-foreground">{campaign.target - campaign.current} متبقية</span>
                    </div>

                    <Button className="w-full h-9 rounded-xl font-semibold" onClick={handleDonateClick}>
                      <Gift className="me-2 h-4 w-4" />
                      {t('home.campaigns_donate_btn')}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white dark:bg-[#1A2332]/40">
        <div className="container mx-auto px-4">
          <motion.div {...slideUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('home.how_title')}</h2>
            <p className="text-muted-foreground">{t('home.how_subtitle')}</p>
          </motion.div>
          <motion.div {...slideUp} transition={{ duration: 0.5, delay: 0.15 }} className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { step: '01', title: t('home.how_step1_title'), desc: t('home.how_step1_desc'), color: 'from-primary to-primary/80' },
              { step: '02', title: t('home.how_step2_title'), desc: t('home.how_step2_desc'), color: 'from-secondary to-secondary/80' },
              { step: '03', title: t('home.how_step3_title'), desc: t('home.how_step3_desc'), color: 'from-purple-500 to-purple-600' },
              { step: '04', title: t('home.how_step4_title'), desc: t('home.how_step4_desc'), color: 'from-amber-500 to-amber-600' },
            ].map(({ step, title, desc, color }, i) => (
              <div key={i} className="text-center group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center mx-auto mb-4 text-xl font-extrabold shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  {step}
                </div>
                <h3 className="text-base font-bold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-muted/40 dark:bg-[#0F1623]">
        <div className="container mx-auto px-4">
          <motion.div {...slideUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('home.categories_title')}</h2>
            <p className="text-muted-foreground">{t('home.categories_subtitle')}</p>
          </motion.div>
          <motion.div
            {...slideUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-16 max-w-4xl mx-auto"
          >
            {categories.map((category) => {
              const Icon = category.icon;
              const displayName = language === 'en' ? category.nameEn : category.name;
              return (
                <Link key={category.name} to={`/donations?category=${category.name}`}>
                  <Card className="hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 cursor-pointer border border-border/60 group">
                    <CardContent className="p-5 text-center flex flex-col items-center">
                      <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-sm font-bold mb-1.5">{displayName}</h3>
                      <Badge className="bg-primary/10 text-primary border-0 text-xs font-semibold">
                        {category.count} {t('home.categories_item')}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </motion.div>

          {/* Community CTA */}
          <motion.div
            {...slideUp}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-white p-8 md:p-12 shadow-2xl shadow-primary/20"
          >
            <div className="absolute top-0 end-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 start-0 w-60 h-60 bg-secondary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">{t('home.community_title')}</h3>
                <p className="text-white/80 text-base leading-relaxed mb-6">
                  {t('home.community_desc')}
                </p>
                <Link to="/community">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 font-bold rounded-xl px-8 shadow-lg"
                  >
                    {t('home.community_btn')}
                  </Button>
                </Link>
              </div>
              <div className="shrink-0 hidden md:block">
                <div className="w-32 h-32 rounded-3xl bg-white/10 flex items-center justify-center">
                  <Users className="w-16 h-16 text-white/60" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Urgent Needs ─────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white dark:bg-[#1A2332]/40">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div {...slideUp} className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 text-red-500 text-sm font-semibold mb-2">
                <Lightbulb className="h-4 w-4" />
                الأكثر إلحاحاً
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">{t('home.urgent_title')}</h2>
              <p className="text-muted-foreground">{t('home.urgent_subtitle')}</p>
            </div>
            <Link to="/donations?urgency=عالية" className="shrink-0">
              <Button variant="outline" className="rounded-xl border-border hover:border-primary/40 gap-1.5 font-semibold">
                {t('home.urgent_view_all')}
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.div {...slideUp} transition={{ duration: 0.5, delay: 0.15 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {urgentDonations.map((donation) => (
              <Link key={donation.id} to={`/donations/${donation.id}`}>
                <Card className="overflow-hidden hover:shadow-xl hover:shadow-black/6 hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col group border border-border/60">
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={donation.image}
                      alt={donation.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-3 end-3 flex flex-col gap-2">
                      <Badge className="bg-red-500 text-white border-0 shadow font-semibold text-xs">
                        {t('home.urgent_badge')}
                      </Badge>
                    </div>
                    <Button
                      size="icon"
                      variant="secondary"
                      className={`absolute top-3 start-3 h-9 w-9 rounded-full bg-white/90 dark:bg-black/60 shadow hover:bg-white ${user?.wishlist?.includes(donation.id) ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                        }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(donation.id);
                      }}
                    >
                      <Heart className={`h-4 w-4 ${user?.wishlist?.includes(donation.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="line-clamp-2 text-base leading-snug group-hover:text-primary transition-colors">
                      {donation.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">{donation.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-3 pb-5 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={donation.donor.avatar}
                          alt={donation.donor.name}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-background"
                        />
                        <span className="text-sm font-medium">{donation.donor.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs border border-border/50">
                        {donation.location}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-muted/40 dark:bg-[#0F1623] border-y border-border/50">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div {...slideUp} className="text-center mb-14">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/15 text-primary mb-5">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('home.faq_title')}</h2>
            <p className="text-muted-foreground">{t('home.faq_subtitle')}</p>
          </motion.div>

          <motion.div {...slideUp} transition={{ duration: 0.5, delay: 0.15 }}>
            <Card className="border border-border/60 shadow-sm rounded-2xl overflow-hidden">
              <Accordion type="single" collapsible className="w-full">
                {[
                  { q: t('home.faq_q1'), a: t('home.faq_a1') },
                  { q: t('home.faq_q2'), a: t('home.faq_a2') },
                  { q: t('home.faq_q3'), a: t('home.faq_a3') },
                  { q: t('home.faq_q4'), a: t('home.faq_a4') },
                  { q: t('home.faq_q5'), a: t('home.faq_a5') },
                ].map((item, i, arr) => (
                  <AccordionItem key={i} value={`item-${i + 1}`} className={i === arr.length - 1 ? 'border-b-0' : ''}>
                    <AccordionTrigger className="text-base font-semibold py-5 px-6 hover:no-underline hover:text-primary transition-colors text-start">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm px-6 pb-5 leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-primary via-primary/90 to-secondary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
        <div className="absolute top-0 end-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 start-0 w-64 h-64 bg-secondary/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

        <motion.div {...slideUp} className="container mx-auto px-4 text-center relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-white/15 flex items-center justify-center mx-auto mb-8">
            <Heart className="h-10 w-10 text-white fill-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">{t('home.cta_title')}</h2>
          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto text-white/80 leading-relaxed">
            {t('home.cta_desc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/volunteer" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto px-10 h-12 text-base rounded-xl shadow-xl font-bold transition-all"
              >
                <Users className="me-2 h-5 w-5" />
                {t('home.cta_volunteer_btn')}
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={handleDonateClick}
              className="border-white/30 text-white hover:bg-white/10 bg-transparent w-full sm:w-auto px-10 h-12 text-base rounded-xl shadow-xl font-bold transition-all"
            >
              <Gift className="me-2 h-5 w-5" />
              {t('home.cta_donate_btn')}
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}