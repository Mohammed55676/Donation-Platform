import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useAuth } from '../../context/AuthContext';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../components/ui/input-otp';
import { Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

export function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = (location.state as any)?.email as string | undefined;
  const previewUrl = (location.state as any)?.previewUrl as string | undefined;
  const type = (location.state as any)?.type as 'reset' | undefined;

  useEffect(() => {
    if (!email) navigate('/login', { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = useCallback(async (value: string) => {
    if (value.length !== 6 || loading) return;
    setLoading(true);
    setError('');

    if (type === 'reset') {
      try {
        await api.post('/auth/validate-reset-otp', { email, otp: value });
        setLoading(false);
        navigate('/reset-password', { replace: true, state: { email, otp: value } });
      } catch (err: any) {
        setLoading(false);
        setError(err.response?.data?.error || err.response?.data?.message || 'رمز التحقق غير صحيح');
        setOtp('');
      }
      return;
    }

    const result = await verifyOtp(email!, value);
    setLoading(false);
    if (result.success) {
      const redirectTo =
        result.user?.role === 'admin' ? '/dashboard/admin'
        : result.user?.user_type === 'charity' ? '/dashboard/charity'
        : '/dashboard';
      navigate(redirectTo, { replace: true });
    } else {
      setError(result.error || 'رمز التحقق غير صحيح');
      setOtp('');
    }
  }, [email, verifyOtp, navigate, loading, type]);

  useEffect(() => {
    if (otp.length === 6) handleVerify(otp);
  }, [otp, handleVerify]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setInfo('');
    const result = await resendOtp(email!);
    if (result.success) {
      setResendCooldown(60);
      setInfo('تم إرسال رمز جديد إلى بريدك الإلكتروني');
    } else {
      setError(result.error || 'فشل إعادة الإرسال');
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
        <h2 className="text-2xl font-bold mb-1">تحقق من بريدك الإلكتروني</h2>
        <p className="text-muted-foreground text-sm">
          أرسلنا رمزاً مكوّناً من 6 أرقام إلى
        </p>
        <p className="font-medium text-sm mt-1">{email}</p>
      </div>

      <div className="flex justify-center mb-6" dir="ltr">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
          pattern={REGEXP_ONLY_DIGITS}
          disabled={loading}
        >
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map(i => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      {loading && (
        <div className="flex justify-center mb-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      {error && <p className="text-sm text-destructive text-center mb-3">{error}</p>}
      {info && <p className="text-sm text-green-600 text-center mb-3">{info}</p>}

      {previewUrl && (
        <p className="text-xs text-muted-foreground text-center mb-4">
          [DEV]{' '}
          <a href={previewUrl} target="_blank" rel="noreferrer" className="underline">
            عاين الإيميل
          </a>
        </p>
      )}

      <p className="text-center text-sm text-muted-foreground">
        لم يصلك الرمز؟{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="font-semibold text-primary hover:underline disabled:opacity-50 disabled:no-underline"
        >
          {resendCooldown > 0 ? `أعد الإرسال بعد ${resendCooldown}ث` : 'أعد الإرسال'}
        </button>
      </p>
    </div>
  );
}
