import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  CreditCard, Smartphone, Building2, CheckCircle2,
  AlertTriangle, Shield, Loader2, X,
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

export interface PaymentCampaignInfo {
  id: string;
  title: string;
  organization: string;
  imageUrl?: string;
  target?: number;
  current?: number;
  charityVerified?: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: PaymentCampaignInfo;
  onSuccess?: (amount: number) => void;
}

type PaymentMethod = 'card' | 'apple_google' | 'bank';
type ModalStep = 'payment' | 'loading' | 'success';

const PRESET_AMOUNTS = [5, 10, 25, 50];

export function CampaignPaymentModal({ open, onOpenChange, campaign, onSuccess }: Props) {
  const [step, setStep] = useState<ModalStep>('payment');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock campaigns (donationCenters.ts) use "camp-" prefix — no real backend call needed
  const isMockCampaign = campaign.id.startsWith('camp-');

  const numericAmount =
    selectedPreset !== null ? selectedPreset :
    customAmount ? (parseFloat(customAmount) || 0) : 0;

  const progressPercent =
    campaign.target && campaign.current !== undefined
      ? Math.min(100, Math.round((campaign.current / campaign.target) * 100))
      : null;

  function fmt4(val: string) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  function fmtExpiry(val: string) {
    const d = val.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (numericAmount <= 0) errs.amount = 'يرجى اختيار أو إدخال مبلغ صحيح';
    if (paymentMethod === 'card') {
      if (!cardHolder.trim()) errs.cardHolder = 'أدخل اسم حامل البطاقة';
      if (cardNumber.replace(/\s/g, '').length < 16) errs.cardNumber = 'رقم البطاقة غير مكتمل';
      if (expiry.length < 5) errs.expiry = 'تاريخ انتهاء غير صحيح';
      if (cvv.length < 3) errs.cvv = 'CVV غير صحيح';
    }
    return errs;
  }

  async function handleDonate() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep('loading');

    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 1500));

    // Call backend for real campaigns only — fail silently since this is a demo
    if (!isMockCampaign) {
      try {
        await api.post(`/campaigns/${campaign.id}/donate`, {
          amount: numericAmount,
          paymentMethod,
          isDemoPayment: true,
        });
      } catch { /* demo works without backend */ }
    }

    setStep('success');
    onSuccess?.(numericAmount);
    toast.success('تم تسجيل تبرعك بنجاح!');
  }

  function reset() {
    setStep('payment');
    setSelectedPreset(null);
    setCustomAmount('');
    setPaymentMethod('card');
    setCardHolder(''); setCardNumber(''); setExpiry(''); setCvv('');
    setErrors({});
  }

  function handleClose() {
    if (step === 'loading') return;
    onOpenChange(false);
    setTimeout(reset, 300);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {/*
        [&>button]:hidden — hides the default shadcn/ui close button so we can
        render our own position-aware close button inside each step.
      */}
      <DialogContent className="max-w-lg w-full p-0 gap-0 rounded-3xl overflow-hidden border-none shadow-2xl flex flex-col max-h-[92vh] [&>button]:hidden">
        <DialogTitle className="sr-only">تبرع للحملة: {campaign.title}</DialogTitle>

        {/* ── Loading Step ── */}
        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-24 px-8 gap-5" dir="rtl">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-foreground">جاري تسجيل تبرعك...</p>
              <p className="text-sm text-muted-foreground mt-1">يرجى الانتظار</p>
            </div>
          </div>
        )}

        {/* ── Success Step ── */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-10 px-8 gap-5 text-center" dir="rtl">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-11 w-11 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-2xl text-foreground mb-1">شكراً لك!</h3>
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold mb-1">تم تسجيل تبرعك بنجاح</p>
              <p className="text-muted-foreground text-sm">
                Thank you! Your donation has been recorded successfully.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 w-full text-sm space-y-2">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground flex-shrink-0">الحملة</span>
                <span className="font-medium text-end truncate">{campaign.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المبلغ</span>
                <span className="font-bold text-primary">{numericAmount} د.أ</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">الحالة</span>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-none text-xs">
                  تم التسجيل
                </Badge>
              </div>
            </div>

            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700/40 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3 me-1" /> دفع تجريبي — لم يُخصم أي مبلغ حقيقي
            </Badge>

            <Button
              onClick={handleClose}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold"
            >
              حسناً
            </Button>
          </div>
        )}

        {/* ── Payment Form Step ── */}
        {step === 'payment' && (
          <>
            {/* Campaign Image Header */}
            <div className="relative flex-shrink-0 h-40">
              {campaign.imageUrl ? (
                <img
                  src={campaign.imageUrl}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-emerald-600/30" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              {/* Demo Badge */}
              <div className="absolute top-3 start-3">
                <Badge className="bg-amber-500 text-white border-none text-xs font-bold shadow">
                  <AlertTriangle className="h-3 w-3 me-1" /> Demo دفع تجريبي
                </Badge>
              </div>

              {/* Custom Close Button */}
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-3 end-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Campaign Info Overlay */}
              <div className="absolute bottom-3 start-4 end-4" dir="rtl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white/75 text-xs">{campaign.organization}</span>
                  {campaign.charityVerified && (
                    <Badge className="bg-emerald-500/80 text-white border-none text-[10px] px-1.5 py-0.5">
                      <Shield className="h-2.5 w-2.5 me-0.5" /> موثق
                    </Badge>
                  )}
                </div>
                <h3 className="text-white font-bold text-base leading-snug">{campaign.title}</h3>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5" dir="rtl">

              {/* Progress Bar — only shown for real campaigns with target/current */}
              {progressPercent !== null && campaign.target != null && (
                <div className="mb-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">جُمع: {campaign.current?.toLocaleString()} د.أ</span>
                    <span className="font-bold text-primary">{progressPercent}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    الهدف: {campaign.target.toLocaleString()} د.أ
                  </p>
                </div>
              )}

              {/* Demo Disclaimer Banner */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl p-3 mb-5 text-center">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  هذه شاشة دفع تجريبية، لن يتم تنفيذ أي عملية دفع حقيقية.
                </p>
                <p className="text-[11px] text-amber-600/70 dark:text-amber-500/70 mt-0.5">
                  This is a demo payment screen. No real payment will be processed.
                </p>
              </div>

              {/* ── Amount Selection ── */}
              <div className="mb-5">
                <Label className="text-sm font-bold mb-3 block">مبلغ التبرع (د.أ)</Label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {PRESET_AMOUNTS.map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        setSelectedPreset(v);
                        setCustomAmount('');
                        setErrors(e => ({ ...e, amount: '' }));
                      }}
                      className={`h-11 rounded-xl font-bold text-sm border-2 transition-all ${
                        selectedPreset === v
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-slate-50 dark:bg-slate-800 text-foreground hover:border-primary/50'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  placeholder="مبلغ مخصص..."
                  min={1}
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedPreset(null);
                    setErrors(err => ({ ...err, amount: '' }));
                  }}
                  className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-border/60 text-center font-bold"
                />
                {errors.amount && (
                  <p className="text-rose-500 text-xs mt-1">{errors.amount}</p>
                )}
              </div>

              {/* ── Payment Method ── */}
              <div className="mb-5">
                <Label className="text-sm font-bold mb-3 block">طريقة الدفع</Label>
                <div className="space-y-2">
                  {([
                    { value: 'card',         Icon: CreditCard,  label: 'بطاقة ائتمانية / مدى',   desc: 'Visa · Mastercard · مدى' },
                    { value: 'apple_google', Icon: Smartphone,  label: 'Apple Pay / Google Pay', desc: 'ادفع بلمسة واحدة' },
                    { value: 'bank',         Icon: Building2,   label: 'تحويل بنكي',              desc: 'تحويل مصرفي مباشر' },
                  ] as const).map(({ value, Icon, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPaymentMethod(value)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-right ${
                        paymentMethod === value
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-slate-50 dark:bg-slate-800 hover:border-primary/40'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        paymentMethod === value
                          ? 'bg-primary text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
                        paymentMethod === value ? 'border-primary bg-primary' : 'border-slate-300'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Card Fields ── */}
              {paymentMethod === 'card' && (
                <div className="mb-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-1 block">
                      اسم حامل البطاقة
                    </Label>
                    <Input
                      placeholder="الاسم كما هو على البطاقة"
                      value={cardHolder}
                      onChange={(e) => {
                        setCardHolder(e.target.value);
                        setErrors(err => ({ ...err, cardHolder: '' }));
                      }}
                      className="h-10 rounded-lg bg-white dark:bg-[#1A2332] border-border/60"
                    />
                    {errors.cardHolder && (
                      <p className="text-rose-500 text-[11px] mt-0.5">{errors.cardHolder}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-1 block">
                      رقم البطاقة
                    </Label>
                    <Input
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => {
                        setCardNumber(fmt4(e.target.value));
                        setErrors(err => ({ ...err, cardNumber: '' }));
                      }}
                      maxLength={19}
                      dir="ltr"
                      className="h-10 rounded-lg bg-white dark:bg-[#1A2332] border-border/60 tracking-widest"
                    />
                    {errors.cardNumber && (
                      <p className="text-rose-500 text-[11px] mt-0.5">{errors.cardNumber}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-1 block">
                        تاريخ الانتهاء
                      </Label>
                      <Input
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => {
                          setExpiry(fmtExpiry(e.target.value));
                          setErrors(err => ({ ...err, expiry: '' }));
                        }}
                        maxLength={5}
                        dir="ltr"
                        className="h-10 rounded-lg bg-white dark:bg-[#1A2332] border-border/60"
                      />
                      {errors.expiry && (
                        <p className="text-rose-500 text-[11px] mt-0.5">{errors.expiry}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-1 block">
                        CVV
                      </Label>
                      <Input
                        placeholder="•••"
                        type="password"
                        value={cvv}
                        onChange={(e) => {
                          setCvv(e.target.value.replace(/\D/g, '').slice(0, 4));
                          setErrors(err => ({ ...err, cvv: '' }));
                        }}
                        maxLength={4}
                        dir="ltr"
                        className="h-10 rounded-lg bg-white dark:bg-[#1A2332] border-border/60"
                      />
                      {errors.cvv && (
                        <p className="text-rose-500 text-[11px] mt-0.5">{errors.cvv}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Apple/Google Pay Placeholder ── */}
              {paymentMethod === 'apple_google' && (
                <div className="mb-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-center">
                  <Smartphone className="h-10 w-10 text-primary mx-auto mb-3" />
                  <p className="font-semibold text-foreground text-sm">استخدم بصمتك أو Face ID</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    سيتم تأكيد الدفع تلقائياً عند الضغط على زر التبرع
                  </p>
                </div>
              )}

              {/* ── Bank Transfer Placeholder ── */}
              {paymentMethod === 'bank' && (
                <div className="mb-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-sm space-y-2">
                  <p className="font-semibold text-center text-foreground mb-3">
                    بيانات التحويل البنكي (تجريبي)
                  </p>
                  {([
                    ['اسم البنك',    'بنك الأردن (تجريبي)'],
                    ['رقم الحساب',  'JO94 CBJO 0010 0000 0000 0131 0003 02'],
                    ['اسم الحساب',  'منصة الخير للتبرعات'],
                  ] as const).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2 items-start">
                      <span className="text-muted-foreground flex-shrink-0">{k}</span>
                      <span className="font-medium text-end" dir="ltr">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Donate Button ── */}
              <Button
                onClick={handleDonate}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 text-white font-bold text-base shadow-lg shadow-primary/25"
              >
                {numericAmount > 0 ? `تبرع الآن بـ ${numericAmount} د.أ` : 'تبرع الآن'}
              </Button>

              <p className="text-center text-[11px] text-muted-foreground mt-3 flex items-center justify-center gap-1">
                <Shield className="h-3 w-3" />
                هذا تطبيق تجريبي — لا يتم تخزين أي بيانات بطاقة
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
