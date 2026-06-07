import { useNavigate, useSearchParams } from 'react-router';
import { CheckCircle2, AlertTriangle, ArrowRight, Heart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export function PaymentSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const amount = params.get('amount');
  const campaignTitle = params.get('campaign');

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F1623] flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="bg-white dark:bg-[#1A2332] rounded-3xl shadow-xl border border-border/50 p-8 max-w-md w-full text-center">

        {/* Icon */}
        <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </div>

        {/* Demo Badge */}
        <Badge
          variant="outline"
          className="mb-4 text-xs text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700/40 dark:text-amber-400"
        >
          <AlertTriangle className="h-3 w-3 me-1" /> دفع تجريبي
        </Badge>

        {/* Heading */}
        <h1 className="text-3xl font-extrabold text-foreground mb-2">شكراً لك!</h1>
        <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-lg mb-1">
          تم تسجيل تبرعك بنجاح
        </p>
        <p className="text-muted-foreground text-sm mb-6">
          Thank you! Your donation has been recorded successfully.
        </p>

        {/* Summary Card */}
        {(amount || campaignTitle) && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6 text-sm space-y-2 text-right">
            {campaignTitle && (
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground flex-shrink-0">الحملة</span>
                <span className="font-medium truncate">{campaignTitle}</span>
              </div>
            )}
            {amount && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">المبلغ</span>
                <span className="font-bold text-primary">{amount} د.أ</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">الحالة</span>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-none text-xs">
                تم التسجيل
              </Badge>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-[11px] text-amber-600/80 dark:text-amber-500/70 mb-6">
          هذه شاشة دفع تجريبية — لم يتم خصم أي مبلغ حقيقي من بطاقتك.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate('/locations')}
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold gap-2"
          >
            <Heart className="h-4 w-4" />
            استعرض المزيد من الحملات
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="w-full h-11 rounded-xl text-muted-foreground hover:text-foreground gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
}
