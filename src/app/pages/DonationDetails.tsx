import { useParams, Link, useNavigate } from 'react-router';
import { useState, useEffect, useMemo } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import api from '../utils/api';

const HIGH_VALUE_CATEGORIES = ['أثاث', 'مستلزمات طبية', 'أجهزة', 'أجهزة كهربائية', 'إلكترونيات'];

export function DonationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { donations } = useDonations();
  const donation = donations.find(d => d.id === id);
  const { user, toggleWishlist } = useAuth();

  // Donation request state (charity side)
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestDone, setRequestDone] = useState(false);

  // Donor-side: incoming requests for this donation
  const [donorRequests, setDonorRequests] = useState<any[]>([]);
  const [donorRequestsLoading, setDonorRequestsLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  // Message modal state
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Fetch requests for donor view — only when user owns this donation
  const isDonationOwner = user && donation &&
    ((donation.donor as any)?.id === user.id || (donation.donor as any)?._id === user.id);

  useEffect(() => {
    if (!isDonationOwner) return;
    setDonorRequestsLoading(true);
    api.get('/donation-claims/for-donor')
      .then(res => {
        const all: any[] = res.data.data || [];
        setDonorRequests(all.filter(r => r.donation_id?.id === id || r.donation_id?._id === id));
      })
      .catch(() => setDonorRequests([]))
      .finally(() => setDonorRequestsLoading(false));
  }, [isDonationOwner, id]);

  const handleDonorReview = async (requestId: string, action: 'accept' | 'reject') => {
    setReviewingId(requestId);
    try {
      await api.put(`/donation-claims/${requestId}/donor-review`, { action });
      toast.success(action === 'accept' ? 'تم قبول الطلب وحجز التبرع' : 'تم رفض الطلب');
      setDonorRequests(prev => prev.map(r =>
        r.id === requestId ? { ...r, status: action === 'accept' ? 'accepted' : 'rejected' } : r
      ));
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'حدث خطأ');
    } finally {
      setReviewingId(null);
    }
  };

  const isHighValue = useMemo(
    () => donation ? HIGH_VALUE_CATEGORIES.includes(donation.category) : false,
    [donation]
  );

  const handleRequestDonation = async () => {
    // 1. Not logged in
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }

    // 2. Not a charity
    if (user.user_type !== 'charity') {
      toast.error('هذه الميزة للجمعيات الخيرية فقط');
      return;
    }

    // 3. Check admin-based verification
    if (user.charityStatus !== 'verified') {
      if (user.charityStatus === 'pending') {
        toast.info('طلبك قيد مراجعة الإدارة. يرجى الانتظار.');
      } else {
        toast.info('يجب إكمال التحقق من الجمعية أولاً.');
      }
      return;
    }

    // 4. Verified — submit request, donor will approve
    setIsRequesting(true);
    try {
      await api.post('/donation-claims', { donation_id: id });
      toast.success('تم تقديم طلبك! في انتظار موافقة المتبرع.');
      setRequestDone(true);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'حدث خطأ أثناء تقديم الطلب.';
      toast.error(msg);
    } finally {
      setIsRequesting(false);
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

  // Status UI for charity sidebar card
  const renderCharityStatus = () => {
    if (!user || user.user_type !== 'charity') return null;

    const status = user.charityStatus || 'pending';

    if (status === 'pending') return (
      <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
        <Clock className="h-4 w-4 flex-shrink-0" />
        <span>حساب الجمعية قيد مراجعة الإدارة</span>
      </div>
    );
    if (status === 'rejected') return (
      <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
        <XCircle className="h-4 w-4 flex-shrink-0" />
        <span>تم رفض توثيق الجمعية</span>
      </div>
    );
    if (status === 'verified') return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <CheckCircle className="h-4 w-4 flex-shrink-0" />
        <span>جمعية موثقة — يمكنك طلب التبرعات</span>
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
              <ArrowRight className="me-2 h-4 w-4" />
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

            {/* Donor: Incoming Requests Panel */}
            {isDonationOwner && (
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>طلبات الحصول على هذا التبرع</CardTitle>
                    <Badge variant="outline">{donorRequests.filter(r => r.status === 'pending_review').length} معلق</Badge>
                  </div>
                  <CardDescription>الجمعيات الخيرية الموثقة التي طلبت التبرع</CardDescription>
                </CardHeader>
                <CardContent>
                  {donorRequestsLoading ? (
                    <p className="text-sm text-muted-foreground text-center py-4">جاري التحميل...</p>
                  ) : donorRequests.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">لا توجد طلبات بعد</p>
                  ) : (
                    <div className="space-y-3">
                      {donorRequests.map(r => {
                        const charity = r.charity;
                        const isPending = r.status === 'pending_review';
                        return (
                          <div key={r.id} className={`p-4 rounded-xl border text-sm space-y-2 ${isPending ? 'bg-background' : 'bg-muted/40 opacity-70'}`}>
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="font-semibold text-primary">
                                {charity?.charityName || charity?.name || charity?.anonymousCode || 'مستخدم غير معروف'}
                              </span>
                              <Badge className={
                                r.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                                r.status === 'rejected' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                                'bg-amber-100 text-amber-700 dark:bg-amber-900/30'
                              }>
                                {r.status === 'accepted' ? 'مقبول' : r.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-3 text-muted-foreground text-xs">
                              {charity?.city && <span>📍 {charity.city}</span>}
                            </div>
                            {isPending && (
                              <div className="flex gap-2 pt-1">
                                <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white gap-1"
                                  disabled={reviewingId === r.id}
                                  onClick={() => handleDonorReview(r.id, 'accept')}>
                                  <CheckCircle className="h-3.5 w-3.5" /> قبول
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 text-destructive gap-1"
                                  disabled={reviewingId === r.id}
                                  onClick={() => handleDonorReview(r.id, 'reject')}>
                                  <XCircle className="h-3.5 w-3.5" /> رفض
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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
                <div className="flex items-center gap-3 p-2 rounded-xl">
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
                    <p className="text-xs text-muted-foreground">جمعية شريكة</p>
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
                {/* Charity verification status indicator */}
                {renderCharityStatus()}

                {donation.status === 'متاح' ? (
                  requestDone ? (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-400">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span>تم تقديم طلبك. بانتظار موافقة المتبرع.</span>
                    </div>
                  ) : (
                    <>
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-white cursor-pointer"
                        size="lg"
                        onClick={handleRequestDonation}
                        disabled={isRequesting}
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