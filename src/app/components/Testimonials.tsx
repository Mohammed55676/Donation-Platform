import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Quote } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'سارة أحمد',
    role: 'متبرعة',
    content: 'منصة الخير سهلت علي الوصول للأشخاص المحتاجين فعلاً، تجربة التبرع سلسة وآمنة وتمنحك شعوراً رائعاً بالعطاء.',
    avatar: 'https://i.pravatar.cc/150?u=sara',
  },
  {
    id: 2,
    name: 'محمد عبدالله',
    role: 'مستفيد',
    content: 'بفضل هذه المنصة، تمكنت من الحصول على كرسي متحرك لوالدي في وقت قياسي. شكراً لكل من يساهم في هذا العمل النبيل.',
    avatar: 'https://i.pravatar.cc/150?u=mohammed',
  },
  {
    id: 3,
    name: 'فاطمة حسن',
    role: 'متطوعة',
    content: 'تجربة التطوع عبر المنصة غيرت نظرتي للمجتمع. التنظيم ممتاز والتواصل مع المتبرعين والمستفيدين راقي جداً.',
    avatar: 'https://i.pravatar.cc/150?u=fatima',
  },
];

export function Testimonials() {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            قصص نجاح وآراء المجتمع
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            استمع إلى تجارب الأشخاص الذين صنعوا فرقاً أو استفادوا من العطاء عبر منصة الخير.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow bg-background relative overflow-hidden rounded-3xl">
                <CardContent className="p-8">
                  <Quote className="h-10 w-10 text-primary/10 absolute top-6 start-6" />
                  <div className="relative z-10">
                    <p className="text-muted-foreground leading-relaxed mb-8 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-4 mt-auto">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                      />
                      <div>
                        <h4 className="font-bold text-sm">{testimonial.name}</h4>
                        <p className="text-xs text-primary font-medium">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
