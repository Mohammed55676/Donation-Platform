import React, { useState } from "react";
import type { NewPostPayload } from "../../context/CommunityContext";
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
import { Upload, Loader2, MapPin } from "lucide-react";

type PostFormProps = {
  onSubmit: (payload: NewPostPayload) => void | Promise<void>;
  isSubmitting?: boolean;
};

export const PostForm: React.FC<PostFormProps> = ({
  onSubmit,
  isSubmitting = false,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("طبي");
  const [urgency, setUrgency] = useState("متوسطة");
  const [location, setLocation] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "عنوان الطلب مطلوب";
    if (!description.trim()) e.description = "التفاصيل مطلوبة";
    return e;
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("طبي");
    setUrgency("متوسطة");
    setLocation("");
    setImagePreview(null);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      urgency,
      location: location.trim() || undefined,
      image: imagePreview,
    });
    resetForm();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">عنوان الطلب <span className="text-destructive">*</span></Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors(p => ({...p, title: ''})); }}
          placeholder="مثال: بحاجة لمساعدة في نقل أثاث"
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">التفاصيل <span className="text-destructive">*</span></Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors(p => ({...p, description: ''})); }}
          placeholder="اشرح المشكلة أو الطلب بالتفصيل..."
          className="min-h-[120px]"
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
      </div>

      {/* Category + Urgency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>التصنيف</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="اختر التصنيف" />
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

        <div className="space-y-2">
          <Label>درجة الإلحاح</Label>
          <Select value={urgency} onValueChange={setUrgency}>
            <SelectTrigger>
              <SelectValue placeholder="اختر درجة الأهمية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="منخفضة">عادي</SelectItem>
              <SelectItem value="متوسطة">متوسط</SelectItem>
              <SelectItem value="عالية">🔥 عاجل</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">الموقع (اختياري)</Label>
        <div className="relative">
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="مثال: عمّان - خلدا"
            className="pe-"
          />
        </div>
      </div>

      {/* Image upload */}
      <div className="space-y-2">
        <Label>إرفاق صورة (اختياري)</Label>
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer relative overflow-hidden group">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          {imagePreview ? (
            <div className="relative w-full h-40">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium">انقر لتغيير الصورة</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">انقر أو اسحب الصورة هنا</span>
              <span className="text-xs text-muted-foreground">PNG, JPG حتى 5MB</span>
            </div>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="me-2 h-5 w-5 animate-spin" />
            جاري النشر...
          </>
        ) : (
          "نشر الطلب في المجتمع"
        )}
      </Button>
    </form>
  );
};
