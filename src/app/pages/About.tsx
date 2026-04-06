import { Heart, Users, Gift, MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Link } from 'react-router';
import { useLanguage } from '../context/LanguageContext';

export function About() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
              <Heart className="h-8 w-8 text-white fill-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('nav.about')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            مشروع تخرج يهدف إلى رقمنة وتسهيل العمل الخيري من خلال بناء منصة متكاملة تجمع بين المتبرعين، والمحتاجين، والمتطوعين في مكان واحد لتعزيز التكافل الاجتماعي.
          </p>
        </div>

        {/* Mission and Vision Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          <Card className="bg-primary/5 border-primary/20 hover:shadow-lg transition-all dark:bg-card">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-primary flex items-center gap-2">
                رسالتنا
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                توفير بيئة رقمية آمنة وشفافة تسهل عملية التبرع وتضمن وصول المساعدات إلى مستحقيها بسرعة وكفاءة، بالإضافة إلى إشراك فئات المجتمع في الأعمال التطوعية.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-secondary/5 border-secondary/20 hover:shadow-lg transition-all dark:bg-card">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-secondary flex items-center gap-2">
                رؤيتنا
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                أن نكون المنصة الرائدة في المملكة الداعمة للمبادرات المجتمعية، والتي تحول كل رغبة في العطاء إلى أثر ملموس يغير حياة الأفراد والمجتمعات نحو الأفضل.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Core Pillars */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">كيف تعمل المنصة؟</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:-translate-y-2 transition-transform duration-300">
              <CardContent className="pt-6">
                <Gift className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">التبرعات</h3>
                <p className="text-sm text-muted-foreground">قدم الفائض عن حاجتك أو اطلب ما ينقصك بسهولة ويسر.</p>
              </CardContent>
            </Card>
            <Card className="text-center hover:-translate-y-2 transition-transform duration-300">
              <CardContent className="pt-6">
                <Users className="w-12 h-12 mx-auto text-secondary mb-4" />
                <h3 className="text-xl font-bold mb-2">التطوع</h3>
                <p className="text-sm text-muted-foreground">استثمر وقتك واصنع أثراً إيجابياً عبر الفرص المتاحة.</p>
              </CardContent>
            </Card>
            <Card className="text-center hover:-translate-y-2 transition-transform duration-300">
              <CardContent className="pt-6">
                <MessageCircle className="w-12 h-12 mx-auto text-pink-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">المجتمع</h3>
                <p className="text-sm text-muted-foreground">ساحة تفاعلية لطرح الاحتياجات وبناء شبكة دعم اجتماعي.</p>
              </CardContent>
            </Card>
            <Card className="text-center hover:-translate-y-2 transition-transform duration-300">
              <CardContent className="pt-6">
                <Heart className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">الدعم</h3>
                <p className="text-sm text-muted-foreground">واجهة مخصصة لمتابعة تبرعاتك وإدارة أنشطتك بسلاسة.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-accent/30 rounded-3xl p-10 md:p-16 max-w-4xl mx-auto shadow-inner">
          <h2 className="text-3xl font-bold mb-4">هل أنت مستعد للمشاركة؟</h2>
          <p className="text-lg text-muted-foreground mb-8">
            كن جزءاً من الحل وانضم إلى المنصة الآن.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto px-8">
                {t('nav.signup')}
              </Button>
            </Link>
            <Link to="/donations">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 border-primary text-primary hover:bg-primary/5">
                تصفح التبرعات
                <ArrowLeft className="mr-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
