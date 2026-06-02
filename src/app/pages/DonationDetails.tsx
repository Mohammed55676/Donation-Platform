import { useParams, Link, useNavigate } from 'react-router';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { 
  MapPin, 
  Calendar, 
  Package, 
  CheckCircle, 
  MessageSquare, 
  Share2,
  Heart,
  ArrowRight,
  AlertCircle,
  Loader2,
  Clock,
  XCircle,
  ShieldAlert,
} from 'lucide-react';
import { useDonations } from '../context/DonationContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { BeneficiaryVerificationModal } from '../components/BeneficiaryVerificationModal';
import { BeneficiaryProfileModal } from '../components/community/BeneficiaryProfileModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import api from '../utils/api';

// Types for beneficiary profile
interface BeneficiaryProfile {
  id: string;
  verification_status: 'not_verified' | 'pending_review' | 'trusted' | 'rejected' | 'blocked';
  verification_rejection_reason?: string | null;
  national_id_number?: string;
}

export function DonationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { donations } = useDonations();
  const donation = donations.find(d => d.id === id);
  const { user, toggleWishlist } = useAuth();

  // Verification modal state
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [beneficiaryProfile, setBeneficiaryProfile] = useState<BeneficiaryProfile | null | undefined>(undefined);
  const [profileLoading, setProfileLoading] = useState(false);

  // Donation request state
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestDone, setRequestDone] = useState(false);

  // Message modal state
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Fetch beneficiary profile when a beneficiary user views this page
  const fetchProfile = useCallback(async () => {
    if (!user || user.user_type !== 'beneficiary') return;
    setProfileLoading(true);
    try {
      const res = await api.get('/beneficiary/profile');
      setBeneficiaryProfile(res.data.data); // null if no profile
    } catch {
      setBeneficiaryProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, [user?.id, user?.user_type]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const HIGH_VALUE_CATEGORIES = ['أثاث', 'مستلزمات طبية', 'أجهزة', 'أجهزة كهربائية', 'إلكترونيات'];
  const isHighValue = donation ? HIGH_VALUE_CATEGORIES.includes(donation.category) : false;

  const handleRequestDonation = async () => {
    // 1. Not logged in
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }

    // 2. Not a beneficiary
    if (user.user_type !== 'beneficiary') {
      toast.error('هذه الميزة للمستفيدين فقط');
      return;
    }

    // 3. Check verification status
    if (profileLoading) return;

    const status = beneficiaryProfile?.verification_status;

    if (!beneficiaryProfile || !status || status === 'not_verified') {
      // For high-value items, redirect to full verification page
      if (isHighValue) {
        toast.info('هذا التبرع من فئة عالية القيمة. يجب إكمال ملف التحقق أولاً.');
        navigate('/verify-beneficiary');
        return;
      }
      setVerificationModalOpen(true);
      return;
    }
    if (status === 'pending_review') {
      toast.info('طلب التحقق قيد المراجعة. يرجى الانتظار.');
      return;
    }
    if (status === 'rejected') {
      if (isHighValue) {
        toast.info('تم رفض طلب التحقق. أعد تقديمه للحصول على تبرعات عالية القيمة.');
        navigate('/verify-beneficiary');
        return;
      }
      setVerificationModalOpen(true); // Allow resubmission
      return;
    }
    if (status === 'blocked') {
      toast.error('لا يمكنك طلب التبرعات حالياً، يرجى التواصل مع الإدارة.');
      return;
    }

    // 4. Trusted — submit real request
    if (status === 'trusted') {
      setIsRequesting(true);
      try {
        await api.post('/donation-requests', { donation_id: id });
        toast.success('تم تقديم طلب التبرع بنجاح! سيتم مراجعته من قِبَل الإدارة.');
        setRequestDone(true);
      } catch (err: any) {
        const msg = err.response?.data?.error || 'حدث خطأ أثناء تقديم الطلب.';
        toast.error(msg);
      } finally {
        setIsRequesting(false);
      }
    }
  };

  const handleSendMessageRequest = async () => {
    if (!donation) return;
    if (!messageText.trim()) return toast.error('يرجى كتابة الرسالة');
    setIsSendingMessage(true);
    try {
      const donorId = (donation.donor as any)?.id || (donation.donor as any)?._id;
      await api.post('/conversations/request', {
        receiver_id: donorId,
        message: messageText.trim()
      });
      toast.success('تم إرسال طلب المراسلة بنجاح!');
      setMessageModalOpen(false);
      setMessageText('');
      navigate('/messages');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Status UI for beneficiary sidebar card
  const renderBeneficiaryStatus = () => {
    if (!user || user.user_type !== 'beneficiary') return null;
    if (profileLoading) return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> جاري التحقق...
      </div>
    );

    const status = beneficiaryProfile?.verification_status;
    if (!status || status === 'not_verified') return (
      <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span>يجب التحقق من هويتك أولاً</span>
      </div>
    );
    if (status === 'pending_review') return (
      <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
        <Clock className="h-4 w-4 flex-shrink-0" />
        <span>التحقق قيد المراجعة</span>
      </div>
    );
    if (status === 'rejected') return (
      <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
        <XCircle className="h-4 w-4 flex-shrink-0" />
        <span>تم رفض التحقق — انقر لإعادة التقديم</span>
      </div>
    );
    if (status === 'blocked') return (
      <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
        <ShieldAlert className="h-4 w-4 flex-shrink-0" />
        <span>حسابك موقوف</span>
      </div>
    );
    if (status === 'trusted') return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <CheckCircle className="h-4 w-4 flex-shrink-0" />
        <span>هويتك محققة — يمكنك طلب التبرعات</span>
      </div>
    );
    return null;
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

  // Early return for missing donation
  if (!donation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">التبرع غير موجود</h2>
          <Link to="/donations">
            <Button variant="outline">
              العودة إلى التبرعات
              <ArrowRight className="me- h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'عالية': return 'bg-red-500 hover:bg-red-600';
      case 'متوسطة': return 'bg-orange-500 hover:bg-orange-600';
      case 'منخفضة': return 'bg-green-500 hover:bg-green-600';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
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
            <Card className="overflow-hidden border-none shadow-md">
              <div className="relative h-56 sm:h-72 md:h-96">
                <img
                  src={donation.image}
                  alt={donation.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/600x400/png?text=No+Image';
                  }}
                />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Badge className={`${getUrgencyColor(donation.urgency)} text-white border-0`}>
                      {donation.urgency}
                    </Badge>
                  </div>
              </div>
            </Card>

            {/* Details */}
            <Card className="border-none shadow-sm">
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
                      {isHighValue && (
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 border-amber-300">
                          ⚠️ فئة عالية القيمة
                        </Badge>
                      )}
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
            <Card className="border-none shadow-sm">
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
          <div className="space-y-6 lg:sticky lg:top-24 h-fit">
            {/* Donor Info */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>معلومات المتبرع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-xl cursor-pointer transition-colors"
                  onClick={() => setProfileModalOpen(true)}
                >
                  <img
                    src={donation.donor.avatar}
                    alt={donation.donor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-lg hover:underline">{donation.donor.name}</p>
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
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>إجراءات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Beneficiary verification status indicator */}
                {renderBeneficiaryStatus()}

                {donation.status === 'متاح' ? (
                  requestDone ? (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-400">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span>تم تقديم طلبك. بانتظار مراجعة الإدارة.</span>
                    </div>
                  ) : (
                    <>
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-white cursor-pointer"
                        size="lg"
                        onClick={handleRequestDonation}
                        disabled={isRequesting || profileLoading}
                      >
                        {isRequesting
                          ? <><Loader2 className="me-2 h-5 w-5 animate-spin" /> جاري التقديم...</>
                          : <><Package className="me-2 h-5 w-5" /> طلب التبرع</>
                        }
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full cursor-pointer"
                        size="lg"
                        onClick={() => {
                          const donorId = (donation.donor as any)?.id || (donation.donor as any)?._id;
                          if (donorId) {
                            setMessageModalOpen(true);
                          } else {
                            navigate('/community');
                            toast.info('يمكنك التواصل مع المتبرع عبر صفحة المجتمع 💬');
                          }
                        }}
                      >
                        <MessageSquare className="me-2 h-5 w-5" />
                        تواصل مع المتبرع
                      </Button>
                    </>
                  )
                ) : (
                  <Button variant="secondary" className="w-full" size="lg" disabled>
                    <CheckCircle className="me-2 h-5 w-5" />
                    {donation.status}
                  </Button>
                )}
                <Button variant="outline" className="w-full" onClick={handleShare}>
                  <Share2 className="me-2 h-5 w-5" />
                  مشاركة
                </Button>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-none shadow-sm">
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
    </div>

      {/* Beneficiary Verification Modal */}
      <BeneficiaryVerificationModal
        open={verificationModalOpen}
        onOpenChange={setVerificationModalOpen}
        rejectionReason={beneficiaryProfile?.verification_rejection_reason}
        onSuccess={() => {
          fetchProfile(); // Refresh profile after successful submission
        }}
      />

      {/* Donor Profile Modal */}
      {donation && (
        <BeneficiaryProfileModal
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          user={{
            id: (donation.donor as any).id || (donation.donor as any)._id || '1',
            name: donation.donor.name,
            avatar: donation.donor.avatar,
            role: 'user'
          }}
          initialShowMsgInput={false}
          contextPostId={donation.id}
        />
      )}

      {/* Message Modal */}
      <Dialog open={messageModalOpen} onOpenChange={setMessageModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>التواصل مع المتبرع</DialogTitle>
            <DialogDescription>اكتب رسالتك الأولى للمتبرع لبدء المحادثة.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Textarea
              placeholder="السلام عليكم، أود الاستفسار بخصوص هذا التبرع..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={handleSendMessageRequest} disabled={isSendingMessage || !messageText.trim()} className="w-full">
                {isSendingMessage ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <MessageSquare className="me-2 h-4 w-4" />}
                إرسال الطلب
              </Button>
              <Button variant="outline" onClick={() => setMessageModalOpen(false)} className="w-full">
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}