import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';
import { toast } from 'sonner';
import { Building2, CheckCircle2, Clock, XCircle, Loader2, Send, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router';

interface Charity {
  id: string;
  name: string;
  charityName: string;
  charityBadge: boolean;
  avatar?: string;
  location?: string;
  phone?: string;
}

export function JoinCharity() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [myStatus, setMyStatus] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [charitiesRes, statusRes] = await Promise.all([
        api.get('/charity/verified'),
        api.get('/charity/my-status'),
      ]);
      setCharities(charitiesRes.data.data || []);
      setMyStatus(statusRes.data.data);
    } catch (err) {
      console.error('Failed to load charities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (charityId: string) => {
    setJoining(charityId);
    try {
      const res = await api.post(`/charity/join/${charityId}`, { note });
      toast.success('تم إرسال طلب الانضمام بنجاح!');
      setMyStatus({
        status: 'pending_admin',
        charityId: charityId,
      });
      // Refresh user data
      if (res.data.data) {
        updateUser(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'حدث خطأ');
    } finally {
      setJoining(null);
    }
  };

  const statusConfig: Record<string, { icon: any; color: string; bg: string; text: string }> = {
    not_submitted: { icon: Send, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800', text: 'لم تتقدم بعد' },
    pending_admin: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'بانتظار موافقة الإدارة' },
    verified: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'تم التحقق — يمكنك طلب التبرعات' },
    rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30', text: 'تم رفض طلبك — يمكنك التقديم لجمعية أخرى' },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentStatus = myStatus?.status || user?.charityStatus || 'not_submitted';
  const statusInfo = statusConfig[currentStatus] || statusConfig.not_submitted;
  const StatusIcon = statusInfo.icon;
  const canJoin = currentStatus === 'not_submitted' || currentStatus === 'rejected';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
          الانضمام لجمعية خيرية
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          للحصول على تصريح طلب التبرعات، يجب أن تكون مسجلاً لدى جمعية خيرية موثقة
        </p>
      </div>

      {/* Current Status Card */}
      <div className={`rounded-xl p-4 sm:p-6 mb-8 border ${statusInfo.bg}`}>
        <div className="flex items-center gap-3">
          <StatusIcon className={`w-6 h-6 flex-shrink-0 ${statusInfo.color}`} />
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">حالة التحقق</h3>
            <p className={`text-sm ${statusInfo.color}`}>{statusInfo.text}</p>
            {currentStatus === 'rejected' && myStatus?.note && (
              <p className="text-xs text-red-500 mt-1">السبب: {myStatus.note}</p>
            )}
          </div>
        </div>
        {currentStatus === 'verified' && (
          <div className="mt-4">
            <Link to="/donations">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                تصفح التبرعات المتاحة
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Charities List */}
      {canJoin && (
        <>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            الجمعيات الموثقة المتاحة
          </h2>

          {charities.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">لا توجد جمعيات موثقة حالياً</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Note input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  ملاحظة للجمعية (اختياري)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="اكتب ملاحظة أو سبب طلبك..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm resize-none h-20 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {charities.map((charity) => (
                <div
                  key={charity.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {charity.charityName || charity.name}
                        </h3>
                        {charity.charityBadge && (
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      {charity.location && (
                        <p className="text-xs text-slate-500">{charity.location}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleJoin(charity.id)}
                    disabled={joining === charity.id}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm px-6"
                  >
                    {joining === charity.id ? (
                      <><Loader2 className="w-4 h-4 animate-spin me-2" /> جاري الإرسال</>
                    ) : (
                      'طلب الانضمام'
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {currentStatus === 'pending_admin' && (
        <div className="text-center py-8 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <Clock className="w-12 h-12 mx-auto mb-3 text-amber-500" />
          <p className="text-amber-700 dark:text-amber-400 font-medium">
            طلبك قيد المراجعة من الإدارة
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
            سيتم إخطارك عند الموافقة أو الرفض
          </p>
        </div>
      )}
    </div>
  );
}
