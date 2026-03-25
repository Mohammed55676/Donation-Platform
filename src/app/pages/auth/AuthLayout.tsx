import { Outlet, Link } from 'react-router';
import { Heart, X } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left brand panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-secondary flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute bottom-[-60px] left-[-60px] w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute top-1/2 left-[-40px] w-32 h-32 rounded-full bg-white/5" />

        <div className="relative z-10 text-white text-center max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <Heart className="w-10 h-10 text-white fill-white" />
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4">منصة الخير</h1>
          <p className="text-xl text-white/80 mb-8">معاً نصنع فرقاً في حياة الآخرين</p>

          {/* Illustration - floating donation items */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { emoji: '🤝', label: 'تواصل إنساني' },
              { emoji: '🎁', label: 'تبرعات' },
              { emoji: '❤️', label: 'مجتمع' },
              { emoji: '🚚', label: 'توصيل' },
              { emoji: '🌟', label: 'تطوع' },
              { emoji: '🏠', label: 'مساعدة' },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/10 rounded-2xl p-4 backdrop-blur text-center transition-transform hover:-translate-y-1"
              >
                <div className="text-3xl mb-1">{item.emoji}</div>
                <div className="text-xs text-white/70">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3">
            {[
              'أكثر من ١٠٠٠ عائلة استفادت',
              'أكثر من ٥٠٠ متطوع نشط',
              'أكثر من ٣٠٠٠ تبرع تم تسليمه',
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-white/90">
                <div className="w-2 h-2 rounded-full bg-white/60 flex-shrink-0" />
                {stat}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col relative">
        {/* Close button - top left (visually top-right in RTL) */}
        <Link
          to="/"
          className="absolute top-4 left-4 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
          title="العودة للرئيسية"
        >
          <X className="w-5 h-5" />
        </Link>

        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-6 border-b">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              منصة الخير
            </span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>

        <div className="p-6 text-center text-sm text-muted-foreground lg:hidden">
          <Link to="/" className="hover:text-primary transition-colors">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
