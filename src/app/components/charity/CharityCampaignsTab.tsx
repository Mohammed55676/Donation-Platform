import { useState, useEffect } from 'react';
import { Package, Clock, Activity, CheckCircle2, XCircle, Plus, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import api from '../../utils/api';
import { toast } from 'sonner';
import CreateCampaignModal from './CreateCampaignModal';

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

export default function CharityCampaignsTab() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

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
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">حملات التبرع</h2>
        <div className="flex gap-2">
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
          <p className="text-slate-500 font-medium mb-1">لا توجد حملات حالياً</p>
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

      <CreateCampaignModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onSuccess={() => {
          setShowCreateModal(false);
          loadCampaigns();
        }} 
      />
    </>
  );
}
