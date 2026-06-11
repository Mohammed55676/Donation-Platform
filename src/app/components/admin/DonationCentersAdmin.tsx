import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { useDonationCenters } from '../../hooks/useDonationCenters';
import { DonationCenter } from '../../data/donationCenters';
import { Plus, Pencil, Trash2, ShieldCheck, MapPin } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../../components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';

export function DonationCentersAdmin() {
  const { centers, addCenter, updateCenter, deleteCenter } = useDonationCenters();
  const [modalState, setModalState] = useState<{ open: boolean; editing: DonationCenter | null }>({ open: false, editing: null });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const defaultForm = {
    name: '',
    description: '',
    trustedType: 'charity' as DonationCenter['trustedType'],
    isActive: true,
    pickupAvailable: false,
    category: '',
    cities: '',
  };

  const [form, setForm] = useState(defaultForm);

  const openAdd = () => {
    setForm(defaultForm);
    setModalState({ open: true, editing: null });
  };

  const openEdit = (center: DonationCenter) => {
    setForm({
      name: center.name,
      description: center.description,
      trustedType: center.trustedType,
      isActive: center.isActive,
      pickupAvailable: center.pickupAvailable,
      category: center.category.join(', '),
      cities: center.cities.join(', '),
    });
    setModalState({ open: true, editing: center });
  };

  const saveCenter = () => {
    if (!form.name || !form.category || !form.cities) return;
    
    const baseCenter = {
      name: form.name,
      description: form.description,
      trustedType: form.trustedType,
      isActive: form.isActive,
      pickupAvailable: form.pickupAvailable,
      category: form.category.split(',').map(s => s.trim()).filter(Boolean),
      cities: form.cities.split(',').map(s => s.trim()).filter(Boolean),
    };

    if (modalState.editing) {
      updateCenter(modalState.editing.id, baseCenter);
    } else {
      addCenter({
        ...baseCenter,
        id: `center-${Date.now()}`,
        acceptedItems: [],
        branches: [],
        contact: {},
      });
    }
    setModalState({ open: false, editing: null });
  };

  return (
    <Card className="border-none card-shadow rounded-3xl bg-card overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>إدارة مراكز التبرع</CardTitle>
          <CardDescription>إضافة أو تعديل أو تعطيل مراكز التبرع</CardDescription>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> إضافة مركز
        </Button>
      </CardHeader>
      <CardContent>
        {centers.length === 0 && (
          <p className="text-center text-muted-foreground py-8">لا توجد مراكز. يمكنك إضافة مركز جديد.</p>
        )}
        <div className="space-y-4">
          {centers.map(c => (
            <div key={c.id} className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border transition-colors ${!c.isActive ? 'bg-muted/50 opacity-60' : 'bg-background hover:bg-muted/40'}`}>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{c.name}</span>
                  {!c.isActive && <Badge variant="outline" className="text-destructive">معطل</Badge>}
                  {c.trustedType === 'official' && <Badge className="bg-emerald-100 text-emerald-700">جهة رسمية</Badge>}
                  {c.trustedType === 'charity' && <Badge className="bg-blue-100 text-blue-700">جمعية</Badge>}
                  {c.trustedType === 'initiative' && <Badge className="bg-purple-100 text-purple-700">مبادرة</Badge>}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.cities.join(', ')}</span>
                  <span>{c.category.join('، ')}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => openEdit(c)}>
                  <Pencil className="h-3.5 w-3.5" /> تعديل
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(c.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* ── Modal ── */}
      <Dialog open={modalState.open} onOpenChange={(open) => !open && setModalState({ open: false, editing: null })}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalState.editing ? 'تعديل المركز' : 'إضافة مركز جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>اسم الجهة *</Label>
              <Input placeholder="اسم المركز أو الجمعية" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>الوصف</Label>
              <Textarea placeholder="وصف للجهة" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>الفئات (مفصولة بفاصلة) *</Label>
              <Input placeholder="ملابس، أثاث، كتب..." value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>المدن (مفصولة بفاصلة) *</Label>
              <Input placeholder="عمّان، إربد..." value={form.cities} onChange={(e) => setForm(f => ({ ...f, cities: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>نوع الثقة</Label>
              <Select value={form.trustedType} onValueChange={(val: any) => setForm(f => ({ ...f, trustedType: val }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="official">جهة رسمية</SelectItem>
                  <SelectItem value="charity">جمعية موثقة</SelectItem>
                  <SelectItem value="initiative">مبادرة مجتمعية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse justify-between border p-3 rounded-lg">
              <Label className="flex-1">توفير خدمة استلام من المنزل؟</Label>
              <Switch checked={form.pickupAvailable} onCheckedChange={(val) => setForm(f => ({ ...f, pickupAvailable: val }))} />
            </div>
            <div className="flex items-center space-x-2 space-x-reverse justify-between border p-3 rounded-lg">
              <Label className="flex-1">حالة المركز (نشط/معطل)</Label>
              <Switch checked={form.isActive} onCheckedChange={(val) => setForm(f => ({ ...f, isActive: val }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalState({ open: false, editing: null })}>إلغاء</Button>
            <Button onClick={saveCenter} disabled={!form.name || !form.category || !form.cities}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذا المركز؟</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => {
              if (deleteId) { deleteCenter(deleteId); setDeleteId(null); }
            }}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </Card>
  );
}
