import { Link, useLocation, useNavigate } from 'react-router';
import { Heart, Home, Gift, Users, Menu, Moon, Sun, LogIn, LogOut, LayoutDashboard, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from './ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { NotificationDropdown } from './NotificationDropdown';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const roleRoutes: Record<string, string> = {
  donor: '/dashboard/donor',
  beneficiary: '/dashboard/beneficiary',
  volunteer: '/dashboard/volunteer',
  admin: '/dashboard/admin',
};

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج');
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navItems = [
    { name: 'الرئيسية', path: '/', icon: Home },
    { name: 'المجتمع', path: '/community', icon: MessageCircle },
    { name: 'التبرعات', path: '/donations', icon: Gift },
    { name: 'التطوع', path: '/volunteer', icon: Users },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-gray-900/95">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
              <Heart className="h-6 w-6 text-white fill-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              منصة الخير
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link key={item.path} to={item.path}>
                  <Button variant={isActive ? 'default' : 'ghost'} className={isActive ? 'bg-primary text-white hover:bg-primary/90' : ''}>
                    <Icon className="h-4 w-4 ml-2" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <NotificationDropdown />

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 hidden md:flex">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-xs bg-primary text-white">{user.name?.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium max-w-24 truncate">{user.name?.split(' ')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={roleRoutes[user.role]} className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" /> لوحة التحكم
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" /> تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex gap-2">
                <Button variant="ghost" asChild><Link to="/login"><LogIn className="h-4 w-4 ml-2" />تسجيل الدخول</Link></Button>
                <Button asChild><Link to="/signup">إنشاء حساب</Link></Button>
              </div>
            )}

            {/* Mobile menu */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon"><Menu className="h-6 w-6" /></Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px]" dir="rtl">
                  <SheetTitle className="sr-only">القائمة</SheetTitle>
                  <div className="flex flex-col gap-4 py-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                        <Heart className="h-5 w-5 text-white fill-white" />
                      </div>
                      <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">منصة الخير</span>
                    </div>

                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent'}`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Icon className="h-5 w-5" />
                          {item.name}
                        </Link>
                      );
                    })}

                    <div className="border-t pt-4 space-y-2">
                      {isAuthenticated && user ? (
                        <>
                          <Link
                            to={roleRoutes[user.role]}
                            className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-accent transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <LayoutDashboard className="h-5 w-5" /> لوحة التحكم
                          </Link>
                          <button
                            className="flex items-center gap-3 px-4 py-3 rounded-md text-destructive hover:bg-destructive/10 transition-colors w-full"
                            onClick={handleLogout}
                          >
                            <LogOut className="h-5 w-5" /> تسجيل الخروج
                          </button>
                        </>
                      ) : (
                        <>
                          <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>
                            <LogIn className="h-5 w-5" /> تسجيل الدخول
                          </Link>
                          <Link to="/signup" className="flex items-center gap-3 px-4 py-3 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                            ✨ إنشاء حساب
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}