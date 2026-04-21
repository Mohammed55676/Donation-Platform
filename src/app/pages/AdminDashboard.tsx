import { useState } from 'react';
import { useSearchParams, Link } from 'react-router';
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
import { useAuth } from '../context/AuthContext';
import { useCampaigns } from '../hooks/useCampaigns';
import { useVolunteerOpportunities } from '../hooks/useVolunteerOpportunities';
import type { Campaign } from '../data/donations';
import type { VolunteerOpportunity } from '../data/donations';

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
  { id: 'u1', title: 'أسرة محتاجة بعجلة', description: 'أسرة من 5 أفراد تحتاج ملابس شتوية وغذاء عاجل', category: 'ملابس + غذاء', location: 'الرياض - النسيم', severity: 'critical' },
  { id: 'u2', title: 'طفل يحتاج كتبًا مدرسية', description: 'طالب لم يستطع الحصول على كتبه هذا الفصل', category: 'كتب', location: 'جدة - الصفا', severity: 'high' },
  { id: 'u3', title: 'عائلة بدون طعام', description: 'توصلنا بطلب عاجل من عائلة تفتقر لمواد غذائية', category: 'طعام', location: 'مكة - العزيزية', severity: 'critical' },
];

// Empty campaign form
const emptyCampaign: Omit<Campaign, 'id'> = {
  title: '',
  description: '',
  image: '',
  target: 100,
  current: 0,
  urgency: 'متوسطة',
};

// Empty volunteer opportunity form
const emptyOppForm: Omit<VolunteerOpportunity, 'id' | 'volunteers'> = {
  title: '',
  description: '',
  location: '',
  date: '',
  maxVolunteers: 20,
};

