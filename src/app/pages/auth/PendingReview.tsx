import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Heart, Clock } from 'lucide-react';

export function PendingReview() {
  return (
    <div className="text-center max-w-md mx-auto py-12">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center relative">
          <Heart className="w-8 h-8 text-amber-500 fill-amber-500" />
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mb-4 text-foreground">في انتظار المراجعة</h2>
      <p className="text-muted-foreground mb-8">
        تم إنشاء حساب الجمعية بنجاح! حسابك الآن قيد المراجعة من قبل الإدارة للتحقق من المستندات والوثائق المرفقة. ستتمكن من استخدام كافة ميزات المنصة فور اعتماد الحساب.
      </p>

      <Button asChild className="w-full rounded-xl h-12 shadow-md">
        <Link to="/">العودة للصفحة الرئيسية</Link>
      </Button>
    </div>
  );
}
