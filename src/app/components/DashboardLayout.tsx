import { useState, useEffect, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Button } from './ui/button';
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
  ChevronRight,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface SidebarItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

const sidebarByRole: Record<string, SidebarItem[]> = {
  donor: [
    { label: 'نظرة عامة', path: '/dashboard/donor', icon: LayoutDashboard },
    { label: 'تبرعاتي', path: '/dashboard/donor?tab=donations', icon: Gift },
    { label: 'الملف الشخصي', path: '/dashboard/donor?tab=profile', icon: User },
  ],
  beneficiary: [
    { label: 'نظرة عامة', path: '/dashboard/beneficiary', icon: LayoutDashboard },
    { label: 'طلباتي', path: '/dashboard/beneficiary?tab=requests', icon: ClipboardList },
    { label: 'المحفوظات', path: '/dashboard/beneficiary?tab=wishlist', icon: Heart },
    { label: 'الملف الشخصي', path: '/dashboard/beneficiary?tab=profile', icon: User },
  ],
  volunteer: [
    { label: 'نظرة عامة', path: '/dashboard/volunteer', icon: LayoutDashboard },
    { label: 'مهامي', path: '/dashboard/volunteer?tab=tasks', icon: Truck },
    { label: 'الخريطة', path: '/dashboard/volunteer?tab=map', icon: MapPin },
    { label: 'الملف الشخصي', path: '/dashboard/volunteer?tab=profile', icon: User },
  ],
  admin: [
    { label: 'الإحصائيات', path: '/dashboard/admin', icon: BarChart3 },
    { label: 'المستخدمون', path: '/dashboard/admin?tab=users', icon: Users },
    { label: 'التبرعات', path: '/dashboard/admin?tab=donations', icon: Gift },
    { label: 'الطلبات', path: '/dashboard/admin?tab=requests', icon: ClipboardList },
    { label: 'الحالات العاجلة', path: '/dashboard/admin?tab=urgent', icon: AlertTriangle, badge: '🔥' },
  ],
};

const roleTitles: Record<string, string> = {
  donor: 'حساب المتبرع',
  beneficiary: 'حساب المستفيد',
  volunteer: 'حساب المتطوع',
  admin: 'لوحة الإدارة',
};

function NotificationBell() {
  const { notifications, markAsRead } = useNotifications();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white font-bold">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          الإشعارات
          {unread > 0 && <Badge variant="secondary">{unread} جديد</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">لا توجد إشعارات</div>
        ) : (
          notifications.slice(0, 6).map((n) => (
            <DropdownMenuItem
              key={n.id}
              className={`flex-col items-start gap-1 cursor-pointer ${!n.read ? 'bg-primary/5' : ''}`}
              onClick={() => markAsRead(n.id)}
            >
              <div className="flex items-center gap-2 w-full">
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                <span className="font-medium text-sm">{n.title}</span>
              </div>
              <span className="text-xs text-muted-foreground pr-4">{n.message}</span>
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
    <div className="flex flex-col h-full bg-card border-l">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
          <Heart className="w-5 h-5 text-white fill-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            منصة الخير
          </div>
          <div className="text-xs text-muted-foreground truncate">{roleTitles[user?.role ?? 'donor']}</div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                active
                  ? 'bg-primary text-white shadow-sm shadow-primary/30'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && <span>{item.badge}</span>}
              {!active && <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="p-4 border-t space-y-2">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-muted/50">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-xs bg-primary text-white">
              {user?.name?.slice(0, 2) ?? 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.name}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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

  const items = sidebarByRole[user?.role ?? 'donor'];

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen" dir="rtl">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 flex-shrink-0">
        <div className="sticky top-0 h-screen">
          <Sidebar items={items} />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="p-0 w-64" dir="rtl">
          <SheetTitle className="sr-only">القائمة</SheetTitle>
          <div className="h-full">
            <Sidebar items={items} onClose={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>

            <div className="hidden lg:block">
              <h1 className="font-semibold text-lg">{roleTitles[user?.role ?? 'donor']}</h1>
            </div>
            <div className="lg:hidden font-semibold text-base">منصة الخير</div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)} title="تبديل المظهر">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <NotificationBell />

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-xs bg-primary text-white">
                      {user?.name?.slice(0, 2) ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium max-w-24 truncate">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="text-sm font-medium">{user?.name}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" /> الصفحة الرئيسية
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/dashboard/${user?.role}?tab=profile`} className="flex items-center gap-2">
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
        <main className="flex-1 p-4 lg:p-6 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}
