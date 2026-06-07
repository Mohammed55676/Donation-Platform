import { Link, useLocation, useNavigate } from 'react-router';
import { Heart, Home, Gift, Users, Menu, Moon, Sun, LogIn, LogOut, LayoutDashboard, MessageCircle, Globe, Phone, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from './ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { NotificationDropdown } from './notifications/NotificationDropdown';
import { MessageBadge } from './MessageBadge';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';

const roleRoutes: Record<string, string> = {
  user: '/dashboard',
  admin: '/dashboard/admin',
};

// Get the correct dashboard path for the current user
function getDashboardPath(user: any): string {
  if (user?.role === 'admin') return '/dashboard/admin';
  if (user?.user_type === 'charity') return '/dashboard/charity';
  return '/dashboard';
}

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success(t('common.logout_success'));
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navItems = [
    { name: t('nav.home'), path: '/', icon: Home },
    { name: t('nav.donations'), path: '/donations', icon: Gift },
    { name: t('nav.community'), path: '/community', icon: MessageCircle },
    { name: t('nav.volunteer'), path: '/volunteer', icon: Users },
    { name: t('nav.locations'), path: '/locations', icon: MapPin },
    { name: t('nav.about'), path: '/about', icon: Heart },
    { name: t('nav.contact'), path: '/contact', icon: Phone },
  ];

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-200 ${scrolled ? 'border-b shadow-sm' : 'border-b border-transparent'} bg-white/90 dark:bg-[#0F1623]/90 backdrop-blur-xl`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-sm">
              <Heart className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:block">
              {t('common.platform_name')}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary dark:bg-primary/15'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 me-1.5" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={toggleLanguage}
              title="تغيير اللغة / Change Language"
            >
              <Globe className="h-4.5 w-4.5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </Button>

            {isAuthenticated && <MessageBadge />}
            {isAuthenticated && <NotificationDropdown />}

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex items-center gap-2 px-2 h-9 rounded-lg hover:bg-muted">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-xs bg-primary text-white font-semibold">{user.name?.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium max-w-20 truncate">{user.name?.split(' ')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>
                    <div className="text-sm font-semibold">{user.name}</div>
                    <div className="text-xs text-muted-foreground font-normal">{user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardPath(user)} className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" /> {t('nav.dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive gap-2 focus:text-destructive" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" /> {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2 ms-1">
                <Button variant="ghost" size="sm" className="rounded-lg text-muted-foreground" asChild>
                  <Link to="/login"><LogIn className="h-4 w-4 me-1.5" />{t('nav.login')}</Link>
                </Button>
                <Button size="sm" className="rounded-lg" asChild>
                  <Link to="/signup">{t('nav.signup')}</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu */}
            <div className="lg:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side={language === 'ar' ? 'right' : 'left'} className="w-72 p-0" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  <SheetTitle className="sr-only">القائمة</SheetTitle>
                  <div className="flex flex-col h-full">
                    {/* Mobile header */}
                    <div className="flex items-center gap-3 p-5 border-b">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-sm">
                        <Heart className="h-5 w-5 text-white fill-white" />
                      </div>
                      <span className="font-bold text-base bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex-1">
                        {t('common.platform_name')}
                      </span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={toggleLanguage}>
                        <Globe className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setDarkMode(!darkMode)}>
                        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      </Button>
                    </div>

                    {/* Nav items */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-primary/10 text-primary dark:bg-primary/15'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Icon className="h-4.5 w-4.5" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </nav>

                    {/* Bottom auth */}
                    <div className="p-4 border-t space-y-2">
                      {isAuthenticated && user ? (
                        <>
                          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-muted/60 mb-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="text-xs bg-primary text-white">{user.name?.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{user.name}</div>
                              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                            </div>
                          </div>
                          <Link
                            to={getDashboardPath(user)}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-muted transition-colors text-sm"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4" /> {t('nav.dashboard')}
                          </Link>
                          <button
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-colors w-full text-sm"
                            onClick={handleLogout}
                          >
                            <LogOut className="h-4 w-4" /> {t('nav.logout')}
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/login"
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-muted transition-colors text-sm"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <LogIn className="h-4 w-4" /> {t('nav.login')}
                          </Link>
                          <Link
                            to="/signup"
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-semibold"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {t('nav.signup')}
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