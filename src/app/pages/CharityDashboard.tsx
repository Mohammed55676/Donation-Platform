import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'sonner';
import {
  Building2, CheckCircle2, XCircle, Clock, Loader2,
  FileText, ChevronDown, ChevronUp, LogOut, Plus, Package,
  ExternalLink, RefreshCw, Activity
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link, useNavigate } from 'react-router';
import CreateCampaignModal from '../components/charity/CreateCampaignModal';

interface Campaign {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  status: 'pending_review' | 'active' | 'completed' | 'cancelled';
  urgency: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending_review: { label: 'بانتظار المراجعة',  cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' },
  active:         { label: 'نشطة',               cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' },
  completed:      { label: 'مكتملة',             cls: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' },
  cancelled:      { label: 'ملغاة',              cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

export function CharityDashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const [charityName, setCharityName] = useState(user?.charityName || '');
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (user?.charityStatus === 'verified') {
      loadCampaigns();
    } else {
      setLoading(false);
    }
  }, [user?.charityStatus]);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/campaigns/my');
      setCampaigns(res.data.data || []);
    } catch {
      toast.error('فشل تحميل حملات التبرع');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProfile = async () => {
    if (!charityName.trim()) { toast.error('اسم الجمعية مطلوب'); return; }
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

  const handleLogout = () => { logout(); navigate('/'); };

  const charityStatusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      pending:  { label: 'بانتظار مراجعة الإدارة', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' },
      verified: { label: 'جمعية موثقة',             cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' },
      rejected: { label: 'مرفوضة',                   cls: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' },
    };
    const c = map[status] || map.pending;
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${c.cls}`}>{c.label}</span>;
  };

  const counts = {
    all:            campaigns.length,
    pending_review: campaigns.filter(c => c.status === 'pending_review').length,
    active:         campaigns.filter(c => c.status === 'active').length,
    completed:      campaigns.filter(c => c.status === 'completed').length,
    cancelled:      campaigns.filter(c => c.status === 'cancelled').length,
  };

  const filterTabs = [
    { key: 'all',            label: 'جميع الحملات',     icon: Package,      count: counts.all },
    { key: 'pending_review', label: 'بانتظار المراجعة', icon: Clock,        count: counts.pending_review },
    { key: 'active',         label: 'نشطة',             icon: Activity,     count: counts.active },
    { key: 'completed',      label: 'مكتملة',           icon: CheckCircle2, count: counts.completed },
    { key: 'cancelled',      label: 'ملغاة',            icon: XCircle,      count: counts.cancelled },
  ];

  const filtered = filter === 'all' ? campaigns : campaigns.filter(c => c.status === filter);

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
                {user?.charityStatus && charityStatusBadge(user.charityStatus)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/"><Button variant="ghost" size="sm">الرئيسية</Button></Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 me-1" /> خروج
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Charity not verified yet ── */}
        {user?.charityStatus !== 'verified' && (
          <div className="max-w-lg mx-auto">
            {user?.charityStatus === 'pending' && (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <Clock className="w-16 h-16 mx-auto mb-4 text-amber-500" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">طلبك قيد المراجعة</h2>
                <p className="text-slate-500 dark:text-slate-400">الإدارة تراجع ملف جمعيتك. سيتم إخطارك عند الموافقة.</p>
              </div>
            )}

            {user?.charityStatus === 'rejected' && (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-800 shadow-sm">
                <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">تم رفض طلبك</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-4">يمكنك إعادة تقديم الملف بعد تصحيح البيانات</p>
              </div>
            )}

            {(!user?.charityStatus || user?.charityStatus === 'rejected') && (
              <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">تقديم ملف الجمعية</h3>
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
                        onChange={e => setCharityName(e.target.value)}
                        placeholder="اسم الجمعية الخيرية"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <Button
                      onClick={handleSubmitProfile}
                      disabled={profileSubmitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11"
                    >
                      {profileSubmitting
                        ? <><Loader2 className="w-4 h-4 animate-spin me-2" />جاري الإرسال</>
                        : 'تقديم الملف'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Verified charity — manage campaigns ── */}
        {user?.charityStatus === 'verified' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">حملات التبرع الخاصة بك</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={loadCampaigns} className="gap-1">
                  <RefreshCw className="w-4 h-4" /> تحديث
                </Button>
                <Button size="sm" onClick={() => setShowCreateModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
                  <Plus className="w-4 h-4" /> إنشاء حملة تبرع
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              {filterTabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`p-3 rounded-xl border transition-all text-right ${
                      filter === tab.key
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 shrink-0 ${filter === tab.key ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 truncate">{tab.label}</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{tab.count}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500 font-medium mb-1">لا توجد حملات تبرع حالياً</p>
                <p className="text-slate-400 text-sm mb-4">قم بإنشاء حملة تبرع جديدة</p>
                <Button onClick={() => setShowCreateModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                  <Plus className="w-4 h-4" /> إنشاء حملة تبرع
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(campaign => {
                  const cfg = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.pending_review;
                  const progress = Math.min(100, Math.round((campaign.current / campaign.target) * 100));
                  return (
                    <div
                      key={campaign.id}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
                              {cfg.label}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {campaign.urgency}
                            </span>
                          </div>
                          <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                            {campaign.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(campaign.createdAt).toLocaleDateString('ar-SA')}
                          </p>
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-500">تم جمع: {campaign.current}</span>
                              <span className="text-slate-500">الهدف: {campaign.target}</span>
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
          </>
        )}
      </div>

      <CreateCampaignModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onSuccess={() => {
          setShowCreateModal(false);
          loadCampaigns();
        }} 
      />
    </div>
  );
}
