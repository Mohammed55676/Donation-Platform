import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-[#080E18] text-slate-300 mt-auto">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-sm">
                <Heart className="h-5 w-5 text-white fill-white" />
              </div>
              <span className="font-bold text-lg text-white">منصة الخير</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              نربط المتطوعين والمتبرعين مع الأشخاص المحتاجين لنشر الخير والأمل في المجتمع.
            </p>
            <div className="flex gap-3">
              {[
                { href: '#', icon: Facebook },
                { href: '#', icon: Twitter },
                { href: '#', icon: Instagram },
              ].map(({ href, icon: Icon }, i) => (
                <a
                  key={i}
                  href={href}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-primary hover:text-white transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">روابط سريعة</h3>
            <ul className="space-y-3">
              {[
                { label: 'الرئيسية', to: '/' },
                { label: 'التبرعات', to: '/donations' },
                { label: 'التطوع', to: '/volunteer' },
                { label: 'المجتمع', to: '/community' },
                { label: 'من نحن', to: '/about' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">تواصل معنا</h3>
            <ul className="space-y-3.5">
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                </div>
                +962 79 123 4567
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                </div>
                info@alkhair.jo
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                </div>
                عمّان، المملكة الأردنية الهاشمية
              </li>
            </ul>
          </div>

          {/* Mission */}
          <div>
            <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">رسالتنا</h3>
            <div className="space-y-3">
              {[
                { emoji: '🤝', text: 'ربط المتطوعين بالمحتاجين' },
                { emoji: '❤️', text: 'نشر ثقافة التبرع والعطاء' },
                { emoji: '🌍', text: 'بناء مجتمع أكثر تضامناً' },
              ].map(({ emoji, text }, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-slate-400">
                  <span className="text-base">{emoji}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-500">© 2026 منصة الخير. جميع الحقوق محفوظة.</p>
          <div className="flex gap-4 text-xs text-slate-500">
            <Link to="/about" className="hover:text-slate-300 transition-colors">سياسة الخصوصية</Link>
            <Link to="/about" className="hover:text-slate-300 transition-colors">شروط الاستخدام</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
