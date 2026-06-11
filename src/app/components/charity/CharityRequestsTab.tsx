import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, Plus, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import api from '../../utils/api';
import { toast } from 'sonner';
import CreateRequestModal from './CreateRequestModal';

interface DonationRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  quantityNeeded: number;
  quantityReceived: number;
  urgency: string;
  status: 'pending_review' | 'active' | 'completed' | 'cancelled';
  location: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending_review: { label: 'بانتظار المراجعة',  cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' },
  active:         { label: 'نشطة',               cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' },
  completed:      { label: 'مكتملة',             cls: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' },
  cancelled:      { label: 'ملغاة',              cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

export default function CharityRequestsTab() {
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/donation-requests/my');
      setRequests(res.data.data || []);
    } catch {
      toast.error('فشل تحميل الاحتياجات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">احتياجات الجمعية</h2>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
            <Plus className="w-4 h-4" /> طلب احتياجات
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium mb-1">لا توجد طلبات احتياجات حالياً</p>
          <p className="text-slate-400 text-sm mb-4">اطلب ما تحتاجه الجمعية من المتبرعين</p>
          <Button onClick={() => setShowCreateModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
            <Plus className="w-4 h-4" /> طلب احتياجات
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => {
            const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending_review;
            const progress = Math.min(100, Math.round((req.quantityReceived / req.quantityNeeded) * 100));
            return (
              <div
                key={req.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {req.urgency}
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                      {req.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {req.category} • {req.location}
                    </p>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">تم استلام: {req.quantityReceived}</span>
                        <span className="text-slate-500">المطلوب: {req.quantityNeeded}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateRequestModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadRequests();
        }}
      />
    </>
  );
}
