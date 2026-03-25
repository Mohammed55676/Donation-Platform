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

export function AddDonation() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    location: '',
    urgency: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.description || !formData.category || 
        !formData.condition || !formData.location || !formData.urgency) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // Simulate submission
    addNotification({
      type: 'success',
      title: 'تم إضافة التبرع بنجاح!',
      message: `تم إضافة تبرع جديد: ${formData.title}`,
    });
    
    setTimeout(() => {
      navigate('/donations');
    }, 1500);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="text-primary hover:underline flex items-center gap-1"
          >
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
            <CardDescription>
              يرجى ملء جميع الحقول بدقة لمساعدة المحتاجين في العثور على تبرعك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <Label>صورة التبرع *</Label>
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-12 h-12 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">اضغط لرفع صورة</span> أو اسحب الصورة هنا
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG أو JPEG (حد أقصى 5 ميجا)</p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title">عنوان التبرع *</Label>
                <Input
                  id="title"
                  placeholder="مثال: ملابس شتوية للأطفال"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-2"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">الوصف *</Label>
                <Textarea
                  id="description"
                  placeholder="اكتب وصفاً تفصيلياً للتبرع..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="mt-2"
                />
              </div>

              {/* Category and Condition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">الفئة *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="mt-2">
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
                </div>

                <div>
                  <Label htmlFor="condition">الحالة *</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) => setFormData({ ...formData, condition: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="جديد">جديد</SelectItem>
                      <SelectItem value="جيد جداً">جيد جداً</SelectItem>
                      <SelectItem value="جيد">جيد</SelectItem>
                      <SelectItem value="مستعمل">مستعمل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location and Urgency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">الموقع *</Label>
                  <Input
                    id="location"
                    placeholder="مثال: الرياض"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="urgency">مستوى الأولوية *</Label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="اختر مستوى الأولوية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="عالية">عالية</SelectItem>
                      <SelectItem value="متوسطة">متوسطة</SelectItem>
                      <SelectItem value="منخفضة">منخفضة</SelectItem>
                    </SelectContent>
                  </Select>
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
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  size="lg"
                >
                  <CheckCircle className="ml-2 h-5 w-5" />
                  نشر التبرع
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  size="lg"
                >
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
