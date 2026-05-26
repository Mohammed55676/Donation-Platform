import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Upload, ArrowRight, CheckCircle, ChevronLeft, ChevronRight, Image as ImageIcon, MapPin } from 'lucide-react';
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
  image?: string;
};

export function AddDonation() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const { addDonation } = useDonations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    location: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<DonationErrors>({});

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setErrors(prev => ({ ...prev, image: undefined }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    const e: DonationErrors = {};
    if (!formData.title.trim()) e.title = 'عنوان التبرع مطلوب';
    else if (formData.title.trim().length < 5) e.title = 'العنوان يجب أن يكون 5 أحرف على الأقل';
    
    if (!formData.description.trim()) e.description = 'الوصف مطلوب';
    else if (formData.description.trim().length < 10) e.description = 'الوصف يجب أن يكون 10 أحرف على الأقل';
    
    if (!formData.category) e.category = 'يرجى اختيار الفئة';
    if (!formData.condition) e.condition = 'يرجى اختيار الحالة';
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: DonationErrors = {};
    if (!formData.location.trim()) e.location = 'الموقع مطلوب';
    else if (formData.location.trim().length < 2) e.location = 'يرجى كتابة موقع صحيح';
    
    if (!imagePreview) e.image = 'صورة التبرع مطلوبة';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const set = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (!user) {
        toast.error('يجب تسجيل الدخول لإضافة تبرع');
        navigate('/login');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      addDonation({
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        condition: formData.condition as any,
        location: formData.location,
        urgency: 'متوسطة' as any,
        image: imagePreview || 'https://via.placeholder.com/500',
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
    <div className="min-h-screen py-10 bg-muted/20">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="text-primary hover:underline flex items-center gap-1 font-medium">
            <ArrowRight className="h-4 w-4" />
            العودة
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">إضافة تبرع جديد</h1>
          <p className="text-muted-foreground">شارك ما لديك مع من يحتاجه</p>
        </div>

        {/* Progress Tracker */}
        <div className="mb-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-border/60 -translate-y-1/2 rounded-full z-0" />
          <div 
            className="absolute top-1/2 right-0 h-1 bg-gradient-to-r from-secondary to-primary -translate-y-1/2 rounded-full z-0 transition-all duration-500 ease-in-out" 
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
          
          <div className="relative z-10 flex justify-between">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors duration-300 ${
                  step >= num ? 'bg-primary text-white shadow-primary/30' : 'bg-card border border-border/60 text-muted-foreground'
                }`}>
                  {step > num ? <CheckCircle className="h-5 w-5" /> : num}
                </div>
                <span className={`text-xs font-semibold ${step >= num ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {num === 1 ? 'المعلومات' : num === 2 ? 'الموقع والصورة' : 'المراجعة'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Card className="border-none shadow-xl bg-card rounded-3xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h3 className="text-xl font-bold mb-1">المعلومات الأساسية</h3>
                  <p className="text-sm text-muted-foreground mb-6">أخبرنا المزيد عن التبرع الذي تود تقديمه.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="font-semibold">عنوان التبرع <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    placeholder="مثال: ملابس شتوية للأطفال بحالة ممتازة"
                    value={formData.title}
                    onChange={(e) => set('title', e.target.value)}
                    className={`h-12 bg-background focus-visible:ring-primary rounded-xl ${errors.title ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="font-semibold">الوصف <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="description"
                    placeholder="اكتب وصفاً تفصيلياً للتبرع..."
                    value={formData.description}
                    onChange={(e) => set('description', e.target.value)}
                    rows={4}
                    className={`bg-background focus-visible:ring-primary rounded-xl resize-none ${errors.description ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="font-semibold">الفئة <span className="text-destructive">*</span></Label>
                    <Select value={formData.category} onValueChange={(v) => set('category', v)}>
                      <SelectTrigger className={`h-12 bg-background focus:ring-primary rounded-xl ${errors.category ? 'border-destructive focus:ring-destructive' : ''}`}>
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ملابس">ملابس</SelectItem>
                        <SelectItem value="طعام">طعام</SelectItem>
                        <SelectItem value="أثاث">أثاث</SelectItem>
                        <SelectItem value="كتب">كتب</SelectItem>
                        <SelectItem value="مستلزمات طبية">مستلزمات طبية</SelectItem>
                        <SelectItem value="أخرى">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold">الحالة <span className="text-destructive">*</span></Label>
                    <Select value={formData.condition} onValueChange={(v) => set('condition', v)}>
                      <SelectTrigger className={`h-12 bg-background focus:ring-primary rounded-xl ${errors.condition ? 'border-destructive focus:ring-destructive' : ''}`}>
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
              </div>
            )}

            {/* Step 2: Location & Image */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h3 className="text-xl font-bold mb-1">الموقع والصورة</h3>
                  <p className="text-sm text-muted-foreground mb-6">حدد موقع الاستلام وأرفق صورة واضحة للتبرع.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="font-semibold">الموقع <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <MapPin className="absolute end-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                    <Input
                      id="location"
                      placeholder="مثال: عمّان، الأردن"
                      value={formData.location}
                      onChange={(e) => set('location', e.target.value)}
                      className={`h-12 pe-12 bg-background focus-visible:ring-primary rounded-xl ${errors.location ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                  </div>
                  {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">صورة التبرع <span className="text-destructive">*</span></Label>
                  <label className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer hover:bg-muted/50 transition-colors ${errors.image ? 'border-destructive bg-destructive/5' : 'border-border/60 bg-background'}`}>
                    {imagePreview ? (
                      <div className="relative w-full h-full p-2">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                          <span className="text-white font-medium flex items-center gap-2 bg-black/50 px-4 py-2 rounded-lg">
                            <ImageIcon className="h-4 w-4" /> تغيير الصورة
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                          <Upload className="w-8 h-8 text-primary" />
                        </div>
                        <p className="mb-2 text-sm text-foreground">
                          <span className="font-bold">اضغط لرفع صورة</span> أو اسحب الصورة هنا
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG أو JPEG (حد أقصى 5 ميجا)</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                  {errors.image && <p className="text-xs text-destructive">{errors.image}</p>}
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h3 className="text-xl font-bold mb-1">مراجعة التبرع</h3>
                  <p className="text-sm text-muted-foreground mb-6">تأكد من صحة المعلومات قبل النشر.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-6 bg-muted/30 p-4 sm:p-6 rounded-2xl border border-border/40">
                  <div className="w-full md:w-1/3 shrink-0 h-48 md:h-auto rounded-xl overflow-hidden shadow-sm">
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="text-lg font-bold text-primary">{formData.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{formData.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm pt-2 border-t border-border/60">
                      <div>
                        <span className="block text-muted-foreground mb-1 text-xs">الفئة</span>
                        <span className="font-semibold bg-secondary/10 text-secondary px-2 py-1 rounded-md">{formData.category}</span>
                      </div>
                      <div>
                        <span className="block text-muted-foreground mb-1 text-xs">الحالة</span>
                        <span className="font-semibold bg-primary/10 text-primary px-2 py-1 rounded-md">{formData.condition}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-muted-foreground mb-1 text-xs">الموقع</span>
                        <span className="font-semibold flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {formData.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Card */}
                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 p-4 rounded-xl flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1 text-sm text-emerald-800 dark:text-emerald-300">
                    <p className="font-semibold">جاهز للنشر!</p>
                    <p>سيتم نشر تبرعك فوراً بعد المراجعة السريعة (خلال 24 ساعة).</p>
                  </div>
                </div>
              </div>
            )}

          </CardContent>

          {/* Navigation Controls */}
          <div className="bg-muted/30 p-4 sm:p-6 border-t border-border/40 flex justify-between items-center">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep} className="font-semibold rounded-xl" disabled={isSubmitting}>
                <ChevronRight className="h-4 w-4 ms-1" /> السابق
              </Button>
            ) : (
              <div /> // Placeholder to keep the Next button aligned to the left (RTL)
            )}

            {step < 3 ? (
              <Button type="button" onClick={nextStep} className="font-semibold rounded-xl bg-primary text-white shadow-md hover:shadow-primary/30">
                التالي <ChevronLeft className="h-4 w-4 me-1" />
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="font-semibold rounded-xl bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-primary/40 px-8" 
              >
                {isSubmitting ? 'جاري الإرسال...' : (
                  <><CheckCircle className="ms- h-5 w-5" /> نشر التبرع</>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
