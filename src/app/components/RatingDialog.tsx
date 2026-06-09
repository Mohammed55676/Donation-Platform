/**
 * RatingDialog.tsx
 *
 * Mutual rating dialog for completed donations.
 * Submits to POST /api/ratings.
 */
import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

const RATING_TAGS = ['ملتزم', 'محترم', 'تواصل واضح', 'تم التسليم بنجاح'];

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  donationId: string;
  rateeId: string;
  onRated?: () => void;
}

export function RatingDialog({ open, onOpenChange, userName, donationId, rateeId, onRated }: RatingDialogProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('الرجاء اختيار تقييم');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/ratings', {
        donation_id: donationId,
        ratee_id: rateeId,
        stars: rating,
        comment: review.trim() || null,
        tags: selectedTags,
      });
      toast.success('تم إرسال التقييم بنجاح!');
      onOpenChange(false);
      setRating(0);
      setReview('');
      setSelectedTags([]);
      onRated?.();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'حدث خطأ أثناء إرسال التقييم.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تقييم {userName}</DialogTitle>
          <DialogDescription>
            شارك تجربتك بعد إتمام التبرع
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>التقييم</Label>
              <div className="flex gap-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="transition-transform hover:scale-110"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= (hover || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  {rating === 5 ? 'ممتاز!' : rating === 4 ? 'جيد جداً' : rating === 3 ? 'جيد' : rating === 2 ? 'مقبول' : 'ضعيف'}
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="grid gap-2">
              <Label>وسوم (اختياري)</Label>
              <div className="flex flex-wrap gap-2 justify-center">
                {RATING_TAGS.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all text-sm px-3 py-1.5 ${
                      selectedTags.includes(tag)
                        ? 'bg-primary hover:bg-primary/90 text-white'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="review">التعليق (اختياري)</Label>
              <Textarea
                id="review"
                placeholder="اكتب تعليقك هنا..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="min-h-[100px]"
                maxLength={500}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-yellow-500 hover:bg-yellow-600 gap-2">
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> جاري الإرسال...</> : 'إرسال التقييم'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
