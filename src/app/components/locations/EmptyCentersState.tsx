import { SearchX } from 'lucide-react';
import { Button } from '../ui/button';

interface EmptyCentersStateProps {
  onReset: () => void;
}

export function EmptyCentersState({ onReset }: EmptyCentersStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-[#1A2332]/40 rounded-3xl border border-dashed border-border/60">
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
        <SearchX className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="text-xl font-bold mb-2 text-foreground">لا توجد مراكز تطابق الفلاتر الحالية</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        عذراً، لم نتمكن من العثور على أي مراكز تبرع تطابق بحثك أو الفلاتر المحددة. جرب تغيير نوع التبرع أو المحافظة.
      </p>
      <Button onClick={onReset} className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
        إعادة ضبط الفلاتر
      </Button>
    </div>
  );
}
