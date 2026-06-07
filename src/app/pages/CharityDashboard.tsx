import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'sonner';
import {
  Building2, Users, CheckCircle2, XCircle, Clock, Loader2,
  ShieldCheck, ShieldAlert, FileText, ChevronDown, ChevronUp, LogOut
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link, useNavigate } from 'react-router';

interface Beneficiary {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  beneficiaryStatus: string;
  beneficiaryVerificationNote?: string;
  createdAt: string;
}

export function CharityDashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending_charity');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [charityName, setCharityName] = useState(user?.charityName || '');
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (user?.charityStatus === 'verified') {
      loadBeneficiaries();
    } else {
      setLoading(false);
    }
  }, [filter, user?.charityStatus]);

  const loadBeneficiaries = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/charity/beneficiaries?status=${filter}`);
      setBeneficiaries(res.data.data || []);
    } catch (err) {
      console.error('Failed to load beneficiaries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (beneficiaryId: string, action: 'approve' | 'reject', note?: string) => {
    setActionLoading(beneficiaryId);
    try {
      await api.put(`/charity/beneficiaries/${beneficiaryId}`, {
        action,
        note: note || undefined,
      });
      toast.success(action === 'approve' ? 'تم قبول المستفيد' : 'تم رفض المستفيد');
      setBeneficiaries(prev => prev.filter(b => b.id !== beneficiaryId));
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitProfile = async () => {
    if (!charityName.trim()) {
      toast.error('اسم الجمعية مطلوب');
      return;
    }
    setProfileSubmitting(true);
    try {
      const res = await api.post('/charity/profile', { charityName });
      toast.success('تم تقديم ملف الجمعية بنجاح');
      if (res.data.data) updateUser(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'حدث خطأ');
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج');
    navigate('/');
  };

  const statusBadge = (status: string) => {
    const configs: Record<string, { label: string; cls: string }> = {
      pending: { label: 'بانتظار مراجعة الإدارة', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' },
      verified: { label: 'جمعية موثقة', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' },
      rejected: { label: 'مرفوضة', cls: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' },
    };
    const c = configs[status] || configs.pending;
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${c.cls}`}>{c.label}</span>;
  };

  const filterTabs = [
    { key: 'pending_charity', label: 'بانتظار الموافقة', icon: Clock },
    { key: 'verified', label: 'موثقون', icon: CheckCircle2 },
    { key: 'rejected', label: 'مرفوضون', icon: XCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white">
                {user?.charityName || 'لوحة إدارة الجمعية'}
              </h1>
              <div className="flex items-center gap-2">
                {user?.charityStatus && statusBadge(user.charityStatus)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm">الرئيسية</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 me-1" /> خروج
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Charity not verified yet */}
        {user?.charityStatus !== 'verified' && (
          <div className="max-w-lg mx-auto">
            {/* Pending status */}
            {user?.charityStatus === 'pending' && (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <Clock className="w-16 h-16 mx-auto mb-4 text-amber-500" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  طلبك قيد المراجعة
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  الإدارة تراجع ملف جمعيتك. سيتم إخطارك عند الموافقة.
                </p>
              </div>
            )}

            {/* Rejected */}
            {user?.charityStatus === 'rejected' && (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-800 shadow-sm">
                <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  تم رفض طلبك
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  يمكنك إعادة تقديم الملف بعد تصحيح البيانات
                </p>
              </div>
            )}

            {/* No profile submitted yet */}
            {(!user?.charityStatus || user?.charityStatus === 'rejected') && (
              <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      تقديم ملف الجمعية
                    </h3>
                  </div>
                  {showProfile ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {showProfile && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        اسم الجمعية
                      </label>
                      <input
                        type="text"
                        value={charityName}
                        onChange={(e) => setCharityName(e.target.value)}
                        placeholder="اسم الجمعية الخيرية"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <Button
                      onClick={handleSubmitProfile}
                      disabled={profileSubmitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11"
                    >
                      {profileSubmitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin me-2" /> جاري الإرسال</>
                      ) : (
                        'تقديم الملف'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Verified charity — manage beneficiaries */}
        {user?.charityStatus === 'verified' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {filterTabs.map(tab => {
                const Icon = tab.icon;
                const count = tab.key === filter ? beneficiaries.length : '—';
                return (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`p-4 rounded-xl border transition-all text-right ${
                      filter === tab.key
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${filter === tab.key ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <div>
                        <p className="text-sm text-slate-500">{tab.label}</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{count}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Beneficiaries list */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : beneficiaries.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500">لا يوجد مستفيدون في هذه الفئة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {beneficiaries.map(b => (
                  <div
                    key={b.id}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Users className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">{b.name}</h4>
                          <p className="text-xs text-slate-500" dir="ltr">{b.email}</p>
                          {b.phone && <p className="text-xs text-slate-400" dir="ltr">{b.phone}</p>}
                          {b.beneficiaryVerificationNote && (
                            <p className="text-xs text-slate-500 mt-1">
                              ملاحظة: {b.beneficiaryVerificationNote}
                            </p>
                          )}
                        </div>
                      </div>

                      {filter === 'pending_charity' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReview(b.id, 'approve')}
                            disabled={actionLoading === b.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs"
                          >
                            {actionLoading === b.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <><CheckCircle2 className="w-3 h-3 me-1" /> قبول</>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReview(b.id, 'reject', 'لم يستوفِ الشروط')}
                            disabled={actionLoading === b.id}
                            className="border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-xs"
                          >
                            <XCircle className="w-3 h-3 me-1" /> رفض
                          </Button>
                        </div>
                      )}

                      {filter === 'verified' && (
                        <span className="flex items-center gap-1 text-xs text-emerald-600">
                          <ShieldCheck className="w-3 h-3" /> موثق
                        </span>
                      )}

                      {filter === 'rejected' && (
                        <span className="flex items-center gap-1 text-xs text-red-500">
                          <XCircle className="w-3 h-3" /> مرفوض
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
