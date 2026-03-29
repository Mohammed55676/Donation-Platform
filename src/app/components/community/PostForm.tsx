import React, { useState } from "react";
import type { NewPostPayload } from "../../context/CommunityContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Upload, Loader2 } from "lucide-react";

type PostFormProps = {
  onSubmit: (payload: NewPostPayload) => void | Promise<void>;
  isSubmitting?: boolean;
};

export const PostForm: React.FC<PostFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Medical");
  const [urgency, setUrgency] = useState("Normal");
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ title, description, category, urgency, image });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">عنوان الطلب</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثال: بحاجة لمساعدة في نقل أثاث"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">التفاصيل</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="اشرح المشكلة أو الطلب بالتفصيل..."
          className="min-h-[120px]"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>التصنيف</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="اختر التصنيف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Medical">طبي</SelectItem>
              <SelectItem value="Food">غذاء</SelectItem>
              <SelectItem value="Housing">سكن ومأوى</SelectItem>
              <SelectItem value="Transport">مواصلات</SelectItem>
              <SelectItem value="Other">أخرى</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>درجة الأهمية</Label>
          <Select value={urgency} onValueChange={setUrgency}>
            <SelectTrigger>
              <SelectValue placeholder="اختر درجة الأهمية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Normal">عادي</SelectItem>
              <SelectItem value="🔥 Urgent">عاجل جداً</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>إرفاق صورة (اختياري)</Label>
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium">{image ? image.name : 'انقر أو اسحب الصورة هنا'}</span>
            {!image && <span className="text-xs text-muted-foreground">PNG, JPG حتى 5MB</span>}
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> جاري النشر...
          </>
        ) : (
          "ارسال الطلب للمجتمع"
        )}
      </Button>
    </form>
  );
};