export function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'analytics';

  const { donations, updateDonationStatus } = useDonations();
  const { getAllUsers, addUserFromAdmin, deleteUser: deleteUserFromContext } = useAuth();

  // ── Users state ──────────────────────────────────────────────
  const buildUserList = () =>
    getAllUsers().map((u) => ({
      ...u,
      status: (u as any).status || 'active',
      donations: (u as any).donations || 0,
    }));

  const [users, setUsers] = useState<any[]>(buildUserList);
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
  const [oppForm, setOppForm] = useState<Omit<VolunteerOpportunity, 'id' | 'volunteers'>>(emptyOppForm);
  const [deleteOppId, setDeleteOppId] = useState<string | null>(null);

  // ── Helpers ──────────────────────────────────────────────────
  const setTab = (tab: string) => setSearchParams(tab === 'analytics' ? {} : { tab });

  const displayedUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
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

  const handleAddUser = () => {
    const errs = validateAddUser();
    if (Object.keys(errs).length > 0) {
      setAddUserErrors(errs);
      return;
    }
    const result = addUserFromAdmin(
      addUserForm.name.trim(),
      addUserForm.email.trim(),
      addUserForm.password,
      addUserForm.role as 'user' | 'volunteer'
    );
    if (!result.success) {
      setAddUserErrors({ email: result.error });
      return;
    }
    const newManagedUser = {
      ...(result.user!),
      status: 'active',
      donations: 0,
    };
    setUsers((prev) => [newManagedUser, ...prev]);
    setIsAddUserOpen(false);
    setAddUserForm({ name: '', email: '', password: '', role: 'user' });
    setAddUserErrors({});
    toast.success('تمت إضافة المستخدم بنجاح');
  };

  // ── Ban / Unban / Delete ─────────────────────────────────────
  const executeAction = () => {
    if (!confirmAction) return;
    const { type, id } = confirmAction;

    if (type === 'ban' || type === 'unban') {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: type === 'ban' ? 'banned' : 'active' } : u))
      );
      toast.success(type === 'ban' ? 'تم تعليق الحساب' : 'تم رفع التعليق');
    } else if (type === 'delete_user') {
      deleteUserFromContext(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success('تم حذف المستخدم');
    } else if (type === 'approve') {
      updateDonationStatus(id, 'متاح');
      toast.success('تم قبول التبرع');
    } else if (type === 'reject') {
      updateDonationStatus(id, 'مرفوض');
      toast.error('تم رفض التبرع');
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
      addCampaign({ id: Date.now().toString(), ...campaignForm });
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
      addOpportunity({ id: Date.now().toString(), volunteers: 0, ...oppForm });
      toast.success('تمت إضافة فرصة التطوع');
    }
    setOppModal({ open: false, editing: null });
  };

  // ── Stats ────────────────────────────────────────────────────
  const totalUsers = users.length; // reactive: driven by local state
  const adminDonationsList = donations.filter((d) =>
    ['قيد المراجعة', 'متاح', 'مرفوض'].includes(d.status)
  );
  const totalDonations = donations.length;
  const completedDeliveries = donations.filter((d) => d.status === 'تم التسليم').length;
  const pendingReview = donations.filter((d) => d.status === 'قيد المراجعة').length;

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
              <Card key={i} className="hover:shadow-lg hover:border-primary/30 transition-all border border-border/60 group">
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
            <TabsTrigger value="requests" className="rounded-lg text-sm font-semibold">الطلبات</TabsTrigger>
            <TabsTrigger value="urgent" className="rounded-lg text-sm font-semibold">
              <span>الحالات العاجلة</span>
              <span className="mr-1 text-red-500">🔥</span>
            </TabsTrigger>
          </TabsList>

          {/* ANALYTICS */}
          <TabsContent value="analytics" className="mt-6 space-y-6">
            <Card>
              <CardHeader><CardTitle>النمو الشهري</CardTitle><CardDescription>المستخدمون والتبرعات وعمليات التسليم</CardDescription></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                    <Bar dataKey="users" fill="hsl(var(--primary))" name="المستخدمون" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="donations" fill="hsl(var(--secondary))" name="التبرعات" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="deliveries" fill="#22c55e" name="التسليمات" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>اتجاه المستخدمين</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                    <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="مستخدمون" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* USERS */}
          <TabsContent value="users" className="mt-6">
            <Card>
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
                    className="pr-10"
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
                        <AvatarFallback className="text-sm bg-primary text-white">{u.name.slice(0, 2)}</AvatarFallback>
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
            <Card>
              <CardHeader><CardTitle>إدارة التبرعات</CardTitle><CardDescription>مراجعة وقبول أو رفض التبرعات</CardDescription></CardHeader>
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
            <Card>
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
                    const pct = Math.min(100, Math.round((c.current / c.target) * 100));
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
            <Card>
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
                    const pct = Math.min(100, Math.round((opp.volunteers / opp.maxVolunteers) * 100));
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

          {/* REQUESTS */}
          <TabsContent value="requests" className="mt-6">
            <Card>
              <CardHeader><CardTitle>مراقبة الطلبات</CardTitle><CardDescription>جميع طلبات المستخدمين</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {donations.slice(0, 5).map((d, i) => (
                    <div key={d.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border bg-background hover:bg-muted/40 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{d.title}</span>
                          <Badge variant="outline" className="text-xs">{d.category}</Badge>
                          <Badge className={
                            i % 3 === 0 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 text-xs' :
                            i % 3 === 1 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 text-xs' :
                            'bg-green-100 text-green-700 dark:bg-green-900/30 text-xs'
                          }>
                            {i % 3 === 0 ? 'قيد المراجعة' : i % 3 === 1 ? 'تم القبول' : 'تم التسليم'}
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
                <Card key={c.id} className={`border-2 ${c.severity === 'critical' ? 'border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20' : 'border-orange-200 dark:border-orange-900 bg-orange-50/30 dark:bg-orange-950/20'}`}>
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
            <Button className="bg-primary text-white" disabled={!selectedVolunteer} onClick={() => {
              const vol = users.find((u) => u.id === selectedVolunteer);
              toast.success(`تم تعيين ${vol?.name} للحالة: ${assignCase?.title}`);
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
                  <AvatarFallback>{selectedUser.name.slice(0, 2)}</AvatarFallback>
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

    </DashboardLayout>
  );
}
