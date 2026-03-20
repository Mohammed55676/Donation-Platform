import { Link } from 'react-router';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Heart, Search, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';

export function Requests() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('تم تقديم طلبك بنجاح! سنتواصل معك قريباً.');
      setIsSubmitting(false);
      setIsDialogOpen(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-6">
            <Heart className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl mb-4">طلب المساعدة</h1>
          <p className="text-muted-foreground text-lg mb-8">
            نحن هنا لمساعدتك. ابحث عن التبرعات المتاحة أو قدم طلباً مباشراً
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="text-right hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>تصفح التبرعات</CardTitle>
                <CardDescription>
                  ابحث في التبرعات المتاحة واطلب ما تحتاج
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/donations">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                    <Search className="ml-2 h-4 w-4" />
                    ابدأ البحث
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-right hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-3">
                  <Heart className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>تقديم طلب مباشر</CardTitle>
                <CardDescription>
                  قدم طلباً محدداً وسنساعدك في العثور على ما تحتاج
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-secondary text-secondary hover:bg-secondary/10"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Heart className="ml-2 h-4 w-4" />
                  تقديم طلب
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12">
            <Link to="/">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>تقديم طلب مباشر</DialogTitle>
            <DialogDescription>
              املأ النموذج أدناه وسنساعدك في العثور على ما تحتاج
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitRequest}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input id="name" placeholder="أدخل اسمك الكامل" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">رقم الجوال</Label>
                <Input id="phone" type="tel" placeholder="+966 5x xxx xxxx" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">الفئة</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clothes">ملابس</SelectItem>
                    <SelectItem value="food">طعام</SelectItem>
                    <SelectItem value="furniture">أثاث</SelectItem>
                    <SelectItem value="books">كتب</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">الموقع</Label>
                <Input id="location" placeholder="المدينة" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">وصف الاحتياج</Label>
                <Textarea
                  id="description"
                  placeholder="اشرح احتياجك بالتفصيل..."
                  className="min-h-[100px]"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-secondary hover:bg-secondary/90">
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}