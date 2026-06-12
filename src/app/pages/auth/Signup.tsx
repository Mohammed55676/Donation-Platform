import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import type { UserType } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Eye, EyeOff, Mail, Lock, User, Heart, Loader2, HandCoins, Gift, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { isValidEmail, isLettersOnly, isValidPassword } from '../../utils/validators';

type Errors = { name?: string; email?: string; password?: string; phone?: string; location?: string; charityCategory?: string; charityRegistrationNumber?: string; charityLicenseDocument?: string; };

export function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('donor');
  const [showPassword, setShowPassword] = useState(false);
  const [location, setLocation] = useState('');
  const [charityCategory, setCharityCategory] = useState('');
  const [charityDescription, setCharityDescription] = useState('');
  const [charityRegistrationNumber, setCharityRegistrationNumber] = useState('');
  const [charityLicenseDocument, setCharityLicenseDocument] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const { signup } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const validate = (): Errors => {
    const e: Errors = {};
    if (!name.trim()) {
      e.name = t('auth.name_required');
    } else if (!isLettersOnly(name)) {
      e.name = t('auth.name_letters_only');
    } else if (name.trim().length < 3) {
      e.name = t('auth.name_too_short');
    }
    if (!email.trim()) {
      e.email = t('auth.email_required');
    } else if (!isValidEmail(email)) {
      e.email = t('auth.email_invalid');
    }
    if (!phone.trim()) {
      e.phone = 'رقم الهاتف مطلوب';
    } else if (!/^[0-9+]{9,15}$/.test(phone.trim())) {
      e.phone = 'رقم الهاتف غير صالح';
    }
    if (!password) {
      e.password = t('auth.password_required');
    } else if (!isValidPassword(password)) {
      e.password = 'كلمة المرور يجب أن تتكون من 8 خانات وتحتوي على حرف كبير ورقم ورمز خاص';
    }
    if (userType === 'charity') {
      if (!location.trim()) e.location = 'العنوان مطلوب';
      if (!charityCategory.trim()) e.charityCategory = 'نوع الجمعية مطلوب';
      if (!charityRegistrationNumber.trim()) e.charityRegistrationNumber = 'رقم الترخيص مطلوب';
      if (!charityLicenseDocument.trim()) e.charityLicenseDocument = 'رابط مستند الترخيص مطلوب';
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    const result = await signup({
      name, email, password, user_type: userType, phone,
      ...(userType === 'charity' && {
        location,
        charityCategory,
        charityDescription,
        charityRegistrationNumber,
        charityLicenseDocument
      })
    });
    setLoading(false);
    if (result.success) {
      if (result.isPendingCharity) {
        navigate('/pending-review', { replace: true });
        return;
      }
      if (result.requiresOTP) {
        navigate('/verify-otp', { state: { email: result.email, previewUrl: result.previewUrl } });
        return;
      }
      toast.success(t('auth.signup_success'));
      const user = result.user;
      let redirect = '/dashboard';
      if (user?.role === 'admin') redirect = '/dashboard/admin';
      else if (user?.user_type === 'charity') redirect = '/dashboard/charity';
      navigate(redirect, { replace: true });
    } else {
      toast.error(result.error || t('auth.error_generic'));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="hidden lg:flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-1">{t('auth.signup_title')}</h2>
        <p className="text-muted-foreground text-sm">{t('auth.signup_subtitle')}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User type selection */}
        <div className="space-y-2">
          <Label>نوع الحساب</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUserType('donor')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${userType === 'donor'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/60 hover:border-primary/40 text-muted-foreground'
                }`}
            >
              <Gift className="h-6 w-6" />
              <span className="text-sm font-semibold">متبرع</span>
              <span className="text-xs opacity-70">أتبرع بالأشياء</span>
            </button>
            <button
              type="button"
              onClick={() => setUserType('charity')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${userType === 'charity'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30'
                  : 'border-border/60 hover:border-emerald-400 text-muted-foreground'
                }`}
            >
              <Heart className="h-6 w-6" />
              <span className="text-sm font-semibold">جمعية</span>
              <span className="text-xs opacity-70">جمعية خيرية</span>
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="name">{userType === 'charity' ? 'اسم الجمعية / المنظمة' : t('auth.name')}</Label>
          <div className="relative">
            <User className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              placeholder={userType === 'charity' ? 'اسم الجمعية الرسمي' : t('auth.name_placeholder')}
              className={`pe-10 h-12 rounded-xl bg-background border border-border/60 focus-visible:ring-primary ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })); }}
            />
          </div>
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <div className="relative">
            <Mail className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              className={`ps-10 h-12 rounded-xl bg-background border border-border/60 focus-visible:ring-primary ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
              dir="ltr"
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="phone">رقم الهاتف</Label>
          <div className="relative">
            <Phone className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="+9627xxxxxxxx"
              className={`ps-10 h-12 rounded-xl bg-background border border-border/60 focus-visible:ring-primary ${errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: undefined })); }}
              dir="ltr"
            />
          </div>
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>

        {userType === 'charity' && (
          <>
            <div className="space-y-1">
              <Label htmlFor="location">الموقع (المدينة / المحافظة / العنوان التفصيلي)</Label>
              <Input
                id="location"
                placeholder="مثال: الرياض، حي الورود، شارع التحلية"
                className={`h-12 rounded-xl bg-background border border-border/60 focus-visible:ring-primary ${errors.location ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                value={location}
                onChange={(e) => { setLocation(e.target.value); setErrors(prev => ({ ...prev, location: undefined })); }}
              />
              {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="category">مجال العمل / الفئة (مثال: أيتام، صحة، إغاثة)</Label>
              <Input
                id="category"
                placeholder="مثال: رعاية الأيتام"
                className={`h-12 rounded-xl bg-background border border-border/60 focus-visible:ring-primary ${errors.charityCategory ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                value={charityCategory}
                onChange={(e) => { setCharityCategory(e.target.value); setErrors(prev => ({ ...prev, charityCategory: undefined })); }}
              />
              {errors.charityCategory && <p className="text-xs text-destructive">{errors.charityCategory}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="description">وصف قصير للجمعية</Label>
              <Input
                id="description"
                placeholder="نبذة مختصرة عن نشاط الجمعية..."
                className="h-12 rounded-xl bg-background border border-border/60 focus-visible:ring-primary"
                value={charityDescription}
                onChange={(e) => setCharityDescription(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="regNumber">رقم الترخيص / التسجيل الرسمي</Label>
              <Input
                id="regNumber"
                placeholder="مثال: 123456789"
                className={`h-12 rounded-xl bg-background border border-border/60 focus-visible:ring-primary ${errors.charityRegistrationNumber ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                value={charityRegistrationNumber}
                onChange={(e) => { setCharityRegistrationNumber(e.target.value); setErrors(prev => ({ ...prev, charityRegistrationNumber: undefined })); }}
                dir="ltr"
              />
              {errors.charityRegistrationNumber && <p className="text-xs text-destructive">{errors.charityRegistrationNumber}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="docUrl">رابط مستند الترخيص (Google Drive, Dropbox...)</Label>
              <Input
                id="docUrl"
                placeholder="https://..."
                className={`h-12 rounded-xl bg-background border border-border/60 focus-visible:ring-primary ${errors.charityLicenseDocument ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                value={charityLicenseDocument}
                onChange={(e) => { setCharityLicenseDocument(e.target.value); setErrors(prev => ({ ...prev, charityLicenseDocument: undefined })); }}
                dir="ltr"
              />
              {errors.charityLicenseDocument && <p className="text-xs text-destructive">{errors.charityLicenseDocument}</p>}
            </div>
          </>
        )}

        <div className="space-y-1">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <div className="relative">
            <Lock className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.password_placeholder')}
              className={`pe-10 ps-10 h-12 rounded-xl bg-background border border-border/60 focus-visible:ring-primary ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); }}
              dir="ltr"
            />
            <button
              type="button"
              className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <Button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-secondary to-primary text-white font-semibold h-12 shadow-md hover:shadow-secondary/30 transition-all"
          disabled={loading}
        >
          {loading ? (
            <><Loader2 className="me-2 h-4 w-4 animate-spin" />{t('auth.signup_loading')}</>
          ) : (
            t('auth.signup_btn')
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        {t('auth.have_account')}{' '}
        <Link to="/login" className="text-primary font-semibold hover:underline">
          {t('auth.login_link')}
        </Link>
      </p>
    </div>
  );
}
