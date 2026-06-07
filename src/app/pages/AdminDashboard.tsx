import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router';
import api from '../utils/api';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import {
  Trash2, Check, X, Eye, ShieldCheck, Search, Plus, Pencil,
  Users, Gift, CheckCircle, AlertTriangle, TrendingUp, Ban, Target, MapPin, Calendar
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { useDonations } from '../context/DonationContext';
import { useCampaigns } from '../hooks/useCampaigns';
import { useVolunteerOpportunities } from '../hooks/useVolunteerOpportunities';
import type { Campaign } from '../hooks/useCampaigns';
import type { VolunteerOpportunity } from '../hooks/useVolunteerOpportunities';

// ── Status maps ────────────────────────────────────────────────
const DONATION_STATUS_BADGE: Record<string, string> = {
  'متاح':          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 text-xs',
  'محجوز':         'bg-orange-100 text-orange-700 dark:bg-orange-900/30 text-xs',
  'تم التسليم':    'bg-green-100 text-green-700 dark:bg-green-900/30 text-xs',
  'قيد المراجعة': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 text-xs',
  'مرفوض':         'bg-red-100 text-red-700 dark:bg-red-900/30 text-xs',
};

// ── Mock Data ──────────────────────────────────────────────────
const monthlyData = [
  { month: 'أكتوبر', users: 42, donations: 78, deliveries: 65 },
  { month: 'نوفمبر', users: 58, donations: 95, deliveries: 82 },
  { month: 'ديسمبر', users: 71, donations: 112, deliveries: 98 },
  { month: 'يناير', users: 89, donations: 134, deliveries: 115 },
  { month: 'فبراير', users: 103, donations: 155, deliveries: 138 },
  { month: 'مارس', users: 127, donations: 189, deliveries: 162 },
];

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'volunteer';
  avatar?: string;
  joinDate: string;
  status: 'active' | 'banned';
  donations: number;
}

const urgentCases = [
  { id: 'u1', title: 'أسرة محتاجة بعجلة', description: 'أسرة من 5 أفراد تحتاج ملابس شتوية وغذاء عاجل', category: 'ملابس + غذاء', location: 'عمان - عبدون', severity: 'critical' },
  { id: 'u2', title: 'طفل يحتاج كتبًا مدرسية', description: 'طالب لم يستطع الحصول على كتبه هذا الفصل', category: 'كتب', location: 'إربد - شارع الجامعة', severity: 'high' },
  { id: 'u3', title: 'عائلة بدون طعام', description: 'توصلنا بطلب عاجل من عائلة تفتقر لمواد غذائية', category: 'طعام', location: 'الزرقاء - وسط المدينة', severity: 'critical' },
];

// Empty campaign form
const emptyCampaign: Omit<Campaign, 'id'> = {
  title: '',
  description: '',
  image: '',
  target: 100,
  current: 0,
  urgency: 'متوسطة',
  isActive: true,
};

// Empty volunteer opportunity form
const emptyOppForm: Omit<VolunteerOpportunity, 'id' | 'volunteers' | 'spotsLeft' | 'applicants'> = {
  title: '',
  description: '',
  location: '',
  date: '',
  maxVolunteers: 20,
  isActive: true,
  createdBy: '',
};

