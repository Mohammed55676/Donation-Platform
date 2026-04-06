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
  Trash2, Check, X, Eye, ShieldCheck, Search, Plus,
  Users, Gift, CheckCircle, AlertTriangle, TrendingUp, Ban
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { useDonations } from '../context/DonationContext';
import { useAuth } from '../context/AuthContext';

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

const mockUsers: ManagedUser[] = [
  { id: '1', name: 'أحمد محمد', email: 'ahmed@example.com', role: 'user', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', joinDate: '2026-01-15', status: 'active', donations: 5 },
  { id: '2', name: 'فاطمة علي', email: 'fatima@example.com', role: 'user', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', joinDate: '2026-02-03', status: 'active', donations: 3 },
  { id: '3', name: 'خالد عبدالله', email: 'khaled@example.com', role: 'volunteer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', joinDate: '2026-01-22', status: 'active', donations: 0 },
  { id: '4', name: 'نورة أحمد', email: 'noura@example.com', role: 'user', joinDate: '2026-03-01', status: 'banned', donations: 1 },
  { id: '5', name: 'محمد يوسف', email: 'mohy@example.com', role: 'volunteer', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', joinDate: '2026-02-14', status: 'active', donations: 0 },
];

// Removed static mockAdminDonations

const urgentCases = [
  { id: 'u1', title: 'أسرة محتاجة بعجلة', description: 'أسرة من 5 أفراد تحتاج ملابس شتوية وغذاء عاجل', category: 'ملابس + غذاء', location: 'الرياض - النسيم', severity: 'critical' },
  { id: 'u2', title: 'طفل يحتاج كتبًا مدرسية', description: 'طالب لم يستطع الحصول على كتبه هذا الفصل', category: 'كتب', location: 'جدة - الصفا', severity: 'high' },
  { id: 'u3', title: 'عائلة بدون طعام', description: 'توصلنا بطلب عاجل من عائلة تفتقر لمواد غذائية', category: 'طعام', location: 'مكة - العزيزية', severity: 'critical' },
];

export function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'analytics';

  const { donations, updateDonationStatus } = useDonations();
  const { getAllUsers } = useAuth();
  const allUsers = getAllUsers();

  const [users, setUsers] = useState<any[]>(allUsers);
  const [confirmAction, setConfirmAction] = useState<{ type: string; id: string; label: string } | null>(null);
  const [assignCase, setAssignCase] = useState<typeof urgentCases[0] | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const displayedUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const setTab = (tab: string) => setSearchParams(tab === 'analytics' ? {} : { tab });

  const executeAction = () => {
    if (!confirmAction) return;
    const { type, id } = confirmAction;

    if (type === 'ban' || type === 'unban') {
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: type === 'ban' ? 'banned' : 'active' } : u));
      toast.success(type === 'ban' ? 'تم تعليق الحساب' : 'تم رفع التعليق');
    } else if (type === 'delete_user') {
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

  const totalUsers = allUsers.length;
  const adminDonationsList = donations.filter(d => ['قيد المراجعة', 'متاح', 'مرفوض'].includes(d.status));
  const totalDonations = donations.length;
  const completedDeliveries = donations.filter(d => d.status === 'تم التسليم').length;
  const pendingReview = donations.filter((d) => d.status === 'قيد المراجعة').length;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Admin banner */}
        <div className="rounded-2xl bg-gradient-to-l from-gray-900 to-gray-700 dark:from-gray-800 dark:to-gray-900 p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" /> لوحة الإدارة
              </h2>
              <p className="text-white/70 text-sm">يوجد {pendingReview} تبرع ينتظر المراجعة</p>
            </div>
            <div className="text-4xl">👑</div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'المستخدمون', value: totalUsers, icon: Users, color: 'text-primary', bg: 'bg-primary/10', trend: '+12 هذا الشهر' },
            { label: 'التبرعات', value: totalDonations, icon: Gift, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', trend: '+34 هذا الشهر' },
            { label: 'عمليات التسليم', value: completedDeliveries, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', trend: '+24 هذا الشهر' },
            { label: 'بانتظار المراجعة', value: pendingReview, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={i} className="hover:shadow-md transition-shadow border border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-5">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  {s.trend && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><TrendingUp className="h-3 w-3" />{s.trend}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs value={activeTab} onValueChange={setTab}>
          <TabsList className="flex flex-wrap gap-1 h-auto rounded-xl p-1 bg-muted">
            <TabsTrigger value="analytics" className="rounded-lg">الإحصائيات</TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg">المستخدمون</TabsTrigger>
            <TabsTrigger value="donations" className="rounded-lg">التبرعات</TabsTrigger>
            <TabsTrigger value="requests" className="rounded-lg">الطلبات</TabsTrigger>
            <TabsTrigger value="urgent" className="rounded-lg">
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
                <Button onClick={() => setIsAddUserOpen(true)} className="gap-2">
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
                          <Button
                            size="sm"
                            className="bg-primary text-white text-xs h-8"
                            onClick={() => { setAssignCase(c); setSelectedVolunteer(''); }}
                          >
                            تعيين متطوع
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => toast.info(`📋 ${c.title} — ${c.description}`)}
                          >
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

      {/* Assign Volunteer Dialog */}
      <Dialog open={!!assignCase} onOpenChange={(open) => { if (!open) setAssignCase(null); }}>
        <DialogContent dir="rtl" className="sm:max-w-md">
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
                  {users.filter(u => u.role === 'volunteer' && u.status === 'active').map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignCase(null)}>إلغاء</Button>
            <Button
              className="bg-primary text-white"
              disabled={!selectedVolunteer}
              onClick={() => {
                const vol = users.find(u => u.id === selectedVolunteer);
                toast.success(`تم تعيين ${vol?.name} للحالة: ${assignCase?.title}`);
                setAssignCase(null);
              }}
            >
              تأكيد التعيين
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Global confirm dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent dir="rtl">
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

      {/* User Details Modal */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => { if (!open) setSelectedUser(null); }}>
        <DialogContent dir="rtl">
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

      {/* Add User Modal */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة مستخدم جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">الاسم</label>
              <Input placeholder="أدخل اسم المستخدم" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">البريد الإلكتروني</label>
              <Input placeholder="user@example.com" dir="ltr" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الدور</label>
              <Select defaultValue="user">
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
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>إلغاء</Button>
            <Button onClick={() => { setIsAddUserOpen(false); toast.success('تمت إضافة المستخدم بنجاح'); }}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
