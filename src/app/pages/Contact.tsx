import { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle2, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { useLanguage } from '../context/LanguageContext';

export function Contact() {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen py-16 md:py-24 bg-gradient-to-br from-background to-secondary/5">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('nav.contact')}
          </h1>
          <p className="text-lg text-muted-foreground">
            نحن هنا للإجابة على استفساراتكم ودعمكم في مسيرة العطاء. لا تترددوا في التواصل معنا.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-8 items-start">
          {/* Contact Details (2 columns on md) */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-card shadow-sm border-0 border-l-4 border-l-primary">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full text-primary shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">البريد الإلكتروني</h3>
                  <p className="text-muted-foreground text-sm">support@donationplatform.com</p>
                  <p className="text-muted-foreground text-sm">info@donationplatform.com</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-sm border-0 border-l-4 border-l-secondary">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 bg-secondary/10 rounded-full text-secondary shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">الهاتف</h3>
                  <p className="text-muted-foreground text-sm">+962 12 345 6789</p>
                  <p className="text-xs text-muted-foreground mt-1">متوفر من الأحد إلى الخميس (9 ص - 5 م)</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-sm border-0 border-l-4 border-l-pink-500">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 bg-pink-500/10 rounded-full text-pink-500 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">الموقع</h3>
                  <p className="text-muted-foreground text-sm">عمان، الأردن</p>
                  <p className="text-muted-foreground text-sm">مجمع الأعمال، مبنى 4</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form (3 columns on md) */}
          <div className="md:col-span-3">
            <Card className="shadow-lg border-primary/10">
              <CardContent className="p-6 md:p-8">
                {isSuccess ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">تم الإرسال بنجاح!</h2>
                    <p className="text-muted-foreground mb-6">
                      شكراً لتواصلك معنا. سيقوم فريقنا بالرد عليك في أقرب وقت ممكن.
                    </p>
                    <Button onClick={() => setIsSuccess(false)} variant="outline">
                      إرسال رسالة أخرى
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">الاسم الكامل *</Label>
                        <Input id="name" required placeholder="أدخل اسمك" className="bg-background" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">البريد الإلكتروني *</Label>
                        <Input id="email" type="email" required placeholder="example@email.com" className="bg-background" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">الموضوع (اختياري)</Label>
                      <Input id="subject" placeholder="عن ماذا تود التحدث؟" className="bg-background" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">الرسالة *</Label>
                      <Textarea 
                        id="message" 
                        required 
                        placeholder="اكتب رسالتك أو استفسارك هنا..." 
                        rows={5}
                        className="bg-background resize-none"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full sm:w-auto px-8" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">جاري الإرسال...</span>
                      ) : (
                        <>
                          <Send className="ml-2 w-4 h-4" />
                          إرسال الرسالة
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