export function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'analytics';

  const { donations, updateDonationStatus, fetchDonations } = useDonations();

  // ── Users state ──────────────────────────────────────────────
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.get('/users').then(res => setUsers(Array.isArray(res.data.data) ? res.data.data : [])).catch(console.error);
  }, []);
  const [confirmAction, setConfirmAction] = useState<{ type: string; id: string; label: string } | null>(null);
  const [assignCase, setAssignCase] = useState<typeof urgentCases[0] | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Add-user form state
  const [addUserForm, setAddUserForm] = useState({ name: '', email: '', password: '', role: 'user' as 'user' | 'volunteer' });
  const [addUserErrors, setAddUserErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  // ── Campaigns state ──────────────────────────────────────────
  const { campaigns, addCampaign, updateCampaign, deleteCampaign } = useCampaigns();
  const [campaignModal, setCampaignModal] = useState<{ open: boolean; editing: Campaign | null }>({ open: false, editing: null });
  const [campaignForm, setCampaignForm] = useState<Omit<Campaign, 'id'>>(emptyCampaign);
  const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null);

  // ── Volunteer Opportunities state ────────────────────────────
  const { opportunities, addOpportunity, updateOpportunity, deleteOpportunity } = useVolunteerOpportunities();
  const [oppModal, setOppModal] = useState<{ open: boolean; editing: VolunteerOpportunity | null }>({ open: false, editing: null });
  const [oppForm, setOppForm] = useState<Omit<VolunteerOpportunity, 'id' | 'volunteers' | 'spotsLeft' | 'applicants'>>(emptyOppForm);
  const [deleteOppId, setDeleteOppId] = useState<string | null>(null);

  // ── Helpers ──────────────────────────────────────────────────
  const setTab = (tab: string) => setSearchParams(tab === 'analytics' ? {} : { tab });

  // ── Beneficiary Verifications state ──────────────────────────
  const [verifications, setVerifications] = useState<any[]>([]);
  const [verificationsLoading, setVerificationsLoading] = useState(false);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; profileId: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // ── Donation Requests (admin) state ──────────────────────────
  const [adminRequests, setAdminRequests] = useState<any[]>([]);
  const [adminRequestsLoading, setAdminRequestsLoading] = useState(false);
  const [emergencyDialog, setEmergencyDialog] = useState<{ open: boolean; requestId: string } | null>(null);
  const [emergencyReason, setEmergencyReason] = useState('');

  // ── Charities (admin) state ─────────────────────────────────
  const [adminCharities, setAdminCharities] = useState<any[]>([]);
  const [charitiesLoading, setCharitiesLoading] = useState(false);
  const [charityFilter, setCharityFilter] = useState('pending');

  const fetchVerifications = async () => {
    setVerificationsLoading(true);
    try {
      const res = await api.get('/beneficiary/admin/profiles');
      setVerifications(Array.isArray(res.data.data) ? res.data.data : []);
    } catch { setVerifications([]); }
    finally { setVerificationsLoading(false); }
  };

  const fetchAdminRequests = async () => {
    setAdminRequestsLoading(true);
    try {
      const res = await api.get('/donation-requests/admin');
      setAdminRequests(Array.isArray(res.data.data) ? res.data.data : []);
    } catch { setAdminRequests([]); }
    finally { setAdminRequestsLoading(false); }
  };

  const fetchCharities = async () => {
    setCharitiesLoading(true);
    try {
      const res = await api.get(`/charity/admin/list?status=${charityFilter}`);
      setAdminCharities(Array.isArray(res.data.data) ? res.data.data : []);
    } catch { setAdminCharities([]); }
    finally { setCharitiesLoading(false); }
  };

  useEffect(() => { fetchVerifications(); fetchAdminRequests(); fetchCharities(); }, []);
  useEffect(() => { fetchCharities(); }, [charityFilter]);
  useEffect(() => { if (activeTab === 'donations') fetchDonations(); }, [activeTab]);

  const displayedUsers = useMemo(
    () => (users || []).filter(
      (u) =>
        (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(userSearch.toLowerCase())
    ),
    [users, userSearch]
  );

  // ── Add User ─────────────────────────────────────────────────
  const validateAddUser = () => {
    const e: { name?: string; email?: string; password?: string } = {};
    if (!addUserForm.name.trim()) e.name = 'الاسم مطلوب';
    else if (addUserForm.name.trim().length < 3) e.name = 'الاسم يجب أن يكون 3 أحرف على الأقل';
    if (!addUserForm.email.trim()) e.email = 'البريد الإلكتروني مطلوب';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addUserForm.email)) e.email = 'البريد الإلكتروني غير صحيح';
    if (!addUserForm.password) e.password = 'كلمة المرور مطلوبة';
    else if (addUserForm.password.length < 6) e.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    return e;
  };

  const handleAddUser = async () => {
    const errs = validateAddUser();
    if (Object.keys(errs).length > 0) {
      setAddUserErrors(errs);
      return;
    }
    try {
      const result = await api.post('/users', {
        name: addUserForm.name.trim(),
        email: addUserForm.email.trim(),
        password: addUserForm.password,
        role: addUserForm.role
      });
      setUsers((prev) => [result.data.data, ...prev]);
      setIsAddUserOpen(false);
      setAddUserForm({ name: '', email: '', password: '', role: 'user' });
      setAddUserErrors({});
      toast.success('تمت إضافة المستخدم بنجاح');
    } catch (err: any) {
      setAddUserErrors({ email: err.response?.data?.error || 'حدث خطأ' });
    }
  };

  // ── Ban / Unban / Delete ─────────────────────────────────────
  const executeAction = async () => {
    if (!confirmAction) return;
    const { type, id } = confirmAction;

    try {
      if (type === 'ban' || type === 'unban') {
        const newStatus = type === 'ban' ? 'banned' : 'active';
        await api.put(`/users/${id}/status`, { status: newStatus });
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
        );
        toast.success(type === 'ban' ? 'تم تعليق الحساب' : 'تم رفع التعليق');
      } else if (type === 'delete_user') {
        await api.delete(`/users/${id}`);
        setUsers((prev) => prev.filter((u) => u.id !== id));
        toast.success('تم حذف المستخدم');
      } else if (type === 'approve') {
        await updateDonationStatus(id, 'متاح');
        toast.success('تم قبول التبرع');
      } else if (type === 'reject') {
        await updateDonationStatus(id, 'مرفوض');
        toast.error('تم رفض التبرع');
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء تنفيذ الإجراء');
    }
    setConfirmAction(null);
  };

  // ── Campaign CRUD ────────────────────────────────────────────
  const openAddCampaign = () => {
    setCampaignForm(emptyCampaign);
    setCampaignModal({ open: true, editing: null });
  };

  const openEditCampaign = (campaign: Campaign) => {
    const { id, ...rest } = campaign;
    setCampaignForm(rest);
    setCampaignModal({ open: true, editing: campaign });
  };

  const saveCampaign = () => {
    if (!campaignForm.title.trim()) { toast.error('يرجى إدخال عنوان الحملة'); return; }
    if (campaignModal.editing) {
      updateCampaign(campaignModal.editing.id, campaignForm);
      toast.success('تم تحديث الحملة');
    } else {
      addCampaign({ ...campaignForm });
      toast.success('تمت إضافة الحملة');
    }
    setCampaignModal({ open: false, editing: null });
  };

  // ── Volunteer Opportunity CRUD ───────────────────────────────
  const openAddOpp = () => {
    setOppForm(emptyOppForm);
    setOppModal({ open: true, editing: null });
  };

  const openEditOpp = (opp: VolunteerOpportunity) => {
    const { id, volunteers, ...rest } = opp;
    setOppForm(rest);
    setOppModal({ open: true, editing: opp });
  };

  const saveOpp = () => {
    if (!oppForm.title.trim()) { toast.error('يرجى إدخال عنوان الفرصة'); return; }
    if (!oppForm.location.trim()) { toast.error('يرجى إدخال الموقع'); return; }
    if (oppModal.editing) {
      updateOpportunity(oppModal.editing.id, oppForm);
      toast.success('تم تحديث فرصة التطوع');
    } else {
      addOpportunity({ ...oppForm });
      toast.success('تمت إضافة فرصة التطوع');
    }
    setOppModal({ open: false, editing: null });
  };

  // ── Stats ────────────────────────────────────────────────────
  const safeDonations = donations || [];
  const totalUsers = (users || []).length;
  const adminDonationsList = safeDonations.filter((d) =>
    ['قيد المراجعة', 'متاح', 'مرفوض'].includes(d.status)
  );
  const totalDonations = safeDonations.length;
  const completedDeliveries = safeDonations.filter((d) => d.status === 'تم التسليم').length;
  const pendingReview = safeDonations.filter((d) => d.status === 'قيد المراجعة').length;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Admin banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F1623] to-[#1A2332] border border-white/10 p-6 text-white shadow-xl">
          <div className="absolute top-0 end-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 start-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md flex-shrink-0">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-0.5">لوحة إدارة المنصة</h2>
                <p className="text-white/60 text-sm">
                  {pendingReview > 0 ? (
                    <span className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> {pendingReview} تبرع ينتظر المراجعة</span>
                  ) : 'جميع التبرعات تمت مراجعتها'}
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-white/30 text-sm">
              <span className="text-2xl">👑</span>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'المستخدمون', value: totalUsers, icon: Users, color: 'text-primary', bg: 'bg-primary/10 dark:bg-primary/15', trend: '+12 هذا الشهر' },
            { label: 'التبرعات', value: totalDonations, icon: Gift, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', trend: '+34 هذا الشهر' },
            { label: 'عمليات التسليم', value: completedDeliveries, icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', trend: '+24 هذا الشهر' },
            { label: 'بانتظار المراجعة', value: pendingReview, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={i} className="transition-all border-none card-shadow rounded-3xl hover:shadow-lg hover:shadow-primary/10 bg-card group">
                <CardContent className="p-5">
                  <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-5.5 w-5.5 ${s.color}`} />
                  </div>
                  <p className="text-3xl font-extrabold mb-0.5 font-display">{s.value}</p>
                  <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
                  {s.trend && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1 font-semibold"><TrendingUp className="h-3 w-3" />{s.trend}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs value={activeTab} onValueChange={setTab}>
          <TabsList className="flex flex-wrap gap-1 h-auto rounded-xl p-1.5 bg-muted overflow-x-auto">
            <TabsTrigger value="analytics" className="rounded-lg text-sm font-semibold">الإحصائيات</TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg text-sm font-semibold">المستخدمون</TabsTrigger>
            <TabsTrigger value="donations" className="rounded-lg text-sm font-semibold">التبرعات</TabsTrigger>
            <TabsTrigger value="campaigns" className="rounded-lg text-sm font-semibold">الحملات</TabsTrigger>
            <TabsTrigger value="volunteer" className="rounded-lg text-sm font-semibold">فرص التطوع</TabsTrigger>
            <TabsTrigger value="charities" className="rounded-lg text-sm font-semibold">الجمعيات الخيرية</TabsTrigger>
            <TabsTrigger value="requests" className="rounded-lg text-sm font-semibold">الطلبات</TabsTrigger>
            <TabsTrigger value="verifications" className="rounded-lg text-sm font-semibold">التحقق من الهوية</TabsTrigger>
            <TabsTrigger value="donation-requests" className="rounded-lg text-sm font-semibold">طلبات التبرع</TabsTrigger>
            <TabsTrigger value="urgent" className="rounded-lg text-sm font-semibold">
              <span>الحالات العاجلة</span>
              <span className="me- text-red-500">🔥</span>
            </TabsTrigger>
          </TabsList>

          {/* ANALYTICS */}
          <TabsContent value="analytics" className="mt-6 space-y-6">
            <Card className="border-none card-shadow rounded-3xl bg-card overflow-hidden">
              <CardHeader><CardTitle>النمو الشهري</CardTitle><CardDescription>المستخدمون والتبرعات وعمليات التسليم</CardDescription></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--foreground)" }} />
                    <YAxis tick={{ fontSize: 12, fill: "var(--foreground)" }} />
                    <Tooltip 
                      cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                      contentStyle={{ backgroundColor: "var(--card)", borderColor: "transparent", borderRadius: "1rem", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", color: "var(--foreground)" }}
                      itemStyle={{ color: "var(--foreground)", fontWeight: 500 }}
                      labelStyle={{ color: "var(--muted-foreground)", fontWeight: "bold", marginBottom: "4px" }}
                    />
                    <Bar dataKey="users" fill="var(--primary)" name="المستخدمون" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="donations" fill="var(--secondary)" name="التبرعات" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="deliveries" fill="#22c55e" name="التسليمات" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="border-none card-shadow rounded-3xl bg-card overflow-hidden">
              <CardHeader><CardTitle>اتجاه المستخدمين</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--foreground)" }} />
                    <YAxis tick={{ fontSize: 12, fill: "var(--foreground)" }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "var(--card)", borderColor: "transparent", borderRadius: "1rem", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", color: "var(--foreground)" }}
                      itemStyle={{ color: "var(--foreground)", fontWeight: 500 }}
                      labelStyle={{ color: "var(--muted-foreground)", fontWeight: "bold", marginBottom: "4px" }}
                    />
                    <Line type="monotone" dataKey="users" stroke="var(--primary)" strokeWidth={3} dot={{ r: 5, strokeWidth: 2, fill: "var(--card)" }} activeDot={{ r: 7 }} name="مستخدمون" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* USERS */}
          <TabsContent value="users" className="mt-6">
            <Card className="border-none card-shadow rounded-3xl bg-card overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>إدارة المستخدمين</CardTitle>
                  <CardDescription>{totalUsers} مستخدم مسجل</CardDescription>
                </div>
                <Button onClick={() => { setIsAddUserOpen(true); setAddUserForm({ name: '', email: '', password: '', role: 'user' }); setAddUserErrors({}); }} className="gap-2">
                  <Plus className="h-4 w-4" /> إضافة مستخدم
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4 relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="ابحث بالاسم أو البريد..." 
                    className="pe-"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  {displayedUsers.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">لا توجد نتائج</p>
                  )}
                  {displayedUsers.map((u) => (
                    <div key={u.id} className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border transition-colors ${u.status === 'banned' ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900' : 'bg-background hover:bg-muted/40'}`}>
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback className="text-sm bg-primary text-white">{(u.name || '').slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-sm">{u.name}</span>
                          <Badge variant="outline" className="text-xs">{u.role === 'volunteer' ? 'متطوع' : 'مستخدم'}</Badge>
                          {u.status === 'banned' && <Badge className="bg-red-100 text-red-600 dark:bg-red-900/30 text-xs">موقوف</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground" dir="ltr">{u.email}</p>
                        <p className="text-xs text-muted-foreground">انضم في {new Date(u.joinDate).toLocaleDateString('ar-SA')} • {u.donations} تبرع</p>
                      </div>
                      <div className="flex flex-wrap gap-2 flex-shrink-0">
                        {u.status === 'active' && (
                          <Button variant="outline" size="sm" className="h-8 gap-1 text-destructive hover:bg-destructive hover:text-white" onClick={() => setConfirmAction({ type: 'ban', id: u.id, label: `حظر حساب ${u.name}؟` })}>
                            <Ban className="h-3.5 w-3.5" /> حظر
                          </Button>
                        )}
                        {u.status === 'banned' && (
                          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => setConfirmAction({ type: 'unban', id: u.id, label: `إلغاء حظر حساب ${u.name}؟` })}>
                            <CheckCircle className="h-3.5 w-3.5" /> إلغاء الحظر
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => setSelectedUser(u)}>
                          <Eye className="h-3.5 w-3.5" /> تفاصيل
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setConfirmAction({ type: 'delete_user', id: u.id, label: `حذف حساب ${u.name} نهائياً؟` })}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DONATIONS */}
          <TabsContent value="donations" className="mt-6">
            <Card className="border-none card-shadow rounded-3xl bg-card overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>إدارة التبرعات</CardTitle>
                    <CardDescription>مراجعة وقبول أو رفض التبرعات</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchDonations}>تحديث</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {adminDonationsList.map((d) => (
                    <div key={d.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border bg-background hover:bg-muted/40 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{d.title}</span>
                          <Badge variant="outline" className="text-xs">{d.category}</Badge>
                          {d.urgency === 'عالية' && <Badge className="bg-red-100 text-red-600 dark:bg-red-900/30 text-xs">عاجل</Badge>}
                          <Badge className={
                            d.status === 'متاح' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 text-xs' :
                            d.status === 'مرفوض' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 text-xs' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 text-xs'
                          }>
                            {d.status === 'متاح' ? 'مقبول' : d.status === 'مرفوض' ? 'مرفوض' : 'بانتظار المراجعة'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">بواسطة: {d.donor.name} • {new Date(d.createdAt).toLocaleDateString('ar-SA')}</p>
                      </div>
                      {d.status === 'قيد المراجعة' && (
                        <div className="flex gap-2 flex-shrink-0">
                          <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white gap-1" onClick={() => setConfirmAction({ type: 'approve', id: d.id, label: `قبول تبرع "${d.title}"؟` })}>
                            <Check className="h-3.5 w-3.5" /> قبول
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 text-destructive hover:text-destructive gap-1" onClick={() => setConfirmAction({ type: 'reject', id: d.id, label: `رفض تبرع "${d.title}"؟` })}>
                            <X className="h-3.5 w-3.5" /> رفض
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CAMPAIGNS */}
          <TabsContent value="campaigns" className="mt-6">
            <Card className="border-none card-shadow rounded-3xl bg-card overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>إدارة الحملات</CardTitle>
                  <CardDescription>أضف أو عدّل أو احذف حملات التبرع</CardDescription>
                </div>
                <Button onClick={openAddCampaign} className="gap-2">
                  <Plus className="h-4 w-4" /> إضافة حملة
                </Button>
              </CardHeader>
              <CardContent>
                {campaigns.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">لا توجد حملات بعد. أضف حملة جديدة.</p>
                )}
                <div className="space-y-4">
                  {campaigns.map((c) => {
                    const pct = c.target > 0 ? Math.min(100, Math.round((c.current / c.target) * 100)) : 0;
                    return (
                      <div key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border bg-background hover:bg-muted/40 transition-colors">
                        {c.image && <img src={c.image} alt={c.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-sm">{c.title}</span>
                            <Badge className={c.urgency === 'عالية' ? 'bg-red-100 text-red-700 text-xs' : 'bg-yellow-100 text-yellow-700 text-xs'}>
                              {c.urgency === 'عالية' ? 'عاجل' : 'متوسط'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Target className="h-3 w-3" /> الهدف: {c.target}</span>
                              <span>تم جمعه: {c.current} ({pct}%)</span>
                            </div>
                            <Progress value={pct} className="h-1.5" />
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => openEditCampaign(c)}>
                            <Pencil className="h-3.5 w-3.5" /> تعديل
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteCampaignId(c.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VOLUNTEER OPPORTUNITIES */}
          <TabsContent value="volunteer" className="mt-6">
            <Card className="border-none card-shadow rounded-3xl bg-card overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>إدارة فرص التطوع</CardTitle>
                  <CardDescription>أضف أو عدّل الفرص التي تظهر في صفحة التطوع</CardDescription>
                </div>
                <Button onClick={openAddOpp} className="gap-2">
                  <Plus className="h-4 w-4" /> إضافة فرصة
                </Button>
              </CardHeader>
              <CardContent>
                {opportunities.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">لا توجد فرص تطوع. أضف فرصة جديدة.</p>
                )}
                <div className="space-y-4">
                  {opportunities.map((opp) => {
                    const pct = opp.maxVolunteers > 0 ? Math.min(100, Math.round((opp.volunteers / opp.maxVolunteers) * 100)) : 0;
                    const spotsLeft = opp.maxVolunteers - opp.volunteers;
                    return (
                      <div key={opp.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border bg-background hover:bg-muted/40 transition-colors">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-sm">{opp.title}</span>
                            <Badge variant={spotsLeft > 5 ? 'default' : 'destructive'} className={spotsLeft > 5 ? 'bg-secondary/20 text-secondary-foreground text-xs' : 'text-xs'}>
                              {spotsLeft} مقعد متبقي
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{opp.description}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{opp.location}</span>
                            {opp.date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(opp.date).toLocaleDateString('ar-SA')}</span>}
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{opp.volunteers}/{opp.maxVolunteers}</span>
                          </div>
                          <div className="space-y-1">
                            <Progress value={pct} className="h-1.5" />
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => openEditOpp(opp)}>
                            <Pencil className="h-3.5 w-3.5" /> تعديل
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteOppId(opp.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CHARITIES */}
          <TabsContent value="charities" className="mt-6">
            <Card className="border-none card-shadow rounded-3xl bg-card overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>إدارة الجمعيات الخيرية</CardTitle>
                    <CardDescription>مراجعة واعتماد أو رفض الجمعيات</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {['pending', 'verified', 'rejected'].map(s => (
                      <Button
                        key={s}
                        variant={charityFilter === s ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCharityFilter(s)}
                        className="text-xs"
                      >
                        {s === 'pending' ? 'معلقة' : s === 'verified' ? 'موثقة' : 'مرفوضة'}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {charitiesLoading ? (
                  <div className="text-center py-10 text-muted-foreground">جاري التحميل...</div>
                ) : adminCharities.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">لا توجد جمعيات في هذه الفئة</div>
                ) : (
                  <div className="space-y-3">
                    {adminCharities.map((ch: any) => (
                      <div key={ch.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border bg-background hover:bg-muted/40 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{ch.charityName || ch.name}</span>
                            {ch.charityBadge && (
                              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 text-xs">
                                <ShieldCheck className="h-3 w-3 me-1" /> موثقة
                              </Badge>
                            )}
                            <Badge className={
                              ch.charityStatus === 'pending' ? 'bg-amber-100 text-amber-700 text-xs' :
                              ch.charityStatus === 'verified' ? 'bg-emerald-100 text-emerald-700 text-xs' :
                              'bg-red-100 text-red-600 text-xs'
                            }>
                              {ch.charityStatus === 'pending' ? 'معلقة' : ch.charityStatus === 'verified' ? 'موثقة' : 'مرفوضة'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground" dir="ltr">{ch.email}</p>
                          {ch.phone && <p className="text-xs text-muted-foreground" dir="ltr">{ch.phone}</p>}
                          <p className="text-xs text-muted-foreground">
                            تاريخ التسجيل: {new Date(ch.createdAt).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                        {ch.charityStatus === 'pending' && (
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                              onClick={async () => {
                                try {
                                  await api.put(`/charity/admin/${ch.id}/review`, { action: 'approve' });
                                  toast.success('تم اعتماد الجمعية');
                                  fetchCharities();
                                } catch (err: any) {
                                  toast.error(err.response?.data?.error || 'حدث خطأ');
                                }
                              }}
                            >
                              <Check className="h-3.5 w-3.5" /> اعتماد
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-destructive hover:text-destructive gap-1"
                              onClick={async () => {
                                try {
                                  await api.put(`/charity/admin/${ch.id}/review`, { action: 'reject' });
                                  toast.success('تم رفض الجمعية');
                                  fetchCharities();
                                } catch (err: any) {
                                  toast.error(err.response?.data?.error || 'حدث خطأ');
                                }
                              }}
                            >
                              <X className="h-3.5 w-3.5" /> رفض
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* REQUESTS */}
          <TabsContent value="requests" className="mt-6">
            <Card className="border-none card-shadow rounded-3xl bg-card overflow-hidden">
              <CardHeader><CardTitle>مراقبة الطلبات</CardTitle><CardDescription>جميع طلبات المستخدمين</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {donations.slice(0, 5).map((d) => (
                    <div key={d.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border bg-background hover:bg-muted/40 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{d.title}</span>
                          <Badge variant="outline" className="text-xs">{d.category}</Badge>
                          <Badge className={DONATION_STATUS_BADGE[d.status] ?? 'bg-muted text-muted-foreground text-xs'}>
                            {d.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">من: {d.donor.name} • {d.location}</p>
                      </div>
                      <Link to={`/donations/${d.id}`}>
                        <Button variant="outline" size="sm" className="h-8 gap-1 flex-shrink-0">
                          <Eye className="h-3.5 w-3.5" /> عرض
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* URGENT */}
          <TabsContent value="urgent" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm font-medium text-red-700 dark:text-red-400">{urgentCases.length} حالات عاجلة تحتاج تدخلاً فورياً</p>
              </div>
              {urgentCases.map((c) => (
                <Card key={c.id} className={`border-none card-shadow rounded-2xl ${c.severity === 'critical' ? 'bg-red-50/50 dark:bg-red-950/20' : 'bg-orange-50/50 dark:bg-orange-950/20'}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{c.severity === 'critical' ? '🔥' : '⚠️'}</div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-bold">{c.title}</h3>
                          <Badge className={c.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30'}>
                            {c.severity === 'critical' ? 'حرج جداً' : 'عاجل'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{c.description}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>📦 {c.category}</span>
                          <span>📍 {c.location}</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" className="bg-primary text-white text-xs h-8" onClick={() => { setAssignCase(c); setSelectedVolunteer(''); }}>
                            تعيين متطوع
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => toast.info(`📋 ${c.title} — ${c.description}`)}>
                            عرض التفاصيل
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ══ VERIFICATIONS TAB ═══════════════════════════════════════ */}
          <TabsContent value="verifications" className="mt-6">
            <Card className="border-none card-shadow rounded-3xl bg-card overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>التحقق من الهوية</CardTitle>
                    <CardDescription>مراجعة طلبات التحقق من هوية المستفيدين</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchVerifications}>تحديث</Button>
                </div>
              </CardHeader>
              <CardContent>
                {verificationsLoading ? (
                  <div className="text-center py-10 text-muted-foreground">جاري التحميل...</div>
                ) : verifications.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">لا توجد طلبات تحقق حتى الآن</div>
                ) : (
                  <div className="space-y-4">
                    {verifications.map((v: any) => {
                      const statusColors: Record<string, string> = {
                        not_verified: 'bg-gray-100 text-gray-600',
                        pending_review: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30',
                        trusted: 'bg-green-100 text-green-700 dark:bg-green-900/30',
                        rejected: 'bg-red-100 text-red-600 dark:bg-red-900/30',
                        blocked: 'bg-red-200 text-red-800 dark:bg-red-900/50',
                      };
                      const statusLabels: Record<string, string> = {
                        not_verified: 'غير محقق', pending_review: 'قيد المراجعة',
                        trusted: 'موثوق', rejected: 'مرفوض', blocked: 'محظور',
                      };
                      return (
                        <Card key={v.id} className="border-none card-shadow rounded-2xl">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div>
                                <p className="font-semibold">{v.user_id?.name || '—'}</p>
                                <p className="text-sm text-muted-foreground">{v.user_id?.email}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">رقم الهوية: <span dir="ltr">{v.national_id_number}</span></p>
                                <p className="text-xs text-muted-foreground">
                                  تاريخ التقديم: {new Date(v.createdAt).toLocaleDateString('ar-SA')}
                                </p>
                              </div>
                              <Badge className={statusColors[v.verification_status] || ''}>{statusLabels[v.verification_status] || v.verification_status}</Badge>
                            </div>

                            {/* Extended profile details — admin only */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-muted/40 rounded-xl p-3">
                              {v.phone && <div><span className="text-muted-foreground">الهاتف:</span> <span dir="ltr">{v.phone}</span></div>}
                              {v.city && <div><span className="text-muted-foreground">المدينة:</span> {v.city}</div>}
                              {v.address && <div><span className="text-muted-foreground">العنوان:</span> {v.address}</div>}
                              {v.family_members && <div><span className="text-muted-foreground">أفراد الأسرة:</span> {v.family_members}</div>}
                              {v.employment_status && <div><span className="text-muted-foreground">الوظيفة:</span> {v.employment_status}</div>}
                              {v.monthly_income_range && <div><span className="text-muted-foreground">الدخل:</span> {v.monthly_income_range}</div>}
                              {v.housing_status && <div><span className="text-muted-foreground">السكن:</span> {v.housing_status}</div>}
                              {v.monthly_rent_range && <div><span className="text-muted-foreground">الإيجار:</span> {v.monthly_rent_range}</div>}
                              {v.social_security_status && <div><span className="text-muted-foreground">الضمان:</span> {v.social_security_status}</div>}
                              {v.naf_support_status && <div><span className="text-muted-foreground">صندوق المعونة:</span> {v.naf_support_status}</div>}
                              {v.delivery_ability && <div><span className="text-muted-foreground">الاستلام:</span> {v.delivery_ability}</div>}
                            </div>
                            {v.situation_explanation && (
                              <div className="text-xs bg-muted/40 rounded-xl p-3">
                                <span className="text-muted-foreground font-medium">شرح الوضع:</span>
                                <p className="mt-1">{v.situation_explanation}</p>
                              </div>
                            )}
                            {v.needs_categories?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {v.needs_categories.map((n: string) => (
                                  <Badge key={n} variant="outline" className="text-xs">{n}</Badge>
                                ))}
                              </div>
                            )}

                            {v.verification_rejection_reason && (
                              <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/30 p-2 rounded">
                                سبب الرفض: {v.verification_rejection_reason}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                              {/* View national ID document */}
                              <a
                                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/beneficiary/admin/profiles/${v.id}/document`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="outline" size="sm" className="gap-1">
                                  <Eye className="h-3.5 w-3.5" /> عرض الوثيقة
                                </Button>
                              </a>
                              {/* View proof documents */}
                              {v.proof_documents?.map((_: string, idx: number) => (
                                <a
                                  key={idx}
                                  href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/beneficiary/admin/profiles/${v.id}/proof/${idx}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button variant="outline" size="sm" className="gap-1 text-xs">
                                    <Eye className="h-3 w-3" /> إثبات {idx + 1}
                                  </Button>
                                </a>
                              ))}
                              {/* Approve */}
                              {v.verification_status !== 'trusted' && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1" onClick={async () => {
                                  try {
                                    await api.put(`/beneficiary/admin/profiles/${v.id}/status`, { verification_status: 'trusted' });
                                    toast.success('تم قبول الطلب وتوثيق المستفيد');
                                    fetchVerifications();
                                  } catch (e: any) { toast.error(e.response?.data?.error || 'حدث خطأ'); }
                                }}>
                                  <Check className="h-3.5 w-3.5" /> قبول
                                </Button>
                              )}
                              {/* Reject */}
                              {v.verification_status !== 'rejected' && (
                                <Button size="sm" variant="outline" className="text-orange-600 border-orange-300 gap-1" onClick={() => {
                                  setRejectReason('');
                                  setRejectDialog({ open: true, profileId: v.id });
                                }}>
                                  <X className="h-3.5 w-3.5" /> رفض
                                </Button>
                              )}
                              {/* Block */}
                              {v.verification_status !== 'blocked' && (
                                <Button size="sm" variant="outline" className="text-destructive border-destructive/40 gap-1" onClick={async () => {
                                  try {
                                    await api.put(`/beneficiary/admin/profiles/${v.id}/status`, { verification_status: 'blocked' });
                                    toast.success('تم حظر المستفيد');
                                    fetchVerifications();
                                  } catch (e: any) { toast.error(e.response?.data?.error || 'حدث خطأ'); }
                                }}>
                                  <Ban className="h-3.5 w-3.5" /> حظر
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══ DONATION REQUESTS TAB ═══════════════════════════════════ */}
          <TabsContent value="donation-requests" className="mt-6">
            <Card className="border-none card-shadow rounded-3xl bg-card overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>طلبات التبرع</CardTitle>
                    <CardDescription>إشراف عام — الموافقة أو الرفض تتم من المتبرع صاحب التبرع</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchAdminRequests}>تحديث</Button>
                </div>
              </CardHeader>
              <CardContent>
                {adminRequestsLoading ? (
                  <div className="text-center py-10 text-muted-foreground">جاري التحميل...</div>
                ) : adminRequests.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">لا توجد طلبات حتى الآن</div>
                ) : (
                  <div className="space-y-4">
                    {adminRequests.map((r: any) => {
                      const don = r.donation_id;
                      const ben = r.beneficiary_id;
                      const reqStatusColors: Record<string, string> = {
                        pending_review: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30',
                        accepted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30',
                        rejected: 'bg-red-100 text-red-600 dark:bg-red-900/30',
                        cancelled: 'bg-gray-100 text-gray-600',
                        received: 'bg-green-100 text-green-700 dark:bg-green-900/30',
                      };
                      const reqStatusLabels: Record<string, string> = {
                        pending_review: 'قيد المراجعة', accepted: 'مقبول',
                        rejected: 'مرفوض', cancelled: 'ملغي', received: 'تم الاستلام',
                      };
                      return (
                        <Card key={r.id} className="border-none card-shadow rounded-2xl">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div>
                                <p className="font-semibold">{don?.title || 'تبرع'}</p>
                                <p className="text-sm text-muted-foreground">المستفيد: {ben?.name} — {ben?.email}</p>
                                <p className="text-xs text-muted-foreground">رقم الهوية: <span dir="ltr">{r.national_id_number}</span></p>
                                <p className="text-xs text-muted-foreground">تاريخ الطلب: {new Date(r.createdAt).toLocaleDateString('ar-SA')}</p>
                                {r.emergency_exception && (
                                  <p className="text-xs text-amber-600 font-semibold">⚡ استثناء طارئ: {r.emergency_reason}</p>
                                )}
                              </div>
                              <Badge className={reqStatusColors[r.status] || ''}>{reqStatusLabels[r.status] || r.status}</Badge>
                            </div>

                            {r.admin_notes && (
                              <p className="text-xs bg-muted p-2 rounded">ملاحظة: {r.admin_notes}</p>
                            )}

                            {/* Read-only oversight: donor handles accept/reject */}
                            {r.donor_notes && (
                              <p className="text-xs bg-muted p-2 rounded">ملاحظة المتبرع: {r.donor_notes}</p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

      </div>

      {/* ── Assign Volunteer Dialog ─────────────────────────────── */}
      <Dialog open={!!assignCase} onOpenChange={(open) => { if (!open) setAssignCase(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعيين متطوع للحالة</DialogTitle>
            <DialogDescription>{assignCase?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">{assignCase?.description}</p>
            <div className="space-y-1">
              <label className="text-sm font-medium">اختر متطوعاً</label>
              <Select value={selectedVolunteer} onValueChange={setSelectedVolunteer}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر من قائمة المتطوعين" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter((u) => u.role === 'volunteer' && u.status === 'active').map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignCase(null)}>إلغاء</Button>
            <Button className="bg-primary text-white" disabled={!selectedVolunteer} onClick={async () => {
              const vol = users.find((u) => u.id === selectedVolunteer);
              try {
                await api.post(`/admin/cases/${assignCase?.id}/assign`, { volunteerId: selectedVolunteer });
                toast.success(`تم تعيين ${vol?.name} للحالة: ${assignCase?.title}`);
              } catch {
                toast.error('حدث خطأ أثناء تعيين المتطوع');
              }
              setAssignCase(null);
            }}>
              تأكيد التعيين
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Global Confirm Dialog ───────────────────────────────── */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الإجراء</AlertDialogTitle>
            <AlertDialogDescription>{confirmAction?.label}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction}>تأكيد</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── User Details Modal ──────────────────────────────────── */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => { if (!open) setSelectedUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>بيانات المستخدم</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback>{(selectedUser.name || '').slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">تاريخ الانضمام</p>
                  <p className="font-semibold">{selectedUser.joinDate}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">عدد التبرعات</p>
                  <p className="font-semibold">{selectedUser.donations}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">الدور</p>
                  <p className="font-semibold">{selectedUser.role === 'volunteer' ? 'متطوع' : 'مستخدم'}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">الحالة</p>
                  <p className={`font-semibold ${selectedUser.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedUser.status === 'active' ? 'نشط' : 'محظور'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Add User Modal ──────────────────────────────────────── */}
      <Dialog open={isAddUserOpen} onOpenChange={(open) => { if (!open) { setIsAddUserOpen(false); setAddUserErrors({}); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة مستخدم جديد</DialogTitle>
            <DialogDescription>أدخل بيانات المستخدم ليتمكن من تسجيل الدخول</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">الاسم *</label>
              <Input
                placeholder="أدخل اسم المستخدم"
                value={addUserForm.name}
                onChange={(e) => { setAddUserForm((f) => ({ ...f, name: e.target.value })); setAddUserErrors((e) => ({ ...e, name: undefined })); }}
                className={addUserErrors.name ? 'border-destructive' : ''}
              />
              {addUserErrors.name && <p className="text-xs text-destructive">{addUserErrors.name}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">البريد الإلكتروني *</label>
              <Input
                placeholder="user@example.com"
                dir="ltr"
                value={addUserForm.email}
                onChange={(e) => { setAddUserForm((f) => ({ ...f, email: e.target.value })); setAddUserErrors((e) => ({ ...e, email: undefined })); }}
                className={addUserErrors.email ? 'border-destructive' : ''}
              />
              {addUserErrors.email && <p className="text-xs text-destructive">{addUserErrors.email}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">كلمة المرور *</label>
              <Input
                type="password"
                placeholder="••••••"
                dir="ltr"
                value={addUserForm.password}
                onChange={(e) => { setAddUserForm((f) => ({ ...f, password: e.target.value })); setAddUserErrors((e) => ({ ...e, password: undefined })); }}
                className={addUserErrors.password ? 'border-destructive' : ''}
              />
              {addUserErrors.password && <p className="text-xs text-destructive">{addUserErrors.password}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">الدور</label>
              <Select value={addUserForm.role} onValueChange={(val) => setAddUserForm((f) => ({ ...f, role: val as 'user' | 'volunteer' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">مستخدم عادي</SelectItem>
                  <SelectItem value="volunteer">متطوع</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>إلغاء</Button>
            <Button onClick={handleAddUser}>إضافة المستخدم</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Campaign Add / Edit Modal ───────────────────────────── */}
      <Dialog open={campaignModal.open} onOpenChange={(open) => !open && setCampaignModal({ open: false, editing: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{campaignModal.editing ? 'تعديل الحملة' : 'إضافة حملة جديدة'}</DialogTitle>
            <DialogDescription>أدخل تفاصيل الحملة أدناه</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">عنوان الحملة *</label>
              <Input placeholder="مثال: حملة الشتاء الدافئ" value={campaignForm.title} onChange={(e) => setCampaignForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">الوصف</label>
              <Textarea placeholder="وصف مختصر للحملة" value={campaignForm.description} onChange={(e) => setCampaignForm((p) => ({ ...p, description: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">رابط الصورة</label>
              <Input placeholder="https://..." dir="ltr" value={campaignForm.image} onChange={(e) => setCampaignForm((p) => ({ ...p, image: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">الهدف</label>
                <Input type="number" min={1} value={campaignForm.target} onChange={(e) => setCampaignForm((p) => ({ ...p, target: Number(e.target.value) }))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">تم جمعه</label>
                <Input type="number" min={0} value={campaignForm.current} onChange={(e) => setCampaignForm((p) => ({ ...p, current: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">الأولوية</label>
              <Select value={campaignForm.urgency} onValueChange={(val) => setCampaignForm((p) => ({ ...p, urgency: val as Campaign['urgency'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="عالية">عالية (عاجل)</SelectItem>
                  <SelectItem value="متوسطة">متوسطة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCampaignModal({ open: false, editing: null })}>إلغاء</Button>
            <Button onClick={saveCampaign}>{campaignModal.editing ? 'حفظ التعديلات' : 'إضافة الحملة'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Campaign Delete Confirmation ────────────────────────── */}
      <AlertDialog open={!!deleteCampaignId} onOpenChange={() => setDeleteCampaignId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذه الحملة؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => {
              if (deleteCampaignId) { deleteCampaign(deleteCampaignId); toast.success('تم حذف الحملة'); setDeleteCampaignId(null); }
            }}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Volunteer Opportunity Add / Edit Modal ──────────────── */}
      <Dialog open={oppModal.open} onOpenChange={(open) => !open && setOppModal({ open: false, editing: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{oppModal.editing ? 'تعديل فرصة التطوع' : 'إضافة فرصة تطوع جديدة'}</DialogTitle>
            <DialogDescription>ستظهر هذه الفرصة في صفحة التطوع للجمهور</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">عنوان الفرصة *</label>
              <Input placeholder="مثال: توزيع الطرود الغذائية" value={oppForm.title} onChange={(e) => setOppForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">الوصف</label>
              <Textarea placeholder="وصف مختصر لفرصة التطوع" value={oppForm.description} onChange={(e) => setOppForm((p) => ({ ...p, description: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">الموقع *</label>
              <Input placeholder="مثال: عمّان - المقر الرئيسي" value={oppForm.location} onChange={(e) => setOppForm((p) => ({ ...p, location: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">التاريخ</label>
                <Input type="date" dir="ltr" value={oppForm.date} onChange={(e) => setOppForm((p) => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">أقصى عدد متطوعين</label>
                <Input type="number" min={1} value={oppForm.maxVolunteers} onChange={(e) => setOppForm((p) => ({ ...p, maxVolunteers: Number(e.target.value) }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOppModal({ open: false, editing: null })}>إلغاء</Button>
            <Button onClick={saveOpp}>{oppModal.editing ? 'حفظ التعديلات' : 'إضافة الفرصة'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Volunteer Opportunity Delete Confirmation ───────────── */}
      <AlertDialog open={!!deleteOppId} onOpenChange={() => setDeleteOppId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذه الفرصة؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => {
              if (deleteOppId) { deleteOpportunity(deleteOppId); toast.success('تم حذف فرصة التطوع'); setDeleteOppId(null); }
            }}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Reject Verification Dialog ─────────────────────────── */}
      <Dialog open={!!rejectDialog?.open} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>رفض طلب التحقق</DialogTitle>
            <DialogDescription>يجب إدخال سبب الرفض ليتمكن المستفيد من التصحيح</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Textarea
              placeholder="سبب رفض طلب التحقق..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>إلغاء</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!rejectReason.trim()}
              onClick={async () => {
                if (!rejectDialog) return;
                try {
                  await api.put(`/beneficiary/admin/profiles/${rejectDialog.profileId}/status`, {
                    verification_status: 'rejected',
                    verification_rejection_reason: rejectReason.trim(),
                  });
                  toast.success('تم رفض الطلب');
                  fetchVerifications();
                  setRejectDialog(null);
                } catch (e: any) { toast.error(e.response?.data?.error || 'حدث خطأ'); }
              }}
            >
              تأكيد الرفض
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Emergency Exception Dialog ─────────────────────────── */}
      <Dialog open={!!emergencyDialog?.open} onOpenChange={() => setEmergencyDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>⚡ استثناء طارئ</DialogTitle>
            <DialogDescription>
              هذا المستفيد تلقى تبرعاً خلال الـ 14 يوماً الماضية. لقبول هذا الطلب يجب إدخال سبب الاستثناء.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Textarea
              placeholder="سبب الاستثناء الطارئ..."
              value={emergencyReason}
              onChange={(e) => setEmergencyReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmergencyDialog(null)}>إلغاء</Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              disabled={!emergencyReason.trim()}
              onClick={async () => {
                if (!emergencyDialog) return;
                try {
                  await api.put(`/donation-requests/${emergencyDialog.requestId}/review`, {
                    action: 'accept',
                    emergency_exception: true,
                    emergency_reason: emergencyReason.trim(),
                  });
                  toast.success('تم قبول الطلب بموجب الاستثناء الطارئ');
                  fetchAdminRequests();
                  setEmergencyDialog(null);
                } catch (e: any) { toast.error(e.response?.data?.error || 'حدث خطأ'); }
              }}
            >
              تأكيد الاستثناء الطارئ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
