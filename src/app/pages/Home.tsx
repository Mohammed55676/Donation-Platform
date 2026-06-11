import { useCampaigns, type Campaign } from '../hooks/useCampaigns';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useDonations } from '../context/DonationContext';
import { useState } from 'react';
import { CampaignPaymentModal, type PaymentCampaignInfo } from '../components/CampaignPaymentModal';
import { Testimonials } from '../components/Testimonials';
import {
  Shirt, UtensilsCrossed, Armchair, BookOpen, Package,
  Gift, Users, Heart, ArrowLeft, TrendingUp, HelpCircle, Lightbulb, MessageCircle, Target, ChevronLeft, Star
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
import { DonationCard } from '../components/ui/DonationCard';
import { SafeImage } from '../components/ui/SafeImage';

export function Home() {
  const { user, toggleWishlist } = useAuth();
  const { t, language } = useLanguage();
  const { donations: apiDonations } = useDonations();
  const { campaigns } = useCampaigns();
  const navigate = useNavigate();

  const handleDonateClick = () => {
    if (user) {
      navigate('/add-donation');
    } else {
      navigate('/login');
    }
  };

  const [paymentModal, setPaymentModal] = useState<{ open: boolean; campaign: PaymentCampaignInfo | null }>({
    open: false,
    campaign: null,
  });

  function openCampaignPayment(campaign: Campaign) {
    setPaymentModal({
      open: true,
      campaign: {
        id: `home-${campaign.id}`,
        title: campaign.title,
        organization: 'منصة الخير',
        imageUrl: campaign.image,
        target: campaign.target,
        current: campaign.current,
      },
    });
  }

  const categories = [
    { name: 'ملابس', nameEn: 'Clothes', icon: Shirt, color: 'from-blue-500 to-blue-600', count: apiDonations.filter(d => d.category === 'ملابس').length },
    { name: 'طعام', nameEn: 'Food', icon: UtensilsCrossed, color: 'from-emerald-500 to-emerald-600', count: apiDonations.filter(d => d.category === 'طعام').length },
    { name: 'أثاث', nameEn: 'Furniture', icon: Armchair, color: 'from-purple-500 to-purple-600', count: apiDonations.filter(d => d.category === 'أثاث').length },
    { name: 'كتب', nameEn: 'Books', icon: BookOpen, color: 'from-orange-500 to-orange-600', count: apiDonations.filter(d => d.category === 'كتب').length },
    { name: 'أخرى', nameEn: 'Other', icon: Package, color: 'from-pink-500 to-pink-600', count: apiDonations.filter(d => d.category === 'أخرى').length },
  ];



  // Most recent 3 donations from API
  const recentDonations = apiDonations.slice(0, 3);

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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Text content */}
            <motion.div 
              {...slideUp} 
              className="lg:col-span-7 text-center lg:text-start flex flex-col items-center lg:items-start"
            >
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/15 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-8 border border-primary/15">
                <Heart className="h-3.5 w-3.5 fill-current" />
                منصة الخير — نربط القلوب بالعطاء
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-br from-primary via-primary/80 to-secondary bg-clip-text text-transparent leading-[1.15] tracking-tight">
                {t('home.hero_title')}
              </h1>
              <p className="text-lg text-muted-foreground mb-10 max-w-xl leading-relaxed">
                {t('home.hero_subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start w-full sm:w-auto">
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

            {/* Generated Premium Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-5 flex justify-center w-full"
            >
              <div className="relative w-full max-w-md lg:max-w-none">
                {/* Decorative glow behind image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl blur-3xl -z-10" />
                <img
                  src="/hero_donation.png"
                  alt="Donation Platform"
                  className="w-full h-auto object-cover rounded-3xl shadow-2xl shadow-primary/25 hover:scale-[1.02] transition-transform duration-500 border border-white/10"
                />
                
                {/* Small floating info card */}
                <div className="absolute -bottom-4 start-4 bg-background/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-lg border border-border/40 flex items-center gap-2 sm:gap-3 max-w-[calc(100%-2rem)]">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400 fill-current animate-pulse" />
                  </div>
                  <div className="text-start">
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground font-semibold">مساعدة الآخرين</p>
                    <p className="text-xs sm:text-sm font-bold text-foreground truncate">+2,340 تبرع ناجح</p>
                  </div>
                </div>
              </div>
            </motion.div>

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
                  className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group border-none"
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
                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
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

                    <Button className="w-full h-9 rounded-xl font-semibold" onClick={() => openCampaignPayment(campaign)}>
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

      {/* Campaign Payment Modal */}
      {paymentModal.campaign && (
        <CampaignPaymentModal
          open={paymentModal.open}
          onOpenChange={(open) => setPaymentModal(prev => ({ ...prev, open }))}
          campaign={paymentModal.campaign}
        />
      )}

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white dark:bg-[#1A2332]/40">
        <div className="container mx-auto px-4">
          <motion.div {...slideUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('home.how_title')}</h2>
            <p className="text-muted-foreground">{t('home.how_subtitle')}</p>
          </motion.div>
          <motion.div {...slideUp} transition={{ duration: 0.5, delay: 0.15 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
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
                  <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-none group bg-card">
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

      {/* ── Recent Donations ─────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white dark:bg-[#1A2332]/40">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div {...slideUp} className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-2">
                <Lightbulb className="h-4 w-4" />
                أحدث التبرعات
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">تبرعات أضيفت حديثاً</h2>
              <p className="text-muted-foreground">تصفح أحدث التبرعات التي تم إضافتها من قبل المجتمع</p>
            </div>
            <Link to="/donations" className="shrink-0">
              <Button variant="outline" className="rounded-xl border-border hover:border-primary/40 gap-1.5 font-semibold">
                عرض الكل
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.div {...slideUp} transition={{ duration: 0.5, delay: 0.15 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentDonations.map((donation) => (
              <DonationCard
                key={donation.id}
                donation={donation}
                user={user}
                toggleWishlist={toggleWishlist}
                onWishlistClick={() => {
                  if (!user) { navigate('/login'); return; }
                  toggleWishlist(donation.id);
                }}
              />
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
            <Card className="shadow-md rounded-2xl overflow-hidden border-none">
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