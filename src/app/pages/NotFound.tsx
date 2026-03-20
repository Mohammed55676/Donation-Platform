import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Home, Search } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary/20">404</h1>
          <h2 className="text-3xl md:text-4xl mb-4">الصفحة غير موجودة</h2>
          <p className="text-muted-foreground text-lg mb-8">
            عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
              <Home className="ml-2 h-5 w-5" />
              العودة للرئيسية
            </Button>
          </Link>
          <Link to="/donations">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <Search className="ml-2 h-5 w-5" />
              تصفح التبرعات
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
