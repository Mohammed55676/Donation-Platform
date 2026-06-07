import { useState } from 'react';
import { Heart, HandHeart, Loader2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface UserTypeModalProps {
  open: boolean;
  onClose: (selectedType: 'donor' | 'beneficiary') => void;
}

export function UserTypeModal({ open, onClose }: UserTypeModalProps) {
  const [selected, setSelected] = useState<'donor' | 'beneficiary' | null>(null);
  const [loading, setLoading] = useState(false);
  const { updateUser } = useAuth();

  if (!open) return null;

  const handleConfirm = async () => {
    if (!selected) {
      toast.error('يرجى اختيار نوع الحساب');
      return;
    }
    setLoading(true);
    try {
      await updateUser({ user_type: selected } as any);
      toast.success(selected === 'donor' ? 'تم تسجيلك كمتبرع! 🎉' : 'تم تسجيلك كمستفيد! 🎉');
      onClose(selected);
    } catch {
      toast.error('حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-[90%] max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            مرحباً بك! 👋
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            اختر نوع حسابك للمتابعة
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {/* Donor option */}
          <button
            type="button"
            onClick={() => setSelected('donor')}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-right ${
              selected === 'donor'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-md shadow-emerald-500/10'
                : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
              selected === 'donor'
                ? 'bg-emerald-500 text-white'
                : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
            }`}>
              <HandHeart className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white">متبرع</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                أريد التبرع ومساعدة الآخرين
              </p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              selected === 'donor'
                ? 'border-emerald-500 bg-emerald-500'
                : 'border-slate-300 dark:border-slate-600'
            }`}>
              {selected === 'donor' && (
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </button>

          {/* Beneficiary option */}
          <button
            type="button"
            onClick={() => setSelected('beneficiary')}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-right ${
              selected === 'beneficiary'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-md shadow-blue-500/10'
                : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
              selected === 'beneficiary'
                ? 'bg-blue-500 text-white'
                : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
            }`}>
              <Heart className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white">مستفيد</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                أحتاج مساعدة وأريد طلب تبرعات
              </p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              selected === 'beneficiary'
                ? 'border-blue-500 bg-blue-500'
                : 'border-slate-300 dark:border-slate-600'
            }`}>
              {selected === 'beneficiary' && (
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </button>
        </div>

        {/* Confirm Button */}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selected || loading}
          className={`w-full h-12 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
            selected
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
              : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري الحفظ...</span>
            </>
          ) : (
            <span>تأكيد الاختيار</span>
          )}
        </button>

        <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-3">
          يمكنك تغيير نوع حسابك لاحقاً من الإعدادات
        </p>
      </div>
    </div>
  );
}
