import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
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
import {
  Package, Heart, CheckCircle, Clock, Edit, Trash2, Eye, Gift,
  HelpCircle, Users, Star, TrendingUp, Bell,
} from 'lucide-react';
import { donations } from '../data/donations';
import { toast } from 'sonner';
import { useNotifications } from '../context/NotificationContext';
import { RatingDialog } from '../components/RatingDialog';

function StatCard({ label, value, icon: Icon, color, bgColor, trend }: {
  label: string; value: number | string; icon: typeof Package;
  color: string; bgColor: string; trend?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
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

export function UserDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const { user, updateUser } = useAuth();
  const { addNotification } = useNotifications();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showRating, setShowRating] = useState(false);

  const [editUserForm, setEditUserForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    location: user?.location ?? '',
    avatar: user?.avatar ?? '',
  });

  const [myDonations, setMyDonations] = useState(() => {
    const saved = localStorage.getItem('dashboard_donations');
    if (saved) return JSON.parse(saved);
    return donations.slice(0, 3);
  });
  const [isEditDonationOpen, setIsEditDonationOpen] = useState(false);
  const [donationToEdit, setDonationToEdit] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('dashboard_donations', JSON.stringify(myDonations));
  }, [myDonations]);

  const myRequests = [
    { id: '1', donation: donations[3], status: 'قيد المراجعة', requestDate: '2026-03-18' },
    { id: '2', donation: donations[4], status: 'تم القبول', requestDate: '2026-03-17' },
    { id: '3', donation: donations[5], status: 'تم التسليم', requestDate: '2026-03-15' },
  ];

  const activityHistory = [
    { date: '2026-03-18', action: 'طلبت تبرع مواد غذائية', type: 'request' },
    { date: '2026-03-15', action: 'أضفت تبرع ملابس شتوية', type: 'donate' },
    { date: '2026-03-12', action: 'تم تسليم طلبك بنجاح', type: 'delivery' },
    { date: '2026-03-10', action: 'قيّمت المتطوع بـ 5 نجوم', type: 'rating' },
  ];

  const stats = [
    { label: 'تبرعاتي', value: myDonations.length, icon: Package, color: 'text-primary', bgColor: 'bg-primary/10', trend: '+2 هذا الشهر' },
    { label: 'طلباتي', value: myRequests.length, icon: Heart, color: 'text-pink-500', bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
    { label: 'تم التسليم', value: myRequests.filter(r => r.status === 'تم التسليم').length, icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'قيد المراجعة', value: myRequests.filter(r => r.status === 'قيد المراجعة').length, icon: Clock, color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'تم التسليم': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400';
      case 'تم القبول': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400';
      case 'قيد المراجعة': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400';
      default: return '';
    }
  };

  const handleEditProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(editUserForm);
    toast.success('تم تحديث الملف الشخصي!');
    setIsEditProfileOpen(false);
    addNotification({ type: 'success', title: 'تم التحديث', message: 'تم تحديث ملفك الشخصي بنجاح' });
  };

  const handleDeleteItem = () => {
    setMyDonations(myDonations.filter((d: any) => d.id !== itemToDelete));
    toast.success('تم حذف العنصر!');
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleEditDonation = (e: React.FormEvent) => {
    e.preventDefault();
    setMyDonations(myDonations.map((d: any) => d.id === donationToEdit.id ? donationToEdit : d));
    toast.success('تم تحديث التبرع!');
    setIsEditDonationOpen(false);
  };

  const setTab = (tab: string) => setSearchParams(tab === 'overview' ? {} : { tab });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Welcome banner */}
        <div className="rounded-2xl bg-gradient-to-l from-primary to-secondary p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">مرحباً، {user?.name?.split(' ')[0]} 👋</h2>
              <p className="text-white/80 text-sm">أنت تساهم في بناء مجتمع أفضل</p>
            </div>
            <div className="text-4xl">🌟</div>
          </div>
          {/* Profile completion */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white/80">اكتمال الملف الشخصي</span>
              <span className="font-bold">{user?.profileComplete ?? 40}%</span>
            </div>
            <Progress value={user?.profileComplete ?? 40} className="h-2 bg-white/30 [&>div]:bg-white" />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setTab}>
          <TabsList className="flex flex-wrap gap-1 h-auto rounded-xl p-1 bg-muted">
            <TabsTrigger value="overview" className="rounded-lg">نظرة عامة</TabsTrigger>
            <TabsTrigger value="donations" className="rounded-lg">تبرعاتي</TabsTrigger>
            <TabsTrigger value="requests" className="rounded-lg">طلباتي</TabsTrigger>
            <TabsTrigger value="profile" className="rounded-lg">الملف الشخصي</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader><CardTitle>الإجراءات السريعة</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'تبرع الآن', icon: Gift, path: '/add-donation', color: 'bg-primary/10 hover:bg-primary/20 text-primary' },
                    { label: 'طلب مساعدة', icon: HelpCircle, path: '/requests', color: 'bg-secondary/10 hover:bg-secondary/20 text-secondary' },
                    { label: 'تصفح التبرعات', icon: Package, path: '/donations', color: 'bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400' },
                    { label: 'التطوع', icon: Users, path: '/volunteer', color: 'bg-purple-50 hover:bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:text-purple-400' },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link key={action.path} to={action.path}>
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

            {/* Recent activity */}
            <Card>
              <CardHeader><CardTitle>النشاط الأخير</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activityHistory.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.type === 'donate' ? 'bg-primary/10' :
                        item.type === 'request' ? 'bg-orange-100 dark:bg-orange-900/30' :
                        item.type === 'delivery' ? 'bg-green-100 dark:bg-green-900/30' :
                        'bg-yellow-100 dark:bg-yellow-900/30'
                      }`}>
                        {item.type === 'donate' ? <Gift className="h-4 w-4 text-primary" /> :
                         item.type === 'request' ? <Clock className="h-4 w-4 text-orange-500" /> :
                         item.type === 'delivery' ? <CheckCircle className="h-4 w-4 text-green-500" /> :
                         <Star className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{item.action}</p>
                        <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString('ar-SA')}</p>
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
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>تبرعاتي</CardTitle>
                    <CardDescription>التبرعات التي قمت بإضافتها</CardDescription>
                  </div>
                  <Link to="/add-donation"><Button><Package className="ml-2 h-4 w-4" />إضافة تبرع</Button></Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myDonations.map((donation: any) => (
                    <Card key={donation.id} className="overflow-hidden hover:shadow-sm transition-shadow">
                      <div className="flex flex-col sm:flex-row gap-4 p-4">
                        <img src={donation.image} alt={donation.title} className="w-full sm:w-28 h-28 object-cover rounded-xl flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold">{donation.title}</h3>
                            <Badge variant={donation.status === 'متاح' ? 'default' : 'secondary'}>{donation.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{donation.description}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{donation.category}</Badge>
                            <Badge variant="outline">{donation.condition}</Badge>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <Link to={`/donations/${donation.id}`}><Button variant="outline" size="sm"><Eye className="ml-2 h-4 w-4" />عرض</Button></Link>
                            <Button variant="outline" size="sm" onClick={() => { setDonationToEdit(donation); setIsEditDonationOpen(true); }}><Edit className="ml-2 h-4 w-4" />تعديل</Button>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => { setItemToDelete(donation.id); setIsDeleteDialogOpen(true); }}><Trash2 className="ml-2 h-4 w-4" />حذف</Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REQUESTS */}
          <TabsContent value="requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>طلباتي</CardTitle>
                <CardDescription>التبرعات التي طلبتها</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myRequests.map((request) => (
                    <Card key={request.id} className="overflow-hidden hover:shadow-sm transition-shadow">
                      <div className="flex flex-col sm:flex-row gap-4 p-4">
                        <img src={request.donation.image} alt={request.donation.title} className="w-full sm:w-28 h-28 object-cover rounded-xl flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold">{request.donation.title}</h3>
                            <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{request.donation.description}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{request.donation.category}</Badge>
                            <Badge variant="outline">📅 {new Date(request.requestDate).toLocaleDateString('ar-SA')}</Badge>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <Link to={`/donations/${request.donation.id}`}><Button variant="outline" size="sm"><Eye className="ml-2 h-4 w-4" />عرض</Button></Link>
                            {request.status === 'تم التسليم' && (
                              <Button variant="outline" size="sm" onClick={() => setShowRating(true)}><Star className="ml-2 h-4 w-4" />تقييم</Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PROFILE */}
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>الملف الشخصي</CardTitle>
                  <Button variant="outline" onClick={() => { setEditUserForm({ name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '', location: user?.location ?? '', avatar: user?.avatar ?? '' }); setIsEditProfileOpen(true); }}>
                    <Edit className="ml-2 h-4 w-4" />تعديل
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-2xl bg-primary text-white">{user?.name?.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold">{user?.name}</h3>
                      <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {user?.phone && <div className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">📱</span>{user.phone}</div>}
                      {user?.location && <div className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">📍</span>{user.location}</div>}
                      <div className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">📅</span>انضم في {user?.joinDate ? new Date(user.joinDate).toLocaleDateString('ar-SA') : '-'}</div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">اكتمال الملف الشخصي</span>
                        <span className="font-medium">{user?.profileComplete ?? 40}%</span>
                      </div>
                      <Progress value={user?.profileComplete ?? 40} className="h-2" />
                      {(user?.profileComplete ?? 40) < 100 && (
                        <p className="text-xs text-muted-foreground mt-1">أضف رقم الهاتف والموقع لإكمال ملفك</p>
                      )}
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
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>تعديل الملف الشخصي</DialogTitle><DialogDescription>قم بتحديث معلوماتك الشخصية</DialogDescription></DialogHeader>
          <form onSubmit={handleEditProfile} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="name">الاسم</Label><Input id="name" value={editUserForm.name} onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="email">البريد</Label><Input id="email" value={editUserForm.email} onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })} dir="ltr" /></div>
            <div className="space-y-2"><Label htmlFor="phone">الهاتف</Label><Input id="phone" value={editUserForm.phone} placeholder="+962 79 123 4567" onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })} dir="ltr" /></div>
            <div className="space-y-2"><Label htmlFor="location">الموقع</Label><Input id="location" value={editUserForm.location} placeholder="عمّان" onChange={(e) => setEditUserForm({ ...editUserForm, location: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>صورة الملف الشخصي</Label>
              <div className="flex items-center gap-4">
                {editUserForm.avatar && (
                  <img src={editUserForm.avatar} alt="preview" className="w-16 h-16 rounded-full object-cover border-2 border-border" />
                )}
                <label
                  htmlFor="avatar-upload"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-muted hover:bg-muted/70 cursor-pointer text-sm font-medium transition-colors"
                >
                  📷 اختر صورة من جهازك
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        setEditUserForm(prev => ({ ...prev, avatar: reader.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
            </div>
            <DialogFooter><Button type="submit">حفظ التغييرات</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader><AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle><AlertDialogDescription>لا يمكن استعادة هذا العنصر بعد الحذف.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={handleDeleteItem} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Donation Dialog */}
      <Dialog open={isEditDonationOpen} onOpenChange={setIsEditDonationOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>تعديل التبرع</DialogTitle></DialogHeader>
          {donationToEdit && (
            <form onSubmit={handleEditDonation} className="space-y-4">
              <div className="space-y-2"><Label>العنوان</Label><Input value={donationToEdit.title} onChange={(e) => setDonationToEdit({ ...donationToEdit, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>الوصف</Label><Input value={donationToEdit.description} onChange={(e) => setDonationToEdit({ ...donationToEdit, description: e.target.value })} /></div>
              <div className="space-y-2"><Label>الحالة</Label><Input value={donationToEdit.condition} onChange={(e) => setDonationToEdit({ ...donationToEdit, condition: e.target.value })} /></div>
              <DialogFooter><Button type="submit">حفظ</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <RatingDialog open={showRating} onOpenChange={setShowRating} userName="المتطوع" />
    </DashboardLayout>
  );
}
