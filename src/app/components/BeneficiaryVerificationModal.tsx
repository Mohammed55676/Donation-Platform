/**
 * BeneficiaryVerificationModal.tsx
 *
 * Modal for submitting National ID verification.
 * Sends multipart/form-data to POST /api/beneficiary/profile.
 * Used by beneficiaries who haven't verified yet, or those who need to resubmit after rejection.
 */
import { useState, useRef } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2, Upload, FileImage, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../utils/api';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, show rejection reason at the top so user knows why they're resubmitting */
  rejectionReason?: string | null;
  /** Called after successful submission so parent can refresh profile state */
  onSuccess?: () => void;
}

export function BeneficiaryVerificationModal({ open, onOpenChange, rejectionReason, onSuccess }: Props) {
  const [nationalIdNumber, setNationalIdNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ nationalId?: string; file?: string; general?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, file: 'يُرجى رفع صورة بصيغة JPEG أو PNG أو WebP فقط.' }));
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, file: 'حجم الملف يتجاوز الحد المسموح به (3 ميجابايت).' }));
      return;
    }

    setSelectedFile(file);
    setErrors(prev => ({ ...prev, file: undefined }));

    // Show image preview
    const reader = new FileReader();
    reader.onload = () => setFilePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!nationalIdNumber.trim()) e.nationalId = 'رقم الهوية الوطنية مطلوب.';
    else if (nationalIdNumber.trim().length < 9) e.nationalId = 'رقم الهوية يبدو قصيراً جداً.';
    if (!selectedFile) e.file = 'يجب رفع صورة وثيقة الهوية.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append('national_id_number', nationalIdNumber.trim());
      formData.append('national_id_document', selectedFile!);

      await api.post('/beneficiary/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSubmitted(true);
      onSuccess?.();
    } catch (err: any) {
      const message = err.response?.data?.error || 'حدث خطأ أثناء إرسال البيانات. يرجى المحاولة مرة أخرى.';
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      // Reset state when closing
      setNationalIdNumber('');
      setSelectedFile(null);
      setFilePreview(null);
      setErrors({});
      setSubmitted(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {submitted ? '✅ تم إرسال الطلب' : '🪪 التحقق من الهوية الوطنية'}
          </DialogTitle>
          <DialogDescription>
            {submitted
              ? 'سيراجع فريق الإدارة بياناتك في أقرب وقت.'
              : 'للحصول على تبرع، يجب التحقق من هويتك الوطنية أولاً.'}
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          /* ── Success State ── */
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-lg mb-1">تم إرسال طلب التحقق</p>
              <p className="text-muted-foreground text-sm">انتظر مراجعة الإدارة. سيتم إخطارك عند اتخاذ قرار.</p>
            </div>
            <Button onClick={() => handleClose(false)} className="w-full">إغلاق</Button>
          </div>
        ) : (
          /* ── Verification Form ── */
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* Rejection notice */}
            {rejectionReason && (
              <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-red-700 dark:text-red-400 mb-0.5">سبب الرفض السابق:</p>
                  <p className="text-red-600 dark:text-red-300">{rejectionReason}</p>
                </div>
              </div>
            )}

            {/* General error */}
            {errors.general && (
              <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
              </div>
            )}

            {/* National ID Number */}
            <div className="space-y-1">
              <Label htmlFor="national-id-number">رقم الهوية الوطنية *</Label>
              <Input
                id="national-id-number"
                placeholder="أدخل رقم الهوية الوطنية"
                value={nationalIdNumber}
                onChange={(e) => {
                  setNationalIdNumber(e.target.value);
                  setErrors(prev => ({ ...prev, nationalId: undefined }));
                }}
                className={errors.nationalId ? 'border-destructive' : ''}
                dir="ltr"
              />
              {errors.nationalId && <p className="text-xs text-destructive">{errors.nationalId}</p>}
            </div>

            {/* National ID Document */}
            <div className="space-y-2">
              <Label>صورة الهوية الوطنية *</Label>
              <div
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors hover:border-primary/60 ${
                  errors.file ? 'border-destructive' : 'border-border/60'
                } ${filePreview ? 'border-primary/40' : ''}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {filePreview ? (
                  <div className="space-y-2">
                    <img
                      src={filePreview}
                      alt="معاينة الهوية"
                      className="max-h-36 mx-auto rounded-lg object-contain"
                    />
                    <p className="text-xs text-muted-foreground">{selectedFile?.name}</p>
                    <p className="text-xs text-primary underline">انقر لتغيير الصورة</p>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
                      <FileImage className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">ارفع صورة الهوية</p>
                    <p className="text-xs text-muted-foreground">JPEG، PNG، أو WebP — حتى 3 ميجابايت</p>
                    <Button type="button" variant="outline" size="sm" className="gap-2">
                      <Upload className="h-4 w-4" /> اختر ملفاً
                    </Button>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              {errors.file && <p className="text-xs text-destructive">{errors.file}</p>}
            </div>

            <DialogFooter className="gap-2 sm:justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> جاري الإرسال...</> : 'إرسال للمراجعة'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
