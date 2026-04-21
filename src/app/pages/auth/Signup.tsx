import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Eye, EyeOff, Mail, Lock, User, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { isValidEmail, isLettersOnly } from '../../utils/validators';

type Errors = { name?: string; email?: string; password?: string };

export function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    if (!password) {
      e.password = t('auth.password_required');
    } else if (password.length < 6) {
      e.password = t('auth.password_too_short');
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
    const result = await signup(name, email, password);
    setLoading(false);
    if (result.success) {
      toast.success(t('auth.signup_success'));
      navigate('/dashboard', { replace: true });
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
        <div className="space-y-1">
          <Label htmlFor="name">{t('auth.name')}</Label>
          <div className="relative">
            <User className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              placeholder={t('auth.name_placeholder')}
              className={`pe-10 border-2 focus:border-primary ${errors.name ? 'border-destructive' : ''}`}
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
              className={`ps-10 border-2 focus:border-primary ${errors.email ? 'border-destructive' : ''}`}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
              dir="ltr"
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <div className="relative">
            <Lock className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.password_placeholder')}
              className={`pe-10 ps-10 border-2 focus:border-primary ${errors.password ? 'border-destructive' : ''}`}
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
          className="w-full bg-gradient-to-l from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary text-white font-semibold py-5 text-base shadow-md shadow-secondary/20 transition-all hover:shadow-lg hover:shadow-secondary/30"
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
