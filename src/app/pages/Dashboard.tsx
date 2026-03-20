import { useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { 
  Package, 
  Heart, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { donations } from '../data/donations';
import { toast } from 'sonner';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('my-donations');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // User state
  const [user, setUser] = useState({
    name: 'أحمد محمد',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    email: 'ahmed@example.com',
    phone: '+966 50 123 4567',
    location: 'الرياض',
    joinDate: '2026-01-15',
  });
  const [editUserForm, setEditUserForm] = useState(user);

  // Donations state
  const [myDonations, setMyDonations] = useState(donations.slice(0, 3));
  const [isEditDonationOpen, setIsEditDonationOpen] = useState(false);
  const [donationToEdit, setDonationToEdit] = useState<any>(null);

  const handleEditProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUser(editUserForm);
    toast.success('تم تحديث الملف الشخصي بنجاح!');
    setIsEditProfileOpen(false);
  };

  const handleDeleteItem = () => {
    setMyDonations(myDonations.filter(d => d.id !== itemToDelete));
    toast.success('تم حذف العنصر بنجاح!');
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleEditDonation = (e: React.FormEvent) => {
    e.preventDefault();
    setMyDonations(myDonations.map(d => d.id === donationToEdit.id ? donationToEdit : d));
    toast.success('تم تحديث التبرع بنجاح!');
    setIsEditDonationOpen(false);
  };

  // Mock requests (keep same, but usually would be state too)
  // Mock requests
  const myRequests = [
    {
      id: '1',
      donation: donations[3],
      status: 'قيد المراجعة',
      requestDate: '2026-03-18',
    },
    {
      id: '2',
      donation: donations[4],
      status: 'تم القبول',
      requestDate: '2026-03-17',
    },
    {
      id: '3',
      donation: donations[5],
      status: 'تم التسليم',
      requestDate: '2026-03-15',
    },
  ];

  const stats = [
    {
      label: 'تبرعاتي',
      value: myDonations.length,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'طلباتي',
      value: myRequests.length,
      icon: Heart,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      label: 'تم التسليم',
      value: myRequests.filter(r => r.status === 'تم التسليم').length,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    {
      label: 'قيد المراجعة',
      value: myRequests.filter(r => r.status === 'قيد المراجعة').length,
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'تم التسليم':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'تم القبول':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'قيد المراجعة':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'تم الرفض':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl mb-2">لوحة التحكم</h1>
          <p className="text-muted-foreground">إدارة تبرعاتك وطلباتك</p>
        </div>

        {/* User Profile Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl mb-1">{user.name}</h2>
                <p className="text-muted-foreground mb-3">{user.email}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>📱 {user.phone}</span>
                  <span>📍 {user.location}</span>
                  <span>📅 انضم في {new Date(user.joinDate).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
              <Button variant="outline" onClick={() => { setEditUserForm(user); setIsEditProfileOpen(true); }}>
                <Edit className="ml-2 h-4 w-4" />
                تعديل الملف الشخصي
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-auto grid-cols-2 mb-6">
            <TabsTrigger value="my-donations" className="gap-2">
              <Package className="h-4 w-4" />
              تبرعاتي
            </TabsTrigger>
            <TabsTrigger value="my-requests" className="gap-2">
              <Heart className="h-4 w-4" />
              طلباتي
            </TabsTrigger>
          </TabsList>

          {/* My Donations Tab */}
          <TabsContent value="my-donations">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>تبرعاتي</CardTitle>
                    <CardDescription>التبرعات التي قمت بإضافتها</CardDescription>
                  </div>
                  <Link to="/add-donation">
                    <Button>
                      <Package className="ml-2 h-4 w-4" />
                      إضافة تبرع
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myDonations.map((donation) => (
                    <Card key={donation.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row gap-4 p-4">
                        <img
                          src={donation.image}
                          alt={donation.title}
                          className="w-full md:w-32 h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold mb-1">{donation.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {donation.description}
                              </p>
                            </div>
                            <Badge 
                              variant={donation.status === 'متاح' ? 'default' : 'secondary'}
                              className={donation.status === 'متاح' ? 'bg-secondary text-white' : ''}
                            >
                              {donation.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{donation.category}</Badge>
                            <Badge variant="outline">{donation.condition}</Badge>
                            <Badge variant="outline">{donation.location}</Badge>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Link to={`/donations/${donation.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="ml-2 h-4 w-4" />
                                عرض
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm" onClick={() => { setDonationToEdit(donation); setIsEditDonationOpen(true); }}>
                              <Edit className="ml-2 h-4 w-4" />
                              تعديل
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => { setItemToDelete(donation.id); setIsDeleteDialogOpen(true); }}>
                              <Trash2 className="ml-2 h-4 w-4" />
                              حذف
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Requests Tab */}
          <TabsContent value="my-requests">
            <Card>
              <CardHeader>
                <CardTitle>طلباتي</CardTitle>
                <CardDescription>التبرعات التي طلبتها</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myRequests.map((request) => (
                    <Card key={request.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row gap-4 p-4">
                        <img
                          src={request.donation.image}
                          alt={request.donation.title}
                          className="w-full md:w-32 h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold mb-1">{request.donation.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {request.donation.description}
                              </p>
                            </div>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{request.donation.category}</Badge>
                            <Badge variant="outline">{request.donation.location}</Badge>
                            <Badge variant="outline">
                              📅 {new Date(request.requestDate).toLocaleDateString('ar-SA')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 pt-2">
                            <img
                              src={request.donation.donor.avatar}
                              alt={request.donation.donor.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <span className="text-sm text-muted-foreground">
                              المتبرع: {request.donation.donor.name}
                            </span>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Link to={`/donations/${request.donation.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="ml-2 h-4 w-4" />
                                عرض التفاصيل
                              </Button>
                            </Link>
                            {request.status === 'قيد المراجعة' && (
                              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                <XCircle className="ml-2 h-4 w-4" />
                                إلغاء الطلب
                              </Button>
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
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تعديل الملف الشخصي</DialogTitle>
            <DialogDescription>قم بتحديث معلوماتك الشخصية.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProfile}>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                الاسم
              </Label>
              <Input
                id="name"
                value={editUserForm.name}
                className="col-span-3"
                onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                value={editUserForm.email}
                className="col-span-3"
                onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                الهاتف
              </Label>
              <Input
                id="phone"
                value={editUserForm.phone}
                className="col-span-3"
                onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4 mt-4">
              <Label htmlFor="location" className="text-right">
                الموقع
              </Label>
              <Input
                id="location"
                value={editUserForm.location}
                className="col-span-3"
                onChange={(e) => setEditUserForm({ ...editUserForm, location: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="submit">حفظ التغييرات</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Item Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من أنك تريد حذف هذا العنصر؟ لا يمكن استعادة هذا العنصر بعد الحذف.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Donation Dialog */}
      <Dialog open={isEditDonationOpen} onOpenChange={setIsEditDonationOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تعديل التبرع</DialogTitle>
            <DialogDescription>قم بتحديث معلومات التبرع الخاص بك.</DialogDescription>
          </DialogHeader>
          {donationToEdit && (
            <form onSubmit={handleEditDonation}>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="donation-title">العنوان</Label>
                  <Input
                    id="donation-title"
                    value={donationToEdit.title}
                    onChange={(e) => setDonationToEdit({ ...donationToEdit, title: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="donation-desc">الوصف</Label>
                  <Input
                    id="donation-desc"
                    value={donationToEdit.description}
                    onChange={(e) => setDonationToEdit({ ...donationToEdit, description: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="donation-condition">الحالة</Label>
                  <Input
                    id="donation-condition"
                    value={donationToEdit.condition}
                    onChange={(e) => setDonationToEdit({ ...donationToEdit, condition: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="submit">حفظ التغييرات</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}