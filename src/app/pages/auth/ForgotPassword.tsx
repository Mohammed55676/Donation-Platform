import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Mail, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('يرجى إدخال بريدك الإلكتروني');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      const { email: returnedEmail, previewUrl } = res.data.data || {};
      toast.success('تم إرسال رمز التحقق إلى بريدك الإلكتروني');
      navigate('/verify-otp', { state: { email: returnedEmail || email, previewUrl, type: 'reset' } });
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'حدث خطأ أثناء الإرسال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="hidden lg:flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-1">نسيت كلمة المرور؟</h2>
        <p className="text-muted-foreground text-sm">
          أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <div className="relative">
            <Mail className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              className="ps-10 h-12 rounded-xl bg-background border border-border/60 focus-visible:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold h-12 shadow-md hover:shadow-primary/30 transition-all"
          disabled={loading}
        >
          {loading ? <><Loader2 className="animate-spin h-4 w-4 inline me-2" />جاري الإرسال...</> : 'إرسال رمز التحقق'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        تذكرت كلمة المرور؟{' '}
        <Link to="/login" className="text-primary font-semibold hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
