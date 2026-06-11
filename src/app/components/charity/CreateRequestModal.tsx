import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';
import api from '../../utils/api';
import { Button } from '../ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateRequestModal({ open, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'أخرى',
    quantityNeeded: '',
    urgency: 'متوسطة',
    location: ''
  });

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.quantityNeeded || !formData.location) {
      toast.error('يرجى تعبئة الحقول المطلوبة');
      return;
    }

    setLoading(true);
    try {
      await api.post('/donation-requests', {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        quantityNeeded: Number(formData.quantityNeeded),
        urgency: formData.urgency,
        location: formData.location
      });
      toast.success('تم إرسال طلب الاحتياج بنجاح بانتظار المراجعة');
      setFormData({ title: '', description: '', category: 'أخرى', quantityNeeded: '', urgency: 'متوسطة', location: '' });
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">طلب احتياجات جديدة</h3>
          <button onClick={onClose} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              عنوان الطلب *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="مثال: بحاجة لبطانيات شتوية"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                الكمية المطلوبة *
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantityNeeded}
                onChange={(e) => setFormData({ ...formData, quantityNeeded: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="مثال: 50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                الفئة
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="ملابس">ملابس</option>
                <option value="طعام">طعام</option>
                <option value="أثاث">أثاث</option>
                <option value="كتب">كتب</option>
                <option value="مستلزمات طبية">مستلزمات طبية</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                الأهمية
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="متوسطة">متوسطة</option>
                <option value="عالية">عالية</option>
                <option value="منخفضة">منخفضة</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                الموقع *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="المحافظة - المنطقة"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              تفاصيل الطلب
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
              placeholder="اشرح لماذا تحتاجون هذه الأشياء..."
              required
            />
          </div>

          <div className="pt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={onClose}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'تقديم الطلب'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
