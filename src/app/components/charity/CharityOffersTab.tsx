import { useState, useEffect } from 'react';
import { Package, Check, X, Loader2, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import api from '../../utils/api';
import { toast } from 'sonner';

interface DonorOffer {
  id: string;
  donorId: { _id: string; name: string; avatar: string; email: string; phone: string };
  donationRequestId: { _id: string; title: string };
  offeredItem: string;
  offeredQuantity: number;
  condition: string;
  status: 'new' | 'accepted' | 'rejected' | 'received';
  message: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  new:      { label: 'عرض جديد',       cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' },
  accepted: { label: 'مقبول (قيد التسليم)', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' },
  rejected: { label: 'مرفوض',            cls: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' },
  received: { label: 'تم الاستلام',      cls: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' },
};

export default function CharityOffersTab() {
  const [offers, setOffers] = useState<DonorOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/donor-offers/charity');
      setOffers(res.data.data || []);
    } catch {
      toast.error('فشل تحميل عروض المتبرعين');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'accept' | 'reject' | 'received') => {
    try {
      await api.patch(`/donor-offers/${id}/${action}`);
      toast.success(
        action === 'accept' ? 'تم قبول العرض! يمكنكم الآن التواصل عبر الرسائل.' :
        action === 'reject' ? 'تم رفض العرض' :
        'تم تأكيد استلام التبرع بنجاح!'
      );
      loadOffers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'حدث خطأ');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">عروض المتبرعين</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium mb-1">لا توجد عروض حالياً</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map(offer => {
            const cfg = STATUS_CONFIG[offer.status] || STATUS_CONFIG.new;
            return (
              <div
                key={offer.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                      <span className="text-xs text-slate-500">
                        لطلب: <span className="font-semibold">{offer.donationRequestId?.title || 'طلب محذوف'}</span>
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                      {offer.offeredQuantity} × {offer.offeredItem} ({offer.condition})
                    </h4>
                    
                    {offer.message && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        "{offer.message}"
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                      <img src={offer.donorId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(offer.donorId?.name || 'مجهول')}`} alt="Donor" className="w-6 h-6 rounded-full" />
                      <span className="text-xs font-medium">{offer.donorId?.name || 'متبرع'}</span>
                      <span className="text-xs text-slate-400">• {new Date(offer.createdAt).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                    {offer.status === 'new' && (
                      <>
                        <Button size="sm" onClick={() => handleAction(offer.id, 'accept')} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">
                          <Check className="w-4 h-4 me-1" /> قبول العرض
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleAction(offer.id, 'reject')} className="w-full text-red-600 hover:text-red-700">
                          <X className="w-4 h-4 me-1" /> رفض
                        </Button>
                      </>
                    )}
                    {offer.status === 'accepted' && (
                      <>
                        <Button size="sm" onClick={() => handleAction(offer.id, 'received')} className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                          <CheckCircle2 className="w-4 h-4 me-1" /> تأكيد الاستلام
                        </Button>
                        {/* <Link to="/messages"> */}
                        <Button size="sm" variant="outline" className="w-full">
                          <MessageSquare className="w-4 h-4 me-1" /> مراسلة
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
