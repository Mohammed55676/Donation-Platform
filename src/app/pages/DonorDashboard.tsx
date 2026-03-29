import { useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router';
import { isValidEmail, isLettersOnly, sanitizePhone } from '../utils/validators';
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
import { Package, CheckCircle, Clock, Edit, Trash2, Eye, Gift, Heart, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications } from '../context/NotificationContext';
import { useDonations } from '../context/DonationContext';

function StatCard({ label, value, icon: Icon, color, bgColor, trend }: {
  label: string; value: number | string; icon: typeof Package;
  color: string; bgColor: string; trend?: string;
}) {
  return (
    <Card className="hover:shadow-lg transition-all border border-border/60 hover:border-primary/40 bg-card/90">
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

export function DonorDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const { user, updateUser } = useAuth();
  const { addNotification } = useNotifications();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [profileErrors, setProfileErrors] = useState<{ name?: string; email?: string; phone?: string; location?: string }>({});

  const [editUserForm, setEditUserForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    location: user?.location ?? '',
    avatar: user?.avatar ?? '',
  });

  const { donations, deleteDonation, updateDonation } = useDonations();
  const myDonations = donations.filter(d => d.donor.name === user?.name);
  const [isEditDonationOpen, setIsEditDonationOpen] = useState(false);
  const [donationToEdit, setDonationToEdit] = useState<any>(null);

  const stats = [
    { label: 'تبرعاتي', value: myDonations.length, icon: Package, color: 'text-primary', bgColor: 'bg-primary/10', trend: '+2 هذا الشهر' },
    { label: 'متاح', value: myDonations.filter(d => d.status === 'متاح').length, icon: Gift, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'محجوز', value: myDonations.filter(d => d.status === 'محجوز').length, icon: Clock, color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
    { label: 'تم التسليم', value: myDonations.filter(d => d.status === 'تم التسليم').length, icon: CheckCircle, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  ];

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
    toast.success('تم تحديث الملف الشخصي!');
    setIsEditProfileOpen(false);
    addNotification({ type: 'success', title: 'تم التحديث', message: 'تم تحديث ملفك الشخصي بنجاح' });
  };

  const handleDeleteItem = () => {
    if (itemToDelete) deleteDonation(itemToDelete);
    toast.success('تم حذف التبرع!');
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleEditDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (donationToEdit) updateDonation(donationToEdit.id, donationToEdit);
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
              <p className="text-white/80 text-sm">شكراً لمساهمتك في بناء مجتمع أفضل</p>
            </div>
            <div className="text-4xl">🌟</div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white/80">اكتمال الملف الشخصي</span>
              <span className="font-bold">{user?.profileComplete ?? 40}%</span>
            </div>
            <Progress value={user?.profileComplete ?? 40} className="h-2 bg-white/30 [&>div]:bg-white" />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setTab}>
          <TabsList className="flex flex-wrap gap-1 h-auto rounded-xl p-1 bg-muted">
            <TabsTrigger value="overview" className="rounded-lg">نظرة عامة</TabsTrigger>
            <TabsTrigger value="donations" className="rounded-lg">تبرعاتي</TabsTrigger>
            <TabsTrigger value="profile" className="rounded-lg">الملف الشخصي</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            <Card>
              <CardHeader><CardTitle>الإجراءات السريعة</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: 'إضافة تبرع', icon: Gift, path: '/add-donation', color: 'bg-primary/10 hover:bg-primary/20 text-primary' },
                    { label: 'تصفح التبرعات', icon: Package, path: '/donations', color: 'bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400' },
                    { label: 'المجتمع', icon: Heart, path: '/community', color: 'bg-pink-50 hover:bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:hover:bg-pink-900/30 dark:text-pink-400' },
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
                {myDonations.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground">لم تقدم أي تبرعات بعد</p>
                    <Link to="/add-donation"><Button variant="outline" className="mt-4">أضف تبرعاً الآن</Button></Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myDonations.map((donation: any) => (
                      <Card key={donation.id} className="overflow-hidden hover:shadow-md border border-border/60 hover:border-primary/30 transition-all">
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
                )}
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
                  <Avatar className="h-24 w-24 flex-shrink-0">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-2xl bg-primary text-white">{user?.name?.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4 text-right">
                    <div>
                      <h3 className="text-xl font-bold">{user?.name}</h3>
                      <p className="text-muted-foreground">{user?.email}</p>
                      <Badge className="mt-1 bg-primary/10 text-primary">متبرع</Badge>
                    </div>
                    <div className="flex flex-col gap-2">
                      {user?.phone && <div className="flex items-center justify-end gap-2 text-sm">{user.phone}<span className="text-muted-foreground">📱</span></div>}
                      {user?.location && <div className="flex items-center justify-end gap-2 text-sm">{user.location}<span className="text-muted-foreground">📍</span></div>}
                      <div className="flex items-center justify-end gap-2 text-sm">انضم في {user?.joinDate ? new Date(user.joinDate).toLocaleDateString('ar-SA') : '-'}<span className="text-muted-foreground">📅</span></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{user?.profileComplete ?? 40}%</span>
                        <span className="text-muted-foreground">اكتمال الملف الشخصي</span>
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
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>تعديل الملف الشخصي</DialogTitle><DialogDescription>قم بتحديث معلوماتك الشخصية</DialogDescription></DialogHeader>
          <form onSubmit={handleEditProfile} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="donor-name">الاسم</Label>
              <Input id="donor-name" value={editUserForm.name} className={profileErrors.name ? 'border-destructive' : ''} onChange={(e) => { setEditUserForm({ ...editUserForm, name: e.target.value }); setProfileErrors(p => ({ ...p, name: undefined })); }} />
              {profileErrors.name && <p className="text-xs text-destructive">{profileErrors.name}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="donor-email">البريد</Label>
              <Input id="donor-email" value={editUserForm.email} className={profileErrors.email ? 'border-destructive' : ''} onChange={(e) => { setEditUserForm({ ...editUserForm, email: e.target.value }); setProfileErrors(p => ({ ...p, email: undefined })); }} dir="ltr" />
              {profileErrors.email && <p className="text-xs text-destructive">{profileErrors.email}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="donor-phone">الهاتف</Label>
              <Input id="donor-phone" value={editUserForm.phone} placeholder="07X XXXX XXXX" maxLength={10} className={profileErrors.phone ? 'border-destructive' : ''} onChange={(e) => { const v = sanitizePhone(e.target.value); setEditUserForm({ ...editUserForm, phone: v }); setProfileErrors(p => ({ ...p, phone: undefined })); }} dir="ltr" />
              {profileErrors.phone && <p className="text-xs text-destructive">{profileErrors.phone}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="donor-location">الموقع</Label>
              <Input id="donor-location" value={editUserForm.location} placeholder="عمّان" className={profileErrors.location ? 'border-destructive' : ''} onChange={(e) => { setEditUserForm({ ...editUserForm, location: e.target.value }); setProfileErrors(p => ({ ...p, location: undefined })); }} />
              {profileErrors.location && <p className="text-xs text-destructive">{profileErrors.location}</p>}
            </div>
            <div className="space-y-2">
              <Label>صورة الملف الشخصي</Label>
              <div className="flex items-center gap-4">
                {editUserForm.avatar && <img src={editUserForm.avatar} alt="preview" className="w-16 h-16 rounded-full object-cover border-2 border-border" />}
                <label htmlFor="donor-avatar-upload" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-muted hover:bg-muted/70 cursor-pointer text-sm font-medium transition-colors">
                  📷 اختر صورة
                  <input ref={fileInputRef} id="donor-avatar-upload" type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setEditUserForm(prev => ({ ...prev, avatar: reader.result as string }));
                    reader.readAsDataURL(file);
                  }} />
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
          <AlertDialogHeader><AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle><AlertDialogDescription>لا يمكن استعادة هذا التبرع بعد الحذف.</AlertDialogDescription></AlertDialogHeader>
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
    </DashboardLayout>
  );
}
