import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Eye, EyeOff, Mail, Lock, User, Heart, Users } from 'lucide-react';
import { toast } from 'sonner';

type Role = 'user' | 'volunteer';

const roles: { value: Role; label: string; description: string; icon: typeof User }[] = [
  {
    value: 'user',
    label: 'مستخدم',
    description: 'متبرع أو مستفيد',
    icon: User,
  },
  {
    value: 'volunteer',
    label: 'متطوع',
    description: 'أساعد في التوصيل',
    icon: Users,
  },
];

export function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('user');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    if (password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    setLoading(true);
    const result = await signup(name, email, password, selectedRole);
    setLoading(false);
    if (result.success) {
      toast.success('تم إنشاء حسابك بنجاح!');
      const redirectMap: Record<Role, string> = {
        user: '/dashboard/user',
        volunteer: '/dashboard/volunteer',
      };
      navigate(redirectMap[selectedRole], { replace: true });
    } else {
      toast.error(result.error || 'حدث خطأ، حاول مرة أخرى');
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
        <h2 className="text-2xl font-bold mb-1">إنشاء حساب جديد</h2>
        <p className="text-muted-foreground text-sm">انضم لمجتمع الخير واصنع فرقاً</p>
      </div>

      {/* Role Selection */}
      <div className="mb-6">
        <Label className="text-sm font-medium mb-3 block">نوع الحساب</Label>
        <div className="grid grid-cols-2 gap-3">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.value;
            return (
              <button
                key={role.value}
                type="button"
                onClick={() => setSelectedRole(role.value)}
                className={`relative p-4 rounded-xl border-2 text-right transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm shadow-primary/20'
                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className={`font-semibold text-sm ${isSelected ? 'text-primary' : ''}`}>{role.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{role.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">الاسم الكامل</Label>
          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              placeholder="أدخل اسمك الكامل"
              className="pr-10 border-2 focus:border-primary"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              className="pr-10 border-2 focus:border-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">كلمة المرور</Label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="6 أحرف على الأقل"
              className="pr-10 pl-10 border-2 focus:border-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
            />
            <button
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && password.length < 6 && (
            <p className="text-xs text-destructive">كلمة المرور قصيرة جداً</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-l from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary text-white font-semibold py-5 text-base shadow-md shadow-secondary/20 transition-all hover:shadow-lg hover:shadow-secondary/30"
          disabled={loading}
        >
          {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        لديك حساب بالفعل؟{' '}
        <Link to="/login" className="text-primary font-semibold hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
