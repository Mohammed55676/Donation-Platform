import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Building2, LogOut, FileText, ChevronDown, ChevronUp, Loader2, Clock, XCircle, HeartHandshake, Target, CheckSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link, useNavigate } from 'react-router';

import CharityCampaignsTab from '../components/charity/CharityCampaignsTab';
import CharityRequestsTab from '../components/charity/CharityRequestsTab';
import CharityOffersTab from '../components/charity/CharityOffersTab';

export function CharityDashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [charityName, setCharityName] = useState(user?.charityName || '');
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'campaigns' | 'requests' | 'offers'>('campaigns');

  const handleSubmitProfile = async () => {
    if (!charityName.trim()) { toast.error('اسم الجمعية مطلوب'); return; }
    setProfileSubmitting(true);
    // Dummy API call for profile submission if needed, or implement it in your backend
    toast.success('تم تقديم ملف الجمعية بنجاح');
    updateUser({ ...user, charityStatus: 'pending', charityName });
    setProfileSubmitting(false);
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

        {/* ── Verified charity — dashboard ── */}
        {user?.charityStatus === 'verified' && (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 shrink-0 space-y-1">
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-start ${activeTab === 'campaigns' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/50' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 border border-transparent'}`}
              >
                <Target className="w-5 h-5" /> حملات التبرع
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-start ${activeTab === 'requests' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/50' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 border border-transparent'}`}
              >
                <CheckSquare className="w-5 h-5" /> احتياجاتنا
              </button>
              <button
                onClick={() => setActiveTab('offers')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-start ${activeTab === 'offers' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/50' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 border border-transparent'}`}
              >
                <HeartHandshake className="w-5 h-5" /> عروض المتبرعين
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              {activeTab === 'campaigns' && <CharityCampaignsTab />}
              {activeTab === 'requests' && <CharityRequestsTab />}
              {activeTab === 'offers' && <CharityOffersTab />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
