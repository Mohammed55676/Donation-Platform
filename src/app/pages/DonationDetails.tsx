import { useParams, Link } from 'react-router';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { ChatDialog } from '../components/ChatDialog';
import { 
  MapPin, 
  Calendar, 
  Package, 
  CheckCircle, 
  MessageSquare, 
  Share2,
  Heart,
  ArrowRight
} from 'lucide-react';
import { useDonations } from '../context/DonationContext';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export function DonationDetails() {
  const { id } = useParams();
  const { donations } = useDonations();
  const donation = donations.find(d => d.id === id);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { addNotification } = useNotifications();
  const { user, toggleWishlist } = useAuth();

  if (!donation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">التبرع غير موجود</h2>
          <Link to="/donations">
            <Button variant="outline">
              العودة إلى التبرعات
              <ArrowRight className="mr-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'عالية':
        return 'bg-red-500 hover:bg-red-600';
      case 'متوسطة':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'منخفضة':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'جديد':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'جيد جداً':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'جيد':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'مستعمل':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return '';
    }
  };

  const [isRequesting, setIsRequesting] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');

  const handleRequestDonation = () => {
    setIsRequesting(true);
    // Simulate a request to the server
    setTimeout(() => {
      addNotification({
        type: 'request',
        title: 'تم طلب التبرع بنجاح!',
        message: 'لقد قمت بطلب التبرع. سيتم التواصل معك قريباً.',
        donationId: donation.id,
      });
      setIsRequesting(false);
    }, 1000);
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => toast.success('تم نسخ الرابط! يمكنك الآن مشاركته ❤️'))
        .catch(() => toast.success(`شارك هذا الرابط: ${url}`));
    } else {
      toast.success(`شارك هذا الرابط: ${url}`);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/donations" className="text-primary hover:underline flex items-center gap-1">
            <ArrowRight className="h-4 w-4" />
            العودة إلى التبرعات
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <Card className="overflow-hidden">
              <div className="relative h-96">
                <img
                  src={donation.image}
                  alt={donation.title}
                  className="w-full h-full object-cover"
                />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Badge className={`${getUrgencyColor(donation.urgency)} text-white border-0`}>
                      {donation.urgency}
                    </Badge>
                  </div>
              </div>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="border-primary text-primary">
                        {donation.category}
                      </Badge>
                      <Badge 
                        variant={donation.status === 'متاح' ? 'default' : 'secondary'}
                        className={donation.status === 'متاح' ? 'bg-secondary hover:bg-secondary/90 text-white' : ''}
                      >
                        {donation.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-3xl mb-3">{donation.title}</CardTitle>
                    <CardDescription className="text-base">{donation.description}</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={user?.wishlist?.includes(donation.id) ? 'text-red-500' : 'text-gray-500'}
                    onClick={() => {
                      if (!user) {
                        toast.error('يجب تسجيل الدخول لحفظ التبرعات');
                        return;
                      }
                      toggleWishlist(donation.id);
                    }}
                  >
                    <Heart className={`h-5 w-5 ${user?.wishlist?.includes(donation.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">الموقع</p>
                      <p className="font-semibold">{donation.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-secondary/10">
                      <Calendar className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">تاريخ الإضافة</p>
                      <p className="font-semibold">{new Date(donation.createdAt).toLocaleDateString('ar-SA')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">الفئة</p>
                      <p className="font-semibold">{donation.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-secondary/10">
                      <CheckCircle className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">الحالة</p>
                      <p className="font-semibold">{donation.status}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات إضافية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">شروط الاستلام:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>يجب التواصل مع المتبرع قبل الاستلام</li>
                    <li>التحقق من هوية المستلم</li>
                    <li>الاستلام يكون من الموقع المحدد</li>
                  </ul>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">ملاحظات:</h4>
                  <p className="text-muted-foreground">
                    جميع التبرعات تخضع لسياسة المنصة. يرجى التأكد من صحة المعلومات قبل الاستلام.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donor Info */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات المتبرع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={donation.donor.avatar}
                    alt={donation.donor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-lg">{donation.donor.name}</p>
                    <p className="text-sm text-muted-foreground">متبرع نشط</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">12</p>
                    <p className="text-xs text-muted-foreground">تبرع</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary">8</p>
                    <p className="text-xs text-muted-foreground">مستفيد</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>إجراءات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {donation.status === 'متاح' ? (
                  <>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                      size="lg"
                      onClick={handleRequestDonation}
                      disabled={isRequesting}
                    >
                      <Package className="ml-2 h-5 w-5" />
                      طلب التبرع
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                      onClick={() => setIsChatOpen(true)}
                    >
                      <MessageSquare className="ml-2 h-5 w-5" />
                      تواصل مع المتبرع
                    </Button>
                  </>
                ) : (
                  <Button variant="secondary" className="w-full" size="lg" disabled>
                    <CheckCircle className="ml-2 h-5 w-5" />
                    {donation.status}
                  </Button>
                )}
                <Button variant="outline" className="w-full" onClick={handleShare}>
                  <Share2 className="ml-2 h-5 w-5" />
                  مشاركة
                </Button>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">نصائح الأمان</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>تحقق من هوية المتبرع</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>الالتقاء في مكان عام</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>فحص التبرع قبل الاستلام</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>الإبلاغ عن أي نشاط مشبوه</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <ChatDialog
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        recipientName={donation.donor.name}
        recipientAvatar={donation.donor.avatar}
        currentUser={user || undefined}
      />
    </div>
  );
}