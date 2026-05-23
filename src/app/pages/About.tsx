import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { Heart, Target, Lightbulb, Users } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

export function About() {
  const { t } = useLanguage();

  const slideUp = {
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: "easeOut" as const }
  };

  const values = [
    { icon: Target, title: 'رسالتنا', desc: 'نهدف إلى تحقيق التكافل الاجتماعي من خلال تسهيل عملية التبرع.', color: 'text-primary bg-primary/10' },
    { icon: Lightbulb, title: 'رؤيتنا', desc: 'بناء مجتمع متعاون لا يُترك فيه محتاج بلا مساعدة.', color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' },
    { icon: Heart, title: 'قيمنا', desc: 'الشفافية، التعاطف، المساواة، والمصداقية في إيصال الدعم لمستحقيه.', color: 'text-pink-500 bg-pink-100 dark:bg-pink-900/30' },
    { icon: Users, title: 'فريقنا', desc: 'مجموعة من المتطوعين الشغوفين بصناعة أثر إيجابي في المجتمع.', color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 pt-20 pb-28">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div {...slideUp} className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
              <Heart className="h-4 w-4 fill-current" />
              عن المنصة
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
              من نحن
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              منصة التبرعات الخيرية هي جسر يربط بين أصحاب القلوب الرحيمة والمحتاجين، لتقديم الدعم من ملابس وطعام وأثاث وكل ما يُسهم في إغاثة الملهوف وصناعة الفرح.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div 
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
              >
                <Card className="h-full border-none card-shadow rounded-3xl hover:shadow-lg transition-all hover:shadow-primary/10">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${v.color}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{v.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </section>
    </div>
  );
}
