import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Upload, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useDonations } from '../context/DonationContext';

type DonationErrors = {
  title?: string;
  description?: string;
  category?: string;
  condition?: string;
  location?: string;
  urgency?: string;
};

export function AddDonation() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const { addDonation } = useDonations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    location: '',
    urgency: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<DonationErrors>({});

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validate = (): DonationErrors => {
    const e: DonationErrors = {};
    if (!formData.title.trim()) {
      e.title = 'عنوان التبرع مطلوب';
    } else if (formData.title.trim().length < 5) {
      e.title = 'العنوان يجب أن يكون 5 أحرف على الأقل';
    }
    if (!formData.description.trim()) {
      e.description = 'الوصف مطلوب';
    } else if (formData.description.trim().length < 10) {
      e.description = 'الوصف يجب أن يكون 10 أحرف على الأقل';
    }
    if (!formData.category) e.category = 'يرجى اختيار الفئة';
    if (!formData.condition) e.condition = 'يرجى اختيار الحالة';
    if (!formData.location.trim()) {
      e.location = 'الموقع مطلوب';
    } else if (formData.location.trim().length < 2) {
      e.location = 'يرجى كتابة موقع صحيح';
    }
    if (!formData.urgency) e.urgency = 'يرجى اختيار مستوى الأولوية';
    return e;
  };

  const set = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!user) {
        toast.error('يجب تسجيل الدخول لإضافة تبرع');
        navigate('/login');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      addDonation({
        id: `d-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        condition: formData.condition as any,
        location: formData.location,
        urgency: formData.urgency as any,
        image: imagePreview || 'https://via.placeholder.com/500',
        donor: {
          name: user.name,
          avatar: user.avatar || '',
        },
        createdAt: new Date().toISOString().split('T')[0],
        status: 'قيد المراجعة'
      });

      addNotification({
        type: 'success',
        title: 'تم إرسال التبرع',
        message: 'تم إرسال تبرعك للمراجعة. سيتم نشره قريباً.',
      });
      toast.success('تم إرسال التبرع بنجاح بانتظار موافقة الإدارة');
      navigate('/donations');
    } catch (error) {
      toast.error('حدث خطأ أثناء إرسال التبرع');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="text-primary hover:underline flex items-center gap-1">
            <ArrowRight className="h-4 w-4" />
            رجوع
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl mb-2">إضافة تبرع جديد</h1>
          <p className="text-muted-foreground">شارك ما لديك مع من يحتاجه</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>معلومات التبرع</CardTitle>
            <CardDescription>يرجى ملء جميع الحقول بدقة لمساعدة المحتاجين في العثور على تبرعك</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <Label>صورة التبرع</Label>
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-12 h-12 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">اضغط لرفع صورة</span> أو اسحب الصورة هنا
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG أو JPEG (حد أقصى 5 ميجا)</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <Label htmlFor="title">عنوان التبرع *</Label>
                <Input
                  id="title"
                  placeholder="مثال: ملابس شتوية للأطفال بحالة ممتازة"
                  value={formData.title}
                  onChange={(e) => set('title', e.target.value)}
                  className={`mt-1 bg-background focus-visible:ring-primary ${errors.title ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <Label htmlFor="description">الوصف *</Label>
                <Textarea
                  id="description"
                  placeholder="اكتب وصفاً تفصيلياً للتبرع..."
                  value={formData.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={4}
                  className={`mt-1 bg-background focus-visible:ring-primary ${errors.description ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
              </div>

              {/* Category and Condition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>الفئة *</Label>
                  <Select value={formData.category} onValueChange={(v) => set('category', v)}>
                    <SelectTrigger className={`mt-1 bg-background focus:ring-primary ${errors.category ? 'border-destructive focus:ring-destructive' : ''}`}>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ملابس">ملابس</SelectItem>
                      <SelectItem value="طعام">طعام</SelectItem>
                      <SelectItem value="أثاث">أثاث</SelectItem>
                      <SelectItem value="كتب">كتب</SelectItem>
                      <SelectItem value="أخرى">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
                </div>

                <div className="space-y-1">
                  <Label>الحالة *</Label>
                  <Select value={formData.condition} onValueChange={(v) => set('condition', v)}>
                    <SelectTrigger className={`mt-1 bg-background focus:ring-primary ${errors.condition ? 'border-destructive focus:ring-destructive' : ''}`}>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="جديد">جديد</SelectItem>
                      <SelectItem value="جيد">جيد</SelectItem>
                      <SelectItem value="مستعمل">مستعمل</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.condition && <p className="text-xs text-destructive">{errors.condition}</p>}
                </div>
              </div>

              {/* Location and Urgency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="location">الموقع *</Label>
                  <Input
                    id="location"
                    placeholder="مثال: عمّان"
                    value={formData.location}
                    onChange={(e) => set('location', e.target.value)}
                    className={`mt-1 bg-background focus-visible:ring-primary ${errors.location ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
                </div>

                <div className="space-y-1">
                  <Label>مستوى الأولوية *</Label>
                  <Select value={formData.urgency} onValueChange={(v) => set('urgency', v)}>
                    <SelectTrigger className={`mt-1 bg-background focus:ring-primary ${errors.urgency ? 'border-destructive focus:ring-destructive' : ''}`}>
                      <SelectValue placeholder="اختر مستوى الأولوية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="عالية">عالية</SelectItem>
                      <SelectItem value="متوسطة">متوسطة</SelectItem>
                      <SelectItem value="منخفضة">منخفضة</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.urgency && <p className="text-xs text-destructive">{errors.urgency}</p>}
                </div>
              </div>

              {/* Info Card */}
              <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>سيتم مراجعة تبرعك من قبل فريقنا للتأكد من مطابقته لمعايير المنصة.</p>
                      <p>سيتم نشره خلال 24 ساعة من تقديمه.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-primary/50 transition-all" 
                  size="lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">جاري الإرسال...</span>
                  ) : (
                    <><CheckCircle className="ml-2 h-5 w-5" /> نشر التبرع</>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)} size="lg" disabled={isSubmitting}>
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
