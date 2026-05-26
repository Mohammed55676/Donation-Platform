import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import type { Post } from "../../context/CommunityContext";

type Props = {
  open: boolean;
  onClose: () => void;
  post: Post;
  onSave: (updates: Partial<Post>) => Promise<void>;
};

export const EditPostModal: React.FC<Props> = ({ open, onClose, post, onSave }) => {
  const [title, setTitle] = useState(post.title);
  const [description, setDescription] = useState(post.description);
  const [category, setCategory] = useState(post.category);
  const [urgency, setUrgency] = useState(post.urgency);
  const [location, setLocation] = useState(post.location || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) return;
    setSaving(true);
    try {
      await onSave({ title, description, category, urgency, location });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg rounded-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل الطلب</DialogTitle>
          <DialogDescription className="sr-only">تعديل تفاصيل الطلب</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">عنوان الطلب</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان الطلب"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-desc">التفاصيل</Label>
            <Textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اشرح المشكلة أو الطلب..."
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>التصنيف</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="طبي">طبي</SelectItem>
                  <SelectItem value="غذاء">غذاء</SelectItem>
                  <SelectItem value="طعام">طعام</SelectItem>
                  <SelectItem value="ملابس">ملابس</SelectItem>
                  <SelectItem value="أثاث">أثاث</SelectItem>
                  <SelectItem value="أخرى">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>درجة الإلحاح</Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="منخفضة">عادي</SelectItem>
                  <SelectItem value="متوسطة">متوسط</SelectItem>
                  <SelectItem value="عالية">🔥 عاجل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-location">الموقع (اختياري)</Label>
            <Input
              id="edit-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="المدينة أو المنطقة"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 flex-row-reverse">
          <Button onClick={handleSave} disabled={saving || !title.trim() || !description.trim()}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin ms-" /> : null}
            حفظ التعديلات
          </Button>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
