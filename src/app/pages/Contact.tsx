import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';

export function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
  };

  const infos = [
    { icon: Phone, title: 'رقم الهاتف', value: '+962 7X XXXX XXX', color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' },
    { icon: Mail, title: 'البريد الإلكتروني', value: 'contact@donation.org', color: 'text-primary bg-primary/10' },
    { icon: MapPin, title: 'العنوان الرئيس', value: 'عمّان، الأردن - شارع مكة', color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' }
  ];

  return (
    <div className="min-h-screen bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">اتصل بنا</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            نحن هنا للإجابة على استفساراتكم ومساعدتكم. لا تترددوا في التواصل معنا في أي وقت.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info cards */}
          <div className="space-y-4">
            {infos.map((info, i) => {
              const Icon = info.icon;
              return (
                <motion.div key={info.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="border-border/50 shadow-sm">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${info.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-muted-foreground mb-0.5">{info.title}</p>
                        <p className="font-medium">{info.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
            <Card className="border-border/50 shadow-md">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>الاسم الكامل</Label>
                      <Input placeholder="أحمد محمد" required className="bg-muted/30" />
                    </div>
                    <div className="space-y-2">
                      <Label>البريد الإلكتروني</Label>
                      <Input type="email" placeholder="email@example.com" required className="bg-muted/30" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>موضوع الرسالة</Label>
                    <Input placeholder="استفسار عن التبرع" required className="bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label>الرسالة</Label>
                    <textarea 
                      className="w-full flex min-h-[120px] rounded-md border border-input bg-muted/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                      placeholder="اكتب رسالتك هنا..."
                      required
                    ></textarea>
                  </div>
                  <Button type="submit" className="w-full sm:w-auto h-11 px-8">
                    <Send className="me-2 h-4 w-4" /> إرسال الرسالة
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
