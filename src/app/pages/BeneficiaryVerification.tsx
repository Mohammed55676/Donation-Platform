/**
 * BeneficiaryVerification.tsx
 *
 * Full-page form for beneficiaries to submit their verification profile.
 * Collects: personal info, income, housing, needs, proof documents.
 * Requires consent before submission.
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import {
  Loader2, Upload, FileImage, AlertCircle, CheckCircle, ShieldCheck,
  ArrowRight, X,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const NEEDS_OPTIONS = ['طعام', 'ملابس', 'أثاث', 'مستلزمات طبية', 'كتب', 'إلكترونيات', 'أخرى'];

export function BeneficiaryVerification() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const proofInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Form fields
  const [nationalIdNumber, setNationalIdNumber] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [familyMembers, setFamilyMembers] = useState('');
  const [incomeRange, setIncomeRange] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [housingStatus, setHousingStatus] = useState('');
  const [rentRange, setRentRange] = useState('');
  const [socialSecurity, setSocialSecurity] = useState('');
  const [nafSupport, setNafSupport] = useState('');
  const [situation, setSituation] = useState('');
  const [needsCategories, setNeedsCategories] = useState<string[]>([]);
  const [deliveryAbility, setDeliveryAbility] = useState('');
  const [consent, setConsent] = useState(false);
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing profile
  useEffect(() => {
    api.get('/beneficiary/profile')
      .then(res => {
        const p = res.data.data;
        if (p) {
          setExistingProfile(p);
          setNationalIdNumber(p.national_id_number || '');
          setPhone(p.phone || user?.phone || '');
          setCity(p.city || '');
          setAddress(p.address || '');
          setFamilyMembers(p.family_members?.toString() || '');
          setIncomeRange(p.monthly_income_range || '');
          setEmploymentStatus(p.employment_status || '');
          setHousingStatus(p.housing_status || '');
          setRentRange(p.monthly_rent_range || '');
          setSocialSecurity(p.social_security_status || '');
          setNafSupport(p.naf_support_status || '');
          setSituation(p.situation_explanation || '');
          setNeedsCategories(p.needs_categories || []);
          setDeliveryAbility(p.delivery_ability || '');
          setConsent(p.consent_given || false);
        } else {
          setPhone(user?.phone || '');
        }
      })
      .catch(() => {
        setProfileLoading(false);
      })
      .finally(() => setProfileLoading(false));
  }, [user?.id]);

  const handleIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrors(prev => ({ ...prev, idFile: 'يُرجى رفع صورة بصيغة JPEG أو PNG أو WebP.' }));
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, idFile: 'حجم الملف يتجاوز 3 ميجابايت.' }));
      return;
    }
    setIdFile(file);
    setErrors(prev => ({ ...prev, idFile: '' }));
    const reader = new FileReader();
    reader.onload = () => setIdPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleProofFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + proofFiles.length > 5) {
      toast.error('الحد الأقصى 5 ملفات مثبتة');
      return;
    }
    setProofFiles(prev => [...prev, ...files]);
  };

  const removeProofFile = (index: number) => {
    setProofFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleNeed = (need: string) => {
    setNeedsCategories(prev =>
      prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]
    );
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!nationalIdNumber.trim()) e.nationalId = 'رقم الهوية الوطنية مطلوب.';
    else if (nationalIdNumber.trim().length !== 10) e.nationalId = 'رقم الهوية يجب أن يتكون من 10 أرقام.';
    if (!existingProfile && !idFile) e.idFile = 'يجب رفع صورة وثيقة الهوية.';
    if (!phone.trim()) e.phone = 'رقم الهاتف مطلوب.';
    if (!city.trim()) e.city = 'المدينة / المنطقة مطلوبة.';
    if (!consent) e.consent = 'يجب الموافقة على شروط استخدام البيانات.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Scroll to first error
      const firstKey = Object.keys(errs)[0];
      document.getElementById(firstKey)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append('national_id_number', nationalIdNumber.trim());
      if (idFile) formData.append('national_id_document', idFile);
      formData.append('phone', phone.trim());
      formData.append('city', city.trim());
      formData.append('address', address.trim());
      if (familyMembers) formData.append('family_members', familyMembers);
      if (incomeRange) formData.append('monthly_income_range', incomeRange);
      if (employmentStatus) formData.append('employment_status', employmentStatus);
      if (housingStatus) formData.append('housing_status', housingStatus);
      if (rentRange) formData.append('monthly_rent_range', rentRange);
      if (socialSecurity) formData.append('social_security_status', socialSecurity);
      if (nafSupport) formData.append('naf_support_status', nafSupport);
      if (situation) formData.append('situation_explanation', situation);
      if (needsCategories.length > 0) formData.append('needs_categories', JSON.stringify(needsCategories));
      if (deliveryAbility) formData.append('delivery_ability', deliveryAbility);
      formData.append('consent_given', 'true');

      proofFiles.forEach(f => formData.append('proof_documents', f));

      await api.post('/beneficiary/profile', formData);

      setSubmitted(true);
      toast.success('تم إرسال طلب التحقق بنجاح!');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'حدث خطأ أثناء إرسال البيانات.';
      setErrors({ general: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-xl rounded-3xl text-center">
          <CardContent className="p-8 space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">تم إرسال طلب التحقق ✅</h2>
              <p className="text-muted-foreground">
                سيراجع فريق الإدارة بياناتك في أقرب وقت. ستتمكن من طلب التبرعات عند الموافقة.
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/dashboard')} className="flex-1">
                لوحة التحكم
              </Button>
              <Button variant="outline" onClick={() => navigate('/donations')} className="flex-1">
                تصفح التبرعات
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rejectionReason = existingProfile?.verification_rejection_reason;
  const currentStatus = existingProfile?.verification_status;

  return (
    <div className="min-h-screen py-8 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="text-primary hover:underline flex items-center gap-1 text-sm">
            <ArrowRight className="h-4 w-4" />
            رجوع
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">ملف التحقق من المستفيد</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            أكمل بيانات التحقق لتتمكن من طلب التبرعات. المعلومات الحساسة مرئية للإدارة فقط.
          </p>
        </div>

        {/* Status notices */}
        {rejectionReason && (
          <div className="flex gap-2 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl mb-6">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-400 mb-0.5">سبب الرفض السابق:</p>
              <p className="text-sm text-red-600 dark:text-red-300">{rejectionReason}</p>
            </div>
          </div>
        )}

        {currentStatus === 'pending_review' && (
          <div className="flex gap-2 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl mb-6">
            <Loader2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5 animate-spin" />
            <div>
              <p className="font-semibold text-blue-700 dark:text-blue-400">طلبك قيد المراجعة</p>
              <p className="text-sm text-blue-600 dark:text-blue-300">يمكنك تعديل بياناتك أثناء الانتظار.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General error */}
          {errors.general && (
            <div className="flex gap-2 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
            </div>
          )}

          {/* Section 1: Identity */}
          <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">🪪 بيانات الهوية</CardTitle>
              <CardDescription>رقم الهوية الوطنية وصورتها</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1" id="nationalId">
                <Label>رقم الهوية الوطنية *</Label>
                <Input
                  placeholder="أدخل رقم الهوية"
                  value={nationalIdNumber}
                  onChange={e => { setNationalIdNumber(e.target.value); setErrors(p => ({ ...p, nationalId: '' })); }}
                  className={errors.nationalId ? 'border-destructive' : ''}
                  dir="ltr"
                />
                {errors.nationalId && <p className="text-xs text-destructive">{errors.nationalId}</p>}
              </div>

              <div className="space-y-2" id="idFile">
                <Label>صورة الهوية الوطنية {!existingProfile ? '*' : '(اختياري للتحديث)'}</Label>
                <div
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors hover:border-primary/60 ${
                    errors.idFile ? 'border-destructive' : 'border-border/60'
                  } ${idPreview ? 'border-primary/40' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {idPreview ? (
                    <div className="space-y-2">
                      <img src={idPreview} alt="معاينة" className="max-h-36 mx-auto rounded-lg object-contain" />
                      <p className="text-xs text-primary underline">انقر لتغيير الصورة</p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
                        <FileImage className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">ارفع صورة الهوية</p>
                      <p className="text-xs text-muted-foreground">JPEG, PNG, أو WebP — حتى 3MB</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleIdFileChange} />
                {errors.idFile && <p className="text-xs text-destructive">{errors.idFile}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Personal Info */}
          <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">📋 المعلومات الشخصية</CardTitle>
              <CardDescription>هذه المعلومات مرئية للإدارة فقط ولن تُعرض علنياً</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1" id="phone">
                  <Label>رقم الهاتف *</Label>
                  <Input
                    placeholder="07X XXXX XXXX"
                    value={phone}
                    onChange={e => { setPhone(e.target.value.replace(/[^0-9]/g, '')); setErrors(p => ({ ...p, phone: '' })); }}
                    className={errors.phone ? 'border-destructive' : ''}
                    dir="ltr"
                    maxLength={10}
                  />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-1" id="city">
                  <Label>المدينة / المنطقة *</Label>
                  <Input
                    placeholder="مثال: عمان، إربد"
                    value={city}
                    onChange={e => { setCity(e.target.value); setErrors(p => ({ ...p, city: '' })); }}
                    className={errors.city ? 'border-destructive' : ''}
                  />
                  {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <Label>العنوان التفصيلي أو الحي (خاص — مرئي للإدارة فقط)</Label>
                <Input placeholder="مثال: حي النزهة، شارع الأمير حسن" value={address} onChange={e => setAddress(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>عدد أفراد الأسرة</Label>
                  <Input type="number" min="1" placeholder="مثال: 5" value={familyMembers} onChange={e => setFamilyMembers(e.target.value)} />
                </div>

                <div className="space-y-1">
                  <Label>الحالة الوظيفية</Label>
                  <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                    <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>
                      {['موظف', 'عاطل عن العمل', 'متقاعد', 'عمل حر', 'طالب', 'أخرى'].map(v => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Financial */}
          <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">💰 الوضع المالي والسكني</CardTitle>
              <CardDescription>هذه البيانات سرية ومرئية للإدارة فقط — لن تظهر للمتبرعين</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>نطاق الدخل الشهري</Label>
                  <Select value={incomeRange} onValueChange={setIncomeRange}>
                    <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>
                      {['لا يوجد دخل', 'أقل من 200 دينار', '200 - 400 دينار', '400 - 600 دينار', 'أكثر من 600 دينار'].map(v => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>وضع السكن</Label>
                  <Select value={housingStatus} onValueChange={setHousingStatus}>
                    <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>
                      {['ملك', 'إيجار', 'مع العائلة', 'أخرى'].map(v => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {housingStatus === 'إيجار' && (
                <div className="space-y-1">
                  <Label>نطاق الإيجار الشهري</Label>
                  <Select value={rentRange} onValueChange={setRentRange}>
                    <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>
                      {['أقل من 100 دينار', '100 - 200 دينار', '200 - 300 دينار', 'أكثر من 300 دينار'].map(v => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>الضمان الاجتماعي</Label>
                  <Select value={socialSecurity} onValueChange={setSocialSecurity}>
                    <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>
                      {['مشترك', 'غير مشترك', 'غير متأكد'].map(v => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>صندوق المعونة / دعم جمعيات</Label>
                  <Select value={nafSupport} onValueChange={setNafSupport}>
                    <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>
                      {['يتلقى دعم', 'لا يتلقى دعم', 'غير متأكد'].map(v => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Needs */}
          <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">🎯 الاحتياجات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>شرح موجز عن وضعك الحالي</Label>
                <Textarea
                  placeholder="اكتب شرحاً مختصراً عن ظروفك واحتياجاتك..."
                  value={situation}
                  onChange={e => setSituation(e.target.value)}
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground text-left" dir="ltr">{situation.length}/1000</p>
              </div>

              <div className="space-y-2">
                <Label>فئات الاحتياج (اختر ما ينطبق)</Label>
                <div className="flex flex-wrap gap-2">
                  {NEEDS_OPTIONS.map(need => (
                    <Badge
                      key={need}
                      variant={needsCategories.includes(need) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all text-sm px-3 py-1.5 ${
                        needsCategories.includes(need)
                          ? 'bg-primary hover:bg-primary/90 text-white'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => toggleNeed(need)}
                    >
                      {need}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label>القدرة على الاستلام</Label>
                <Select value={deliveryAbility} onValueChange={setDeliveryAbility}>
                  <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                  <SelectContent>
                    {['يمكنني الاستلام', 'أحتاج توصيل', 'حسب المسافة'].map(v => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Proof Documents */}
          <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">📎 مستندات إثبات (اختياري)</CardTitle>
              <CardDescription>
                إثبات دخل، عقد إيجار، دعم صندوق المعونة، أو أي إثبات ذي صلة.
                هذه المستندات مرئية للإدارة فقط ولن تُعرض للمتبرعين.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {proofFiles.length > 0 && (
                <div className="space-y-2">
                  {proofFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                      <FileImage className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm flex-1 truncate">{f.name}</span>
                      <span className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
                      <button type="button" onClick={() => removeProofFile(i)} className="text-destructive hover:text-destructive/80">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {proofFiles.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-2 border-dashed h-16 gap-2"
                  onClick={() => proofInputRef.current?.click()}
                >
                  <Upload className="h-5 w-5 text-primary" />
                  إضافة مستند ({proofFiles.length}/5)
                </Button>
              )}
              <input
                ref={proofInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                multiple
                onChange={handleProofFilesChange}
              />
            </CardContent>
          </Card>

          {/* Consent */}
          <Card className={`border-none shadow-sm rounded-2xl ${errors.consent ? 'ring-2 ring-destructive' : ''}`} id="consent">
            <CardContent className="p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={e => { setConsent(e.target.checked); setErrors(p => ({ ...p, consent: '' })); }}
                  className="mt-1 h-5 w-5 rounded accent-primary"
                />
                <span className="text-sm leading-relaxed">
                  أوافق على أن هذه المعلومات ستستخدم فقط لأغراض التحقق والمراجعة من قبل الإدارة. لن تتم مشاركة أي بيانات حساسة مع المتبرعين أو الجمهور.
                </span>
              </label>
              {errors.consent && <p className="text-xs text-destructive mt-2">{errors.consent}</p>}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1 h-12 text-base gap-2">
              {loading ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> جاري الإرسال...</>
              ) : (
                <><ShieldCheck className="h-5 w-5" /> {existingProfile ? 'تحديث وإعادة التقديم' : 'إرسال للمراجعة'}</>
              )}
            </Button>
            <Button type="button" variant="outline" className="h-12" onClick={() => navigate(-1)}>
              إلغاء
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
