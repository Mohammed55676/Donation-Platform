import { useState, useEffect, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/button';
import { AIChatbot } from './AIChatbot';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import {
  Bell,
  Heart,
  LogOut,
  Menu,
  Moon,
  Sun,
  Settings,
  User,
  LayoutDashboard,
  Gift,
  ClipboardList,
  Truck,
  MapPin,
  Users,
  BarChart3,
  AlertTriangle,
  X,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';

interface SidebarItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

const sidebarByRole: Record<string, SidebarItem[]> = {
  user: [
    { label: 'نظرة عامة', path: '/dashboard', icon: LayoutDashboard },
    { label: 'تبرعاتي', path: '/dashboard?tab=donations', icon: Gift },
    { label: 'طلباتي', path: '/dashboard?tab=requests', icon: ClipboardList },
    { label: 'المهام التطوعية', path: '/dashboard?tab=volunteer', icon: Truck },
    { label: 'المحفوظات', path: '/dashboard?tab=saved', icon: Heart },
    { label: 'الملف الشخصي', path: '/dashboard?tab=profile', icon: User },
  ],
  admin: [
    { label: 'الإحصائيات', path: '/dashboard/admin', icon: BarChart3 },
    { label: 'المستخدمون', path: '/dashboard/admin?tab=users', icon: Users },
    { label: 'التبرعات', path: '/dashboard/admin?tab=donations', icon: Gift },
    { label: 'الحملات', path: '/dashboard/admin?tab=campaigns', icon: MapPin },
    { label: 'فرص التطوع', path: '/dashboard/admin?tab=volunteer', icon: Truck },
    { label: 'الطلبات', path: '/dashboard/admin?tab=requests', icon: ClipboardList },
    { label: 'الحالات العاجلة', path: '/dashboard/admin?tab=urgent', icon: AlertTriangle, badge: '🔥' },
  ],
};

const roleTitles: Record<string, string> = {
  user: 'حساب المستخدم',
  admin: 'لوحة الإدارة',
};

function NotificationBell() {
  const { notifications, markAsRead } = useNotifications();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg">
          <Bell className="h-4.5 w-4.5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-destructive text-[10px] text-white font-bold">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between py-3">
          الإشعارات
          {unread > 0 && <Badge variant="secondary" className="bg-primary/10 text-primary">{unread} جديد</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">لا توجد إشعارات</p>
          </div>
        ) : (
          notifications.slice(0, 6).map((n) => (
            <DropdownMenuItem
              key={n.id}
              className={`flex-col items-start gap-1 cursor-pointer py-3 ${!n.read ? 'bg-primary/5' : ''}`}
              onClick={() => markAsRead(n.id)}
            >
              <div className="flex items-center gap-2 w-full">
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                <span className="font-medium text-sm">{n.title}</span>
              </div>
              <span className="text-xs text-muted-foreground ps-4">{n.message}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Sidebar({ items, onClose }: { items: SidebarItem[]; onClose?: () => void }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج');
    navigate('/login');
    onClose?.();
  };

  const isActive = (path: string) => {
    const [pathname, search] = path.split('?');
    if (search) {
      const tab = new URLSearchParams('?' + search).get('tab');
      const currentTab = new URLSearchParams(location.search).get('tab');
      return location.pathname === pathname && currentTab === tab;
    }
    return location.pathname === pathname && !location.search;
  };

  return (
    <div className="flex flex-col h-full bg-[#111827] dark:bg-[#080E18]">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-primary to-secondary flex-shrink-0" />

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
          <Heart className="w-4.5 h-4.5 text-white fill-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-white">منصة الخير</div>
          <div className="text-xs text-white/40 truncate">{roleTitles[user?.role ?? 'user']}</div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:text-white hover:bg-white/10" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {items?.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-white/50 hover:text-white hover:bg-white/8'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && <span className="text-sm">{item.badge}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="p-3 border-t border-white/5 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-xs bg-primary text-white font-semibold">
              {user?.name?.slice(0, 2) ?? 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{user?.name}</div>
            <div className="text-xs text-white/40 truncate">{user?.email}</div>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl text-sm"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const items = sidebarByRole[user?.role ?? 'user'] || sidebarByRole['user'];

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 flex-shrink-0">
        <div className="sticky top-0 h-screen overflow-hidden">
          <Sidebar items={items} />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side={language === 'ar' ? 'right' : 'left'} className="p-0 w-60 border-0" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <SheetTitle className="sr-only">القائمة</SheetTitle>
          <div className="h-full">
            <Sidebar items={items} onClose={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 rounded-lg">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>

            <div className="hidden lg:block">
              <h1 className="font-semibold text-base">{roleTitles[user?.role ?? 'user']}</h1>
            </div>
            <div className="lg:hidden font-semibold text-sm text-muted-foreground">منصة الخير</div>
          </div>

          <div className="flex items-center gap-1">
            {/* Translate toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={toggleLanguage}
              title="تغيير اللغة / Change Language"
            >
              <Globe className="h-4.5 w-4.5" />
            </Button>

            {/* Theme toggle */}
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-muted-foreground" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </Button>

            <NotificationBell />

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 h-9 rounded-lg hover:bg-muted">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-xs bg-primary text-white font-semibold">
                      {user?.name?.slice(0, 2) ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium max-w-20 truncate">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <div className="text-sm font-semibold">{user?.name}</div>
                  <div className="text-xs text-muted-foreground font-normal">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" /> الصفحة الرئيسية
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={user?.role === 'admin' ? '/dashboard/admin?tab=profile' : '/dashboard?tab=profile'} className="flex items-center gap-2">
                    <Settings className="h-4 w-4" /> الإعدادات
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" /> تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 bg-muted/30">
          {children}
        </main>
      </div>
      <AIChatbot />
    </div>
  );
}
