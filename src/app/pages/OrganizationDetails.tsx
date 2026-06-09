import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  Building, MapPin, Mail, Phone, ArrowLeft, Heart, CreditCard, Users, 
  DollarSign, CheckCircle, ShieldAlert, Award, Calendar 
} from 'lucide-react';
import { toast } from 'sonner';
import { useOrganizations, type Organization } from '../hooks/useOrganizations';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';

export function OrganizationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const { registerAndDonate } = useOrganizations();

  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [amount, setAmount] = useState('10');
  const [phone, setPhone] = useState(user?.phone || '');
  const [nationality, setNationality] = useState('أردني');
  const [message, setMessage] = useState('');
  
  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState(user?.name || '');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/organizations/${id}`);
      setOrg(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error(language === 'ar' ? 'فشل تحميل بيانات المؤسسة' : 'Failed to load organization details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  useEffect(() => {
    if (user) {
      if (!phone) setPhone(user.phone || '');
      if (!nameOnCard) setNameOnCard(user.name || '');
    }
  }, [user]);

  const validate = () => {
    const e: Record<string, string> = {};
    
    if (!phone.trim()) {
      e.phone = language === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone is required';
    } else if (!/^07[789]\d{7}$/.test(phone.trim())) {
      e.phone = language === 'ar' ? 'يجب أن يبدأ بـ 077 أو 078 أو 079 ويتكون من 10 أرقام' : 'Must start with 077, 078 or 079 and be 10 digits';
    }

    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt < 1) {
      e.amount = language === 'ar' ? 'مبلغ التبرع يجب أن يكون 1 دينار على الأقل' : 'Amount must be at least 1 JOD';
    }

    const cardNo = cardNumber.replace(/\s+/g, '');
    if (!cardNo) {
      e.cardNumber = language === 'ar' ? 'رقم البطاقة مطلوب' : 'Card number is required';
    } else if (!/^\d{16}$/.test(cardNo)) {
      e.cardNumber = language === 'ar' ? 'رقم البطاقة يجب أن يتكون من 16 رقماً' : 'Card number must be 16 digits';
    }

    if (!expiry.trim()) {
      e.expiry = language === 'ar' ? 'تاريخ الانتهاء مطلوب' : 'Expiry is required';
    } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiry.trim())) {
      e.expiry = language === 'ar' ? 'الصيغة الصحيحة هي MM/YY' : 'Format must be MM/YY';
    }

    if (!cvv.trim()) {
      e.cvv = language === 'ar' ? 'رمز الأمان مطلوب' : 'CVV is required';
    } else if (!/^\d{3,4}$/.test(cvv.trim())) {
      e.cvv = language === 'ar' ? 'رمز الأمان يجب أن يتكون من 3 أو 4 أرقام' : 'CVV must be 3 or 4 digits';
    }

    if (!nameOnCard.trim()) {
      e.nameOnCard = language === 'ar' ? 'اسم حامل البطاقة مطلوب' : 'Cardholder name is required';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCardNumberChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    // Format card number with spaces every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
    setErrors(prev => ({ ...prev, cardNumber: '' }));
  };

  const handleExpiryChange = (val: string) => {
    let cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length > 2) {
      cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    setExpiry(cleaned);
    setErrors(prev => ({ ...prev, expiry: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error(language === 'ar' ? 'الرجاء تسجيل الدخول أولاً' : 'Please log in first');
      navigate('/login');
      return;
    }
    
    if (!validate() || !org) return;

    setSubmitting(true);
    try {
      const cardNo = cardNumber.replace(/\s+/g, '');
      const updated = await registerAndDonate(org.id, {
        amount: Number(amount),
        cardNumber: cardNo,
        expiry: expiry.trim(),
        cvv: cvv.trim(),
        nameOnCard: nameOnCard.trim(),
        phone: phone.trim(),
        nationality,
        message: message.trim() || undefined
      });

      setOrg(updated);
      toast.success(language === 'ar' ? 'تم الدفع والتسجيل بنجاح! شكراً لك ❤️' : 'Payment and registration successful! Thank you ❤️');
      
      // Reset payment fields
      setCardNumber('');
      setExpiry('');
      setCvv('');
      setMessage('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || (language === 'ar' ? 'فشلت العملية، الرجاء التحقق من البيانات' : 'Operation failed, please check inputs'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Building className="h-12 w-12 text-primary/40 animate-pulse mx-auto" />
          <p className="text-muted-foreground">{language === 'ar' ? 'جاري تحميل التفاصيل...' : 'Loading details...'}</p>
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
          <p className="text-muted-foreground">{language === 'ar' ? 'المؤسسة غير موجودة' : 'Organization not found'}</p>
          <Link to="/organizations">
            <Button variant="outline" className="rounded-xl">
              {language === 'ar' ? 'العودة للمؤسسات' : 'Back to Organizations'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isUserVolunteer = org.volunteers?.some((v: any) => v.id === user?.id || v._id === user?.id);

  return (
    <div className="min-h-screen py-10 bg-muted/20 dark:bg-[#0F1623]/20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Link */}
        <Link to="/organizations" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          {language === 'ar' ? 'العودة لقائمة المؤسسات' : 'Back to list'}
        </Link>

        {/* Organization Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Info Column (60%) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-none shadow-sm rounded-3xl bg-card overflow-hidden">
              {org.image && (
                <div className="h-64 overflow-hidden relative">
                  <img src={org.image} alt={org.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              )}
              
              <CardContent className="p-6 md:p-8 space-y-6 text-start">
                <div>
                  <h1 className="text-3xl font-extrabold mb-3">{org.name}</h1>
                  <Badge className="bg-primary/10 text-primary border-none font-semibold px-3 py-1 flex items-center gap-1 w-fit">
                    <MapPin className="h-3.5 w-3.5" />
                    {org.location}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-lg">{language === 'ar' ? 'حول المؤسسة' : 'About Organization'}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">
                    {org.description}
                  </p>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <h3 className="font-bold text-base">{language === 'ar' ? 'معلومات التواصل' : 'Contact Information'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {org.contactEmail && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4.5 w-4.5 text-primary" />
                        <span className="truncate">{org.contactEmail}</span>
                      </div>
                    )}
                    {org.contactPhone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4.5 w-4.5 text-primary" />
                        <span dir="ltr">{org.contactPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registered Volunteers Card */}
            <Card className="border-none shadow-sm rounded-3xl bg-card overflow-hidden">
              <CardHeader className="pb-2 text-start">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  {language === 'ar' ? 'المتطوعون والمساهمون' : 'Volunteers & Contributors'}
                  <Badge variant="secondary" className="ms-2 font-bold bg-primary/10 text-primary border-none">
                    {org.volunteersCount}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {language === 'ar' ? 'المتطوعون الذين سجلوا لدعم نشاطات هذه المؤسسة' : 'Volunteers registered to support this organization'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {!org.volunteers || org.volunteers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    {language === 'ar' ? 'لا يوجد متطوعون مسجلون بعد. كن أول المتطوعين!' : 'No registered volunteers yet. Be the first to join!'}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {org.volunteers.map((vol: any) => (
                      <div key={vol.id || vol._id} className="flex items-center gap-2.5 p-3 rounded-2xl bg-muted/40 text-start">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={vol.avatar} />
                          <AvatarFallback className="text-xs bg-primary text-white font-bold">
                            {vol.name?.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{vol.name}</p>
                          <Badge variant="outline" className="text-[9px] px-1 py-0 border-primary/20 text-primary">
                            {vol.role === 'volunteer' ? (language === 'ar' ? 'متطوع' : 'Volunteer') : (language === 'ar' ? 'فاعل خير' : 'Donor')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Registration & Donation Column (40%) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Impact Metric Card */}
            <Card className="border-none shadow-sm rounded-3xl bg-gradient-to-br from-[#006c49] to-[#10b981] text-white overflow-hidden relative">
              <div className="absolute top-0 end-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              <CardContent className="p-6 flex items-center justify-between">
                <div className="text-start">
                  <p className="text-xs text-white/70 font-semibold mb-1">
                    {language === 'ar' ? 'إجمالي التبرعات المحققة' : 'Total Donations Secured'}
                  </p>
                  <p className="text-3xl font-black font-display flex items-baseline gap-1">
                    {org.raisedFunds}
                    <span className="text-sm font-semibold">{language === 'ar' ? 'دينار أردني' : 'JOD'}</span>
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner">
                  <DollarSign className="h-7 w-7 text-white" />
                </div>
              </CardContent>
            </Card>

            {/* Registration Form Card */}
            <Card className="border-none shadow-sm rounded-3xl bg-card">
              <CardHeader className="pb-3 text-start">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Heart className="h-5.5 w-5.5 text-primary fill-primary/10" />
                  {language === 'ar' ? 'سجل كمتطوع وتبرع' : 'Register & Donate'}
                </CardTitle>
                <CardDescription>
                  {language === 'ar' 
                    ? 'سجل اهتمامك بالتطوع وادعم المؤسسة بمساهمتك النقدية الفورية.'
                    : 'Sign up to volunteer and support this organization with a monetary donation.'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6">
                {!isAuthenticated ? (
                  <div className="text-center py-8 space-y-4">
                    <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar'
                        ? 'يجب عليك تسجيل الدخول للمشاركة والتبرع للمؤسسة.'
                        : 'You need to be logged in to participate and donate.'}
                    </p>
                    <Button onClick={() => navigate('/login')} className="w-full h-10 rounded-xl font-semibold">
                      {language === 'ar' ? 'تسجيل الدخول' : 'Log In'}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-start">
                    {isUserVolunteer && (
                      <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2 font-medium">
                        <CheckCircle className="h-4.5 w-4.5 flex-shrink-0" />
                        {language === 'ar' ? 'أنت مسجل بالفعل كمتطوع في هذه المؤسسة!' : 'You are already registered as a volunteer!'}
                      </div>
                    )}

                    {/* Basic volunteering fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">{language === 'ar' ? 'الاسم' : 'Name'}</Label>
                        <Input value={user?.name || ''} disabled className="h-9.5 rounded-xl bg-muted" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                        <Input value={user?.email || ''} disabled className="h-9.5 rounded-xl bg-muted" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="org-phone" className="text-xs font-semibold">{language === 'ar' ? 'رقم الهاتف *' : 'Phone *'}</Label>
                        <Input
                          id="org-phone"
                          placeholder="07XXXXXXXX"
                          value={phone}
                          onChange={(e) => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: '' })); }}
                          className={`h-9.5 rounded-xl ${errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        />
                        {errors.phone && <p className="text-[10px] text-destructive">{errors.phone}</p>}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="org-nationality" className="text-xs font-semibold">{language === 'ar' ? 'الجنسية *' : 'Nationality *'}</Label>
                        <select
                          id="org-nationality"
                          value={nationality}
                          onChange={(e) => setNationality(e.target.value)}
                          className="flex h-9.5 w-full rounded-xl border border-input bg-input-background px-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="أردني">{language === 'ar' ? 'أردني' : 'Jordanian'}</option>
                          <option value="فلسطيني">{language === 'ar' ? 'فلسطيني' : 'Palestinian'}</option>
                          <option value="سوري">{language === 'ar' ? 'سوري' : 'Syrian'}</option>
                          <option value="عراقي">{language === 'ar' ? 'عراقي' : 'Iraqi'}</option>
                          <option value="مصري">{language === 'ar' ? 'مصري' : 'Egyptian'}</option>
                          <option value="أخرى">{language === 'ar' ? 'أخرى' : 'Other'}</option>
                        </select>
                      </div>
                    </div>

                    {/* Donation amount */}
                    <div className="space-y-1">
                      <Label htmlFor="org-amount" className="text-xs font-semibold">{language === 'ar' ? 'مبلغ التبرع بالدينار الأردني *' : 'Donation Amount (JOD) *'}</Label>
                      <div className="relative">
                        <DollarSign className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="org-amount"
                          type="number"
                          min="1"
                          placeholder="10"
                          value={amount}
                          onChange={(e) => { setAmount(e.target.value); setErrors(prev => ({ ...prev, amount: '' })); }}
                          className={`ps-9 h-9.5 rounded-xl font-bold ${errors.amount ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        />
                      </div>
                      {errors.amount && <p className="text-[10px] text-destructive">{errors.amount}</p>}
                    </div>

                    {/* Credit Card Details */}
                    <div className="p-4 rounded-2xl bg-muted/40 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground border-b border-border/50 pb-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        {language === 'ar' ? 'بيانات بطاقة الدفع (Visa / MasterCard)' : 'Payment Card Details (Visa / MasterCard)'}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="org-cardholder" className="text-[11px] font-semibold text-muted-foreground">{language === 'ar' ? 'الاسم المكتوب على البطاقة *' : 'Name on Card *'}</Label>
                        <Input
                          id="org-cardholder"
                          placeholder="Name Surname"
                          value={nameOnCard}
                          onChange={(e) => { setNameOnCard(e.target.value); setErrors(prev => ({ ...prev, nameOnCard: '' })); }}
                          className={`h-9 rounded-xl text-xs bg-card ${errors.nameOnCard ? 'border-destructive' : ''}`}
                        />
                        {errors.nameOnCard && <p className="text-[10px] text-destructive">{errors.nameOnCard}</p>}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="org-cardno" className="text-[11px] font-semibold text-muted-foreground">{language === 'ar' ? 'رقم البطاقة *' : 'Card Number *'}</Label>
                        <Input
                          id="org-cardno"
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          className={`h-9 rounded-xl text-xs bg-card tracking-wider ${errors.cardNumber ? 'border-destructive' : ''}`}
                          dir="ltr"
                        />
                        {errors.cardNumber && <p className="text-[10px] text-destructive">{errors.cardNumber}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="org-expiry" className="text-[11px] font-semibold text-muted-foreground">{language === 'ar' ? 'تاريخ الانتهاء *' : 'Expiry Date *'}</Label>
                          <Input
                            id="org-expiry"
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={(e) => handleExpiryChange(e.target.value)}
                            className={`h-9 rounded-xl text-xs bg-card ${errors.expiry ? 'border-destructive' : ''}`}
                            dir="ltr"
                          />
                          {errors.expiry && <p className="text-[10px] text-destructive">{errors.expiry}</p>}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="org-cvv" className="text-[11px] font-semibold text-muted-foreground">{language === 'ar' ? 'رمز الأمان (CVV) *' : 'CVV *'}</Label>
                          <Input
                            id="org-cvv"
                            type="password"
                            placeholder="***"
                            maxLength={4}
                            value={cvv}
                            onChange={(e) => { setCvv(e.target.value.replace(/\D/g, '')); setErrors(prev => ({ ...prev, cvv: '' })); }}
                            className={`h-9 rounded-xl text-xs bg-card ${errors.cvv ? 'border-destructive' : ''}`}
                            dir="ltr"
                          />
                          {errors.cvv && <p className="text-[10px] text-destructive">{errors.cvv}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Volunteering Message */}
                    <div className="space-y-1">
                      <Label htmlFor="org-message" className="text-xs font-semibold">{language === 'ar' ? 'رسالة للمؤسسة (اختياري)' : 'Message to Organization (Optional)'}</Label>
                      <Textarea
                        id="org-message"
                        placeholder={language === 'ar' ? 'اكتب أي ملاحظة أو مجال ترغب بالتطوع فيه...' : 'Write any remarks or specific area you wish to volunteer in...'}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={2}
                        className="rounded-xl text-xs"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={submitting} 
                      className="w-full h-11 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 gap-2 text-sm"
                    >
                      {submitting ? (
                        language === 'ar' ? 'جاري معالجة العملية...' : 'Processing...'
                      ) : (
                        <>
                          <CreditCard className="h-4.5 w-4.5" />
                          {language === 'ar' ? 'تأكيد الدفع والتسجيل' : 'Confirm Payment & Register'}
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
