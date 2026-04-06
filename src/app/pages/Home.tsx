import { campaigns, donations } from '../data/donations';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { 
  Shirt, UtensilsCrossed, Armchair, BookOpen, Package, 
  Gift, Users, Heart, ArrowLeft, TrendingUp, HelpCircle, Lightbulb, MessageCircle
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
  const navigate = useNavigate();

  const handleDonateClick = () => {
    if (user) {
      navigate('/add-donation');
    } else {
      navigate('/login');
    }
  };
  
  const categories = [
    { name: 'ملابس', icon: Shirt, color: 'bg-blue-500', count: donations.filter(d => d.category === 'ملابس').length },
    { name: 'طعام', icon: UtensilsCrossed, color: 'bg-green-500', count: donations.filter(d => d.category === 'طعام').length },
    { name: 'أثاث', icon: Armchair, color: 'bg-purple-500', count: donations.filter(d => d.category === 'أثاث').length },
    { name: 'كتب', icon: BookOpen, color: 'bg-orange-500', count: donations.filter(d => d.category === 'كتب').length },
    { name: 'أخرى', icon: Package, color: 'bg-pink-500', count: donations.filter(d => d.category === 'أخرى').length },
  ];

  const stats = [
    { label: 'إجمالي التبرعات', value: '2,340', icon: Gift, color: 'text-primary' },
    { label: 'المتطوعون النشطون', value: '156', icon: Users, color: 'text-secondary' },
    { label: 'مشاركات المجتمع', value: '4,521', icon: MessageCircle, color: 'text-pink-500' },
  ];

  const urgentDonations = donations.filter(d => d.urgency === 'عالية').slice(0, 3);

  const slideUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.7, ease: "easeOut" as const }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div {...slideUp} className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight md:leading-tight">
              منصة واحدة لكل أنواع العطاء
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              تبرع بالأغراض الفائضة، واطلب المساعدة، وشارك كمتطوع، وتفاعل مع مجتمعك في مكان واحد. خطوة بسيطة منك تصنع أثراً كبيراً.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleDonateClick} className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto shadow-lg hover:shadow-primary/50 transition-all text-md px-8 py-6 rounded-full">
                <Gift className="ml-2 h-5 w-5" />
                تبرع الآن
              </Button>
              <Link to="/community" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 w-full sm:w-auto shadow-sm hover:shadow-md transition-all text-md px-8 py-6 rounded-full">
                  <MessageCircle className="ml-2 h-5 w-5" />
                  اطلب مساعدة
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section / Platform Benefits */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">أثرنـا في المجتمع</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">نسعى دائماً لتوسيع دائرة الخير وإيصال الدعم لمن يستحقه عبر شبكة متكاملة من المتبرعين والمتطوعين.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-10 max-w-5xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  key={index}
                >
                  <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-b from-card to-accent/20">
                    <CardContent className="p-8 flex flex-col items-center text-center">
                      <div className={`p-5 rounded-3xl bg-white shadow-sm dark:bg-gray-900 mb-6 ${stat.color}`}>
                        <Icon className="h-10 w-10" />
                      </div>
                      <p className="text-4xl font-black mb-2">{stat.value}</p>
                      <p className="text-base text-muted-foreground font-medium">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 md:py-24 bg-accent/30 dark:bg-accent/10">
        <div className="container mx-auto px-4">
          <motion.div {...slideUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">كيف تعمل المنصة؟</h2>
            <p className="text-muted-foreground">خطوات بسيطة تجمع بين الحاجة والعطاء</p>
          </motion.div>
          <motion.div {...slideUp} transition={{ duration: 0.5, delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto text-2xl font-bold">1</div>
              <h3 className="text-xl font-bold">إنشاء حساب</h3>
              <p className="text-sm text-muted-foreground">سجل الدخول لتتمكن من الوصول للوحة التحكم الشاملة.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-secondary/20 text-secondary flex items-center justify-center mx-auto text-2xl font-bold">2</div>
              <h3 className="text-xl font-bold">تصفح وتفاعل</h3>
              <p className="text-sm text-muted-foreground">تصفح التبرعات، أو انشر طلباً في مجتمع الدعم.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-pink-500/20 text-pink-500 flex items-center justify-center mx-auto text-2xl font-bold">3</div>
              <h3 className="text-xl font-bold">تواصل آمن</h3>
              <p className="text-sm text-muted-foreground">استخدم نظام المحادثات لترتيب تبادل التبرع أو المساعدة.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto text-2xl font-bold">4</div>
              <h3 className="text-xl font-bold">تأكيد وانجاز</h3>
              <p className="text-sm text-muted-foreground">أكد الاستلام وتتبع كافة نشاطاتك من لوحة التحكم.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories & Community Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <motion.div {...slideUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">مجالات التبرع</h2>
            <p className="text-muted-foreground">اختر الفئة التي ترغب في التبرع بها أو الحصول عليها</p>
          </motion.div>
          <motion.div {...slideUp} transition={{ duration: 0.5, delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6 mb-16">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.name} to={`/donations?category=${category.name}`}>
                  <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-primary/50 bg-card/80 backdrop-blur-sm h-full">
                    <CardContent className="p-4 md:p-6 text-center flex flex-col justify-center h-full">
                      <div className={`${category.color} w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md`}>
                        <Icon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                      </div>
                      <h3 className="mb-2 font-bold text-sm md:text-lg">{category.name}</h3>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-0 mt-auto mx-auto font-medium">
                        {category.count} عنصر
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </motion.div>

          <motion.div {...slideUp} className="flex flex-col md:flex-row items-center justify-between bg-primary text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 max-w-2xl mb-8 md:mb-0 md:pl-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">مجتمع الدعم والمساعدة</h3>
              <p className="text-primary-foreground/90 text-lg mb-6 leading-relaxed">
                هل تحتاج لخدمة معينة، مساعدة في نقل أثاث، أو طلب استشارة؟ مجتمعنا جاهز لتقديم العون بعيداً عن التبرعات العينية فقط.
              </p>
              <Link to="/community">
                <Button variant="secondary" size="lg" className="rounded-full px-8 shadow-lg font-bold">
                  تصفح طلبات المجتمع
                </Button>
              </Link>
            </div>
            <div className="relative z-10 shrink-0">
              <Users className="w-32 h-32 md:w-48 md:h-48 text-white/20" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Urgent Needs (Preserved existing feature) */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div {...slideUp} className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                <Lightbulb className="text-secondary w-8 h-8"/> 
                احتياجات عاجلة
              </h2>
              <p className="text-muted-foreground text-lg">تبرعات تتطلب اهتمام فوري وحملات سريعة الاستجابة</p>
            </div>
            <Link to="/donations?urgency=عالية" className="shrink-0">
              <Button variant="outline" className="rounded-full shadow-sm hover:shadow">
                عرض الكل
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
          <motion.div {...slideUp} transition={{ duration: 0.5, delay: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {urgentDonations.map((donation) => (
              <Link key={donation.id} to={`/donations/${donation.id}`}>
                <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer h-full flex flex-col group border-primary/10">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={donation.image}
                      alt={donation.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                       <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 shadow-lg px-3 py-1 text-sm">
                         عاجل
                       </Badge>
                    </div>
                    <Button
                      size="icon"
                      variant="secondary"
                      className={`absolute top-4 left-4 h-10 w-10 rounded-full bg-white backdrop-blur shadow-md hover:bg-gray-100 ${
                        user?.wishlist?.includes(donation.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(donation.id);
                      }}
                    >
                      <Heart className={`h-5 w-5 ${user?.wishlist?.includes(donation.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                  <CardHeader className="pt-6">
                    <CardTitle className="line-clamp-2 text-xl leading-tight group-hover:text-primary transition-colors">{donation.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-2 text-base">{donation.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-4 pb-6 border-t border-accent/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={donation.donor.avatar}
                          alt={donation.donor.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-background shadow-sm"
                        />
                        <span className="text-sm font-medium text-foreground">{donation.donor.name}</span>
                      </div>
                      <Badge variant="outline" className="border-secondary/50 text-secondary bg-secondary/5 px-2.5 py-1">
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

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-accent/30 dark:bg-accent/10 border-y border-border/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div {...slideUp} className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 text-primary">
               <HelpCircle className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">الأسئلة الشائعة</h2>
            <p className="text-muted-foreground text-lg mb-8">إجابات على استفساراتك حول كيفية عمل المنصة وإدارتها.</p>
          </motion.div>
          
          <motion.div {...slideUp} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card className="shadow-lg border-0 bg-card p-2 md:p-6 rounded-3xl">
              <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-base md:text-lg font-bold py-6 px-4 hover:no-underline hover:text-primary transition-colors">
                  كيف تعمل عملية التبرع واستلام المواد؟
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base px-4 pb-6 leading-relaxed">
                  ببساطة، يقوم المتبرع بإضافة التبرع مع تفاصيله والمدينة. يمكن للمستفيد استعراض التبرعات أو تصفيتها، وحين يجد ما يناسبه يضغط على "طلب مساعدة". تصل رسالة إشعار للمتبرع لبدء محادثة ترتيب عملية التسليم.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-base md:text-lg font-bold py-6 px-4 hover:no-underline hover:text-primary transition-colors">
                  ما هي آلية موافقة الإدارة على التبرعات والطلبات؟
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base px-4 pb-6 leading-relaxed">
                  لضمان الجودة والأمان، جميع التبرعات تمر أولاً بـ "قيد المراجعة" في لوحة تحكم الأدمن. بعد التأكد من وضوح الصورة وتفاصيل التبرع وعدم وجود مخالفات، تتم الموافقة ويظهر في قائمة التبرعات العامة للجميع.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-base md:text-lg font-bold py-6 px-4 hover:no-underline hover:text-primary transition-colors">
                  ما هو مجتمع الطلبات (Community Feed)؟
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base px-4 pb-6 leading-relaxed">
                  هو مساحة اجتماعية مخصصة للمستخدمين الذين يحتاجون إلى مساعدة ولا يجدونها معروضة بشكل صريح في قائمة التبرعات. يمكنك كتابة طلبك (عيني، معنوي، أو مساعدة تطوعية) وسيقوم المجتمع بالرد عليك في التعليقات أو التواصل المباشر.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-base md:text-lg font-bold py-6 px-4 hover:no-underline hover:text-primary transition-colors">
                  كيف يمكنني التطوع في المنصة؟
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base px-4 pb-6 leading-relaxed">
                  من خلال صفحة "التطوع"، نقوم بنشر مهام مثل (تنظيم المعارض الخيرية، توزيع طرود رمضان، مساعدة في الإيصال المهني). يمكنك بضغطة زر التسجيل كمشارك، وسيتم احتساب ساعاتك التطوعية في ملفك الشخصي.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-b-0">
                <AccordionTrigger className="text-base md:text-lg font-bold py-6 px-4 hover:no-underline hover:text-primary transition-colors">
                  كيف يمكنني تتبع حالة تبرعاتي؟
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base px-4 pb-6 leading-relaxed">
                  من خلال "لوحة التحكم" المخصصة لك، ستجد قسم "تبرعاتي" وقسم "طلباتي". يمكنك رؤية الحالات بشكل مباشر (قيد المراجعة، متاح، تم التسليم) وتعديل أو حذف التبرعات بكل سهولة.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary via-primary/90 to-secondary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
        <motion.div {...slideUp} className="container mx-auto px-4 text-center relative z-10">
          <Heart className="h-20 w-20 mx-auto mb-8 fill-white/80 animate-pulse drop-shadow-xl" />
          <h2 className="text-4xl md:text-5xl font-black mb-6 drop-shadow-md">كن جزءاً من التغيير اليوم</h2>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90 font-medium">
            انضم إلى آلاف المتطوعين والمتبرعين في صنع فرق حقيقي في حياة الآخرين. عطاؤك يصنع مستقبلاً أفضل.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/volunteer" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto px-10 py-6 text-lg rounded-full shadow-2xl hover:shadow-secondary/50 hover:-translate-y-1 transition-all">
                <Users className="ml-2 h-6 w-6" />
                انضم كمتطوع
              </Button>
            </Link>
            <Button size="lg" variant="outline" onClick={handleDonateClick} className="bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 w-full sm:w-auto px-10 py-6 text-lg rounded-full shadow-2xl hover:-translate-y-1 transition-all">
              <Gift className="ml-2 h-6 w-6" />
              أريد تقديم تبرع
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}