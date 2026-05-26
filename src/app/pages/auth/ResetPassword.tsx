import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Lock, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';
import { isValidPassword } from '../../utils/validators';

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidPassword(password)) {
      toast.error('كلمة المرور يجب أن تتكون من 8 خانات وتحتوي على حرف كبير ورقم ورمز خاص');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      toast.success('تم تغيير كلمة المرور بنجاح!');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'حدث خطأ، قد يكون الرابط منتهي الصلاحية');
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
        <h2 className="text-2xl font-bold mb-1">تعيين كلمة مرور جديدة</h2>
        <p className="text-muted-foreground text-sm">
          الرجاء إدخال كلمة المرور الجديدة الخاصة بك
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">كلمة المرور الجديدة</Label>
          <div className="relative">
            <Lock className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="ps-10 pe-10 h-12 rounded-xl bg-background border border-border/60 focus-visible:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
          <div className="relative">
            <Lock className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="ps-10 pe-10 h-12 rounded-xl bg-background border border-border/60 focus-visible:ring-primary"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              dir="ltr"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold h-12 shadow-md hover:shadow-primary/30 transition-all"
          disabled={loading}
        >
          {loading ? <><Loader2 className="animate-spin h-4 w-4 inline me-2" /> جاري الحفظ...</> : 'حفظ كلمة المرور'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        <Link to="/login" className="text-primary font-semibold hover:underline">
          العودة لتسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
