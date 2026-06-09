import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router';
import { isValidEmail, isLettersOnly, sanitizePhone } from '../utils/validators';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Package, CheckCircle, Clock, Edit, Trash2, Eye, Gift, Heart, TrendingUp, HelpCircle, Star, Navigation, Truck, MapPin, Play, XCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications } from '../context/NotificationContext';
import { useDonations } from '../context/DonationContext';
import { RatingDialog } from '../components/RatingDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import api from '../utils/api';

// Arabic labels for donation request statuses
const REQUEST_STATUS_LABELS: Record<string, string> = {
  pending_review: 'قيد المراجعة',
  accepted:       'مقبول',
  rejected:       'مرفوض',
  cancelled:      'ملغي',
  received:       'تم الاستلام',
};

const REQUEST_STATUS_COLORS: Record<string, string> = {
  pending_review: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30',
  accepted:       'bg-blue-100 text-blue-700 dark:bg-blue-900/30',
  rejected:       'bg-red-100 text-red-600 dark:bg-red-900/30',
  cancelled:      'bg-gray-100 text-gray-600 dark:bg-gray-800',
  received:       'bg-green-100 text-green-700 dark:bg-green-900/30',
};

// Removed mockTasks and their static colors/labels

function StatCard({ label, value, icon: Icon, color, bgColor, trend }: any) {
  return (
    <Card className="transition-all border-none card-shadow rounded-3xl hover:shadow-lg hover:shadow-primary/10 bg-card">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 rounded-xl ${bgColor}`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          {trend && (
            <span className="text-xs text-green-600 font-medium flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> {trend}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const { addNotification } = useNotifications();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileErrors, setProfileErrors] = useState<{ name?: string; email?: string; phone?: string; location?: string }>({});
  const [editUserForm, setEditUserForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    location: user?.location ?? '',
    avatar: user?.avatar ?? '',
  });

  // Donations mapping
  const { donations, deleteDonation, updateDonation } = useDonations();
  const myDonations = donations.filter(d => d.donor.id === user?.id || d.donor.id === user?._id);
  const [isEditDonationOpen, setIsEditDonationOpen] = useState(false);
  const [donationToEdit, setDonationToEdit] = useState<any>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);



  // For donor users: fetch real requests for their donations
  const [myDonorRequests, setMyDonorRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  useEffect(() => {
    if (user?.user_type !== 'donor') return;
    setRequestsLoading(true);
    api.get('/donation-requests/for-donor')
      .then(res => setMyDonorRequests(res.data.data || []))
      .catch(() => setMyDonorRequests([]))
      .finally(() => setRequestsLoading(false));
  }, [user?.id, user?.user_type]);

  const requestsCount = myDonorRequests.length;

  const [showRating, setShowRating] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<{ donationId: string; rateeId: string; rateeName: string } | null>(null);

  // Volunteer Tasks State
  const [tasks, setTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  useEffect(() => {
    setTasksLoading(true);
    api.get('/volunteer/my')
      .then(res => setTasks(res.data.data || []))
      .catch(() => setTasks([]))
      .finally(() => setTasksLoading(false));
  }, []);

  const completedTasks = 0; // Opportunities don't track completion by default
  const inProgressTasks = tasks.length;
  const pendingTasks = 0;

  // Saved items
  const savedDonations = useMemo(
    () => donations.filter(d => user?.wishlist?.includes(d.id)),
    [donations, user?.wishlist]
  );

  // Stats
  const stats = [
    { label: t('dashboard.stat_my_donations'), value: myDonations.length, icon: Package, color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: t('dashboard.stat_my_requests'), value: requestsCount, icon: Heart, color: 'text-secondary', bgColor: 'bg-secondary/10' },
    { label: t('dashboard.stat_active_tasks'), value: inProgressTasks + pendingTasks, icon: Clock, color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
    { label: t('dashboard.stat_completed'), value: completedTasks, icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  ];



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'تم التسليم': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400';
      case 'قيد المراجعة': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400';
      default: return '';
    }
  };

  const setTab = (tab: string) => setSearchParams(tab === 'overview' ? {} : { tab });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditUserForm({ ...editUserForm, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof profileErrors = {};
    if (!editUserForm.name.trim()) errs.name = 'الاسم مطلوب';
    else if (!isLettersOnly(editUserForm.name)) errs.name = 'الاسم يجب أن يحتوي على حروف فقط';
    else if (editUserForm.name.trim().length < 3) errs.name = 'الاسم يجب أن يكون 3 أحرف على الأقل';
    if (editUserForm.email && !isValidEmail(editUserForm.email)) errs.email = 'البريد الإلكتروني غير صحيح';
    if (editUserForm.phone && !/^07[789]\d{7}$/.test(editUserForm.phone.trim())) errs.phone = 'يجب أن يبدأ بـ 077 أو 078 أو 079 ومكوّن من 10 أرقام';
    if (editUserForm.location && editUserForm.location.trim().length < 2) errs.location = 'يرجى كتابة موقع صحيح';
    if (Object.keys(errs).length > 0) { setProfileErrors(errs); return; }
    setProfileErrors({});
    updateUser(editUserForm);
    setIsEditProfileOpen(false);
    toast.success('تم تحديث الملف الشخصي بنجاح');
  };

  const handleDeleteItem = () => {
    if (itemToDelete) {
      deleteDonation(itemToDelete);
      toast.success('تم حذف التبرع!');
    }
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const donationImageInputRef = useRef<HTMLInputElement>(null);

  const handleDonationImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setDonationToEdit((prev: any) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (donationToEdit) updateDonation(donationToEdit.id, donationToEdit);
    toast.success('تم تحديث التبرع!');
    setIsEditDonationOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Banner */}
        <div className="rounded-2xl bg-gradient-to-l from-primary to-secondary p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">{t('dashboard.welcome')}، {user?.name?.split(' ')[0]} 👋</h2>
              <p className="text-white/80 text-sm">{t('dashboard.subtitle')}</p>
            </div>
            <div className="text-4xl">🌟</div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white/80">{t('dashboard.profile_complete')}</span>
              <span className="font-bold">{user?.profileComplete ?? 40}%</span>
            </div>
            <Progress value={user?.profileComplete ?? 40} className="h-2 bg-white/30 [&>div]:bg-white" />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setTab}>
          <TabsList className="flex flex-wrap gap-1 h-auto rounded-xl p-1 bg-muted">
            <TabsTrigger value="overview" className="rounded-lg">{t('dashboard.tab_overview')}</TabsTrigger>
            <TabsTrigger value="donations" className="rounded-lg">{t('dashboard.tab_donations')}</TabsTrigger>
            <TabsTrigger value="requests" className="rounded-lg">{t('dashboard.tab_requests')}</TabsTrigger>
            <TabsTrigger value="volunteer" className="rounded-lg">{t('dashboard.tab_volunteer')}</TabsTrigger>
            <TabsTrigger value="saved" className="rounded-lg">{t('dashboard.tab_saved')}</TabsTrigger>
            <TabsTrigger value="profile" className="rounded-lg">{t('dashboard.tab_profile')}</TabsTrigger>
          </TabsList>

          {/* 1. OVERVIEW */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            <Card className="border-none card-shadow rounded-3xl bg-card overflow-hidden">
              <CardHeader><CardTitle>{t('dashboard.quick_actions')}</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: t('dashboard.add_donation'), icon: Gift, path: '/add-donation', color: 'bg-primary/10 hover:bg-primary/20 text-primary' },
                    { label: t('dashboard.browse_donations'), icon: Package, path: '/donations', color: 'bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400' },
                    { label: t('dashboard.community'), icon: Heart, path: '/community', color: 'bg-pink-50 hover:bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:hover:bg-pink-900/30 dark:text-pink-400' },
                    { label: t('dashboard.task_map'), icon: Navigation, path: '?tab=volunteer', color: 'bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-400' },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link key={action.label} to={action.path}>
                        <div className={`flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer transition-colors ${action.color}`}>
                          <Icon className="h-6 w-6" />
                          <span className="text-sm font-medium text-center">{action.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 2. MY DONATIONS */}
          <TabsContent value="donations" className="mt-6">
            <Card className="border-none card-shadow rounded-3xl bg-card overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('dashboard.my_donations')}</CardTitle>
                    <CardDescription>{t('dashboard.my_donations_desc')}</CardDescription>
                  </div>
                  <Link to="/add-donation"><Button><Package className="me-2 h-4 w-4" />{t('dashboard.add_donation')}</Button></Link>
                </div>
              </CardHeader>
              <CardContent>
                {myDonations.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground">{t('dashboard.no_donations')}</p>
                    <Link to="/add-donation"><Button variant="outline" className="mt-4">{t('dashboard.add_donation_now')}</Button></Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myDonations.map((donation: any) => (
                      <Card key={donation.id} className="overflow-hidden border-none card-shadow rounded-2xl hover:shadow-lg hover:shadow-primary/10 transition-all">
                        <div className="flex flex-col sm:flex-row gap-4 p-4">
                          <img src={donation.image} alt={donation.title} className="w-full sm:w-28 h-28 object-cover rounded-xl flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold">{donation.title}</h3>
                              <Badge variant={donation.status === 'قيد المراجعة' ? 'secondary' : 'default'} className={donation.status === 'قيد المراجعة' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30' : ''}>{donation.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{donation.description}</p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">{donation.category}</Badge>
                              <span className="text-xs text-muted-foreground mt-1">📅 {new Date(donation.createdAt).toLocaleDateString('ar-SA')}</span>
                            </div>
                            <div className="flex gap-2 pt-1">
                              <Link to={`/donations/${donation.id}`}><Button variant="outline" size="sm"><Eye className="me-2 h-4 w-4" />عرض</Button></Link>
                              <Button variant="outline" size="sm" onClick={() => { setDonationToEdit(donation); setIsEditDonationOpen(true); }}><Edit className="me-2 h-4 w-4" />تعديل</Button>
                              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => { setItemToDelete(donation.id); setIsDeleteDialogOpen(true); }}><Trash2 className="me-2 h-4 w-4" />حذف</Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 3. MY REQUESTS */}
          <TabsContent value="requests" className="mt-6">
            <Card className="border-none card-shadow rounded-3xl bg-card overflow-hidden">
              <CardHeader>
                <CardTitle>طلبات التبرع</CardTitle>
                <CardDescription>الطلبات المقدمة على تبرعاتك</CardDescription>
              </CardHeader>
              <CardContent>
                {myDonorRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground">{t('dashboard.no_requests')}</p>
                    <Link to="/donations"><Button variant="outline" className="mt-4">{t('dashboard.browse_donations_btn')}</Button></Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myDonorRequests.map((request) => {
                      const don = request.donation_id;
                      const requester = request.charity;
                      const statusLabel = REQUEST_STATUS_LABELS[request.status] || request.status;
                      const statusColor = REQUEST_STATUS_COLORS[request.status] || '';
                      return (
                      <Card key={request.id} className="overflow-hidden border-none card-shadow rounded-2xl hover:shadow-lg hover:shadow-primary/10 transition-all">
                        <div className="flex flex-col sm:flex-row gap-4 p-4">
                          {don?.image && <img src={don.image} alt={don?.title} className="w-full sm:w-28 h-28 object-cover rounded-xl flex-shrink-0" />}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold">{don?.title}</h3>
                                <p className="text-sm font-medium text-primary">الجمعية: {requester?.charityName || requester?.name || requester?.anonymousCode}</p>
                              </div>
                              <Badge className={statusColor}>{statusLabel}</Badge>
                            </div>
                            {requester?.situation_explanation && <p className="text-sm text-muted-foreground line-clamp-2">ملاحظات: {requester.situation_explanation}</p>}
                            <div className="flex flex-wrap gap-2">
                              {don?.category && <Badge variant="outline">{don.category}</Badge>}
                              <Badge variant="outline">📅 {new Date(request.createdAt).toLocaleDateString('ar-SA')}</Badge>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              {don?.id && <Link to={`/donations/${don.id}`}><Button variant="outline" size="sm"><Eye className="me-2 h-4 w-4" />عرض</Button></Link>}
                              {request.status === 'pending_review' && (
                                <>
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={async () => {
                                    try {
                                      await api.put(`/donation-requests/${request.id}/donor-review`, { action: 'accept' });
                                      toast.success('تم قبول الطلب!');
                                      setMyDonorRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'accepted' } : r));
                                    } catch (e: any) {
                                      toast.error(e.response?.data?.error || 'حدث خطأ');
                                    }
                                  }}><CheckCircle className="me-1 h-3.5 w-3.5"/> قبول</Button>
                                  <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onClick={async () => {
                                    try {
                                      await api.put(`/donation-requests/${request.id}/donor-review`, { action: 'reject' });
                                      toast.success('تم رفض الطلب');
                                      setMyDonorRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'rejected' } : r));
                                    } catch (e: any) {
                                      toast.error(e.response?.data?.error || 'حدث خطأ');
                                    }
                                  }}><XCircle className="me-1 h-3.5 w-3.5"/> رفض</Button>
                                </>
                              )}
                              {request.status === 'received' && don?.id && (
                                <Button variant="outline" size="sm" onClick={() => {
                                  setRatingTarget({ donationId: don.id, rateeId: '', rateeName: 'الجمعية' });
                                  setShowRating(true);
                                }}><Star className="me-2 h-4 w-4" />تقييم</Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );})}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>


          {/* 4. VOLUNTEER TASKS */}
          <TabsContent value="volunteer" className="mt-6 space-y-6">
            <Card className="border-none card-shadow rounded-3xl bg-card overflow-hidden">
              <CardHeader>
                <CardTitle>{t('dashboard.volunteer_tasks')}</CardTitle>
                <CardDescription>فرص التطوع التي سجلت بها</CardDescription>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground">لم تقم بالتسجيل في أي فرص تطوعية بعد</p>
                    <Link to="/volunteer"><Button variant="outline" className="mt-4">استعرض الفرص المتاحة</Button></Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <Card key={task.id} className="border-none card-shadow rounded-2xl hover:shadow-lg hover:shadow-primary/10 transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-100 dark:bg-blue-900/30">
                              <Package className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="font-semibold">{task.title}</h3>
                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">مسجل</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>{task.location}</span>
                              </div>
                              {task.date && (
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                                  <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span>{new Date(task.date).toLocaleDateString('ar-SA')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 5. SAVED */}
          <TabsContent value="saved" className="mt-6">
            <Card className="border-none card-shadow rounded-3xl bg-card overflow-hidden">
              <CardHeader>
                <CardTitle>{t('dashboard.saved_items')}</CardTitle>
                <CardDescription>{t('dashboard.saved_desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                {savedDonations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedDonations.map((donation) => (
                      <Card key={donation.id} className="overflow-hidden border-none card-shadow rounded-2xl hover:shadow-lg hover:shadow-primary/10 transition-all">
                        <div className="flex flex-col sm:flex-row gap-4 p-4">
                          <img src={donation.image} alt={donation.title} className="w-full sm:w-24 h-24 object-cover rounded-xl flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <h3 className="font-semibold">{donation.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">{donation.description}</p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{donation.category}</Badge>
                              <Link to={`/donations/${donation.id}`}>
                                <Button variant="outline" size="sm">{t('dashboard.view_details')}</Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground">{t('dashboard.no_saved')}</p>
                    <Link to="/donations"><Button variant="outline" className="mt-4">{t('dashboard.browse_donations_btn')}</Button></Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 6. PROFILE */}
          <TabsContent value="profile" className="mt-6">
            <Card className="border-none card-shadow rounded-3xl bg-card overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('dashboard.profile_title')}</CardTitle>
                  <Button variant="outline" onClick={() => { setEditUserForm({ name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '', location: user?.location ?? '', avatar: user?.avatar ?? '' }); setIsEditProfileOpen(true); }}>
                    <Edit className="me-2 h-4 w-4" />{t('dashboard.edit_profile')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <Avatar className="h-24 w-24 flex-shrink-0">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-2xl bg-primary text-white">{user?.name?.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4 text-right">
                    <div>
                      <h3 className="text-xl font-bold">{user?.name}</h3>
                      <p className="text-muted-foreground">{user?.email}</p>
                      <Badge className="mt-1 bg-primary/10 text-primary">
                        {user?.role === 'admin' ? 'مدير' : user?.user_type === 'charity' ? 'جمعية' : 'متبرع'}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-2">
                      {user?.phone && <div className="flex items-center justify-end gap-2 text-sm">{user.phone}<span className="text-muted-foreground">📱</span></div>}
                      {user?.location && <div className="flex items-center justify-end gap-2 text-sm">{user.location}<span className="text-muted-foreground">📍</span></div>}
                      <div className="flex items-center justify-end gap-2 text-sm">انضم في {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-SA') : '-'}<span className="text-muted-foreground">📅</span></div>
                      {/* Rating & completed donations */}
                      {((user?.average_rating ?? 0) > 0 || (user?.completed_donations_count ?? 0) > 0) && (
                        <div className="flex items-center justify-end gap-4 text-sm mt-1">
                          {(user?.average_rating ?? 0) > 0 && (
                            <span className="flex items-center gap-1">⭐ {user!.average_rating!.toFixed(1)} ({user?.rating_count} تقييم)</span>
                          )}
                          {(user?.completed_donations_count ?? 0) > 0 && (
                            <span className="flex items-center gap-1">✅ {user?.completed_donations_count} تبرع مكتمل</span>
                          )}
                        </div>
                      )}

                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{user?.profileComplete ?? 40}%</span>
                        <span className="text-muted-foreground">{t('dashboard.profile_complete')}</span>
                      </div>
                      <Progress value={user?.profileComplete ?? 40} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader className="text-right mb-4">
            <DialogTitle className="text-2xl font-bold">{t('dashboard.edit_profile_title')}</DialogTitle>
            <DialogDescription>{t('dashboard.edit_profile_desc')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProfile} className="space-y-5">
            <div className="flex flex-col items-center justify-center space-y-4 mb-2">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-primary/20">
                  <AvatarImage src={editUserForm.avatar} />
                  <AvatarFallback className="text-3xl bg-primary text-white">
                    {editUserForm.name?.slice(0, 2) || (user?.name?.slice(0, 2) ?? 'U')}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                />
                <Button
                  type="button"
                  size="icon"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">اضغط على زر التعديل لتغيير الصورة (الحد الأقصى 5MB)</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">اسم المستخدم</Label>
              <Input value={editUserForm.name} className={`bg-muted/50 ${profileErrors.name ? 'border-destructive' : ''}`} onChange={(e) => { setEditUserForm({ ...editUserForm, name: e.target.value }); setProfileErrors(p => ({ ...p, name: undefined })); }} />
              {profileErrors.name && <p className="text-xs text-destructive">{profileErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">البريد الإلكتروني</Label>
              <Input value={editUserForm.email} className={`bg-muted/50 text-left dir-ltr ${profileErrors.email ? 'border-destructive' : ''}`} onChange={(e) => { setEditUserForm({ ...editUserForm, email: e.target.value }); setProfileErrors(p => ({ ...p, email: undefined })); }} dir="ltr" />
              {profileErrors.email && <p className="text-xs text-destructive">{profileErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">رقم الهاتف</Label>
              <Input value={editUserForm.phone} placeholder="07X XXXX XXXX" maxLength={10} className={`bg-muted/50 text-left dir-ltr ${profileErrors.phone ? 'border-destructive' : ''}`} onChange={(e) => { const v = sanitizePhone(e.target.value); setEditUserForm({ ...editUserForm, phone: v }); setProfileErrors(p => ({ ...p, phone: undefined })); }} dir="ltr" />
              {profileErrors.phone && <p className="text-xs text-destructive">{profileErrors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">الموقع أو العنوان</Label>
              <Input value={editUserForm.location} placeholder="إربد محيط الجامعة" className={`bg-muted/50 ${profileErrors.location ? 'border-destructive' : ''}`} onChange={(e) => { setEditUserForm({ ...editUserForm, location: e.target.value }); setProfileErrors(p => ({ ...p, location: undefined })); }} />
              {profileErrors.location && <p className="text-xs text-destructive">{profileErrors.location}</p>}
            </div>
            <DialogFooter className="mt-8 gap-3 sm:justify-end">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setIsEditProfileOpen(false)}>إلغاء</Button>
              <Button type="submit" className="w-full sm:w-auto">حفظ التعديلات</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle><AlertDialogDescription>لا يمكن استعادة التبرع بعد الحذف.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={handleDeleteItem} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Donation Dialog */}
      <Dialog open={isEditDonationOpen} onOpenChange={setIsEditDonationOpen}>
        <DialogContent className="sm:max-w-lg p-6">
          <DialogHeader className="text-right mb-4">
            <DialogTitle className="text-2xl font-bold">تعديل التبرع</DialogTitle>
            <DialogDescription>قم بتحديث تفاصيل التبرع الخاص بك أدناه.</DialogDescription>
          </DialogHeader>
          {donationToEdit && (
            <form onSubmit={handleEditDonation} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">العنوان</Label>
                <Input 
                  value={donationToEdit.title} 
                  onChange={(e) => setDonationToEdit({ ...donationToEdit, title: e.target.value })} 
                  className="h-11 bg-muted/50 rounded-xl focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">الوصف</Label>
                <Textarea 
                  value={donationToEdit.description} 
                  onChange={(e) => setDonationToEdit({ ...donationToEdit, description: e.target.value })} 
                  rows={3}
                  className="bg-muted/50 rounded-xl resize-none focus-visible:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">الفئة</Label>
                  <Select value={donationToEdit.category} onValueChange={(v) => setDonationToEdit({ ...donationToEdit, category: v })}>
                    <SelectTrigger className="h-11 bg-muted/50 rounded-xl focus:ring-primary">
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ملابس">ملابس</SelectItem>
                      <SelectItem value="طعام">طعام</SelectItem>
                      <SelectItem value="أثاث">أثاث</SelectItem>
                      <SelectItem value="كتب">كتب</SelectItem>
                      <SelectItem value="مستلزمات طبية">مستلزمات طبية</SelectItem>
                      <SelectItem value="أخرى">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">الموقع</Label>
                  <div className="relative">
                    <MapPin className="absolute end-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                    <Input
                      value={donationToEdit.location}
                      onChange={(e) => setDonationToEdit({ ...donationToEdit, location: e.target.value })}
                      className="h-11 pe-12 bg-muted/50 rounded-xl focus-visible:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">صورة التبرع</Label>
                <div className="flex flex-col gap-3">
                  {donationToEdit.image ? (
                    <div className="relative w-full h-44 rounded-xl overflow-hidden group border border-border/40 bg-muted/20">
                      <img src={donationToEdit.image} alt={donationToEdit.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="font-semibold flex items-center gap-2 rounded-lg shadow"
                          onClick={() => donationImageInputRef.current?.click()}
                        >
                          <ImageIcon className="h-4 w-4" />
                          تغيير الصورة
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-28 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-muted/50 transition-colors"
                      onClick={() => donationImageInputRef.current?.click()}
                    >
                      <Upload className="h-6 w-6 text-primary" />
                      <span className="text-xs text-muted-foreground">اضغط لرفع صورة التبرع</span>
                    </Button>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={donationImageInputRef}
                    onChange={handleDonationImageChange}
                  />
                </div>
              </div>

              <DialogFooter className="mt-8 gap-3 sm:justify-end">
                <Button type="button" variant="outline" className="w-full sm:w-auto rounded-xl" onClick={() => setIsEditDonationOpen(false)}>إلغاء</Button>
                <Button type="submit" className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-primary to-secondary text-white shadow-md">حفظ التغييرات</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <RatingDialog
        open={showRating}
        onOpenChange={setShowRating}
        userName={ratingTarget?.rateeName || ''}
        donationId={ratingTarget?.donationId || ''}
        rateeId={ratingTarget?.rateeId || ''}
        onRated={() => {
          setRatingTarget(null);

        }}
      />
    </DashboardLayout>
  );
}