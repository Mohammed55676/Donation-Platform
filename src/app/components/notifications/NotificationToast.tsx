import { useEffect } from 'react';
import { toast } from 'sonner';
import { Bell, Package, Heart, MessageSquare, Star, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { notificationSound } from '../../utils/notificationSound';

interface NotificationToastProps {
  type: 'request' | 'accept' | 'message' | 'rating' | 'delivered';
  title: string;
  message: string;
  onAction?: () => void;
  onView?: () => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'request':
      return <Package className="h-5 w-5 text-blue-600" />;
    case 'accept':
      return <Check className="h-5 w-5 text-green-600" />;
    case 'message':
      return <MessageSquare className="h-5 w-5 text-purple-600" />;
    case 'rating':
      return <Star className="h-5 w-5 text-yellow-600" />;
    case 'delivered':
      return <Heart className="h-5 w-5 text-pink-600" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
};

export function showNotificationToast({
  type,
  title,
  message,
  onAction,
  onView,
}: NotificationToastProps) {
  // Play sound based on notification type
  if (type === 'message') {
    notificationSound.playMessage();
  } else if (type === 'accept' || type === 'delivered') {
    notificationSound.playSuccess();
  } else {
    notificationSound.play();
  }

  toast.custom(
    (t) => (
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[350px] max-w-md" dir="rtl">
        <div className="flex gap-3">
          <div className="shrink-0 mt-0.5">{getIcon(type)}</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">{title}</h4>
            <p className="text-sm text-muted-foreground mb-3">{message}</p>
            <div className="flex gap-2">
              {onView && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onView();
                    toast.dismiss(t);
                  }}
                  className="h-8 text-xs"
                >
                  عرض
                </Button>
              )}
              {onAction && (
                <Button
                  size="sm"
                  onClick={() => {
                    onAction();
                    toast.dismiss(t);
                  }}
                  className="h-8 text-xs"
                >
                  {type === 'request' ? 'قبول' : 'إجراء'}
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toast.dismiss(t)}
                className="h-8 text-xs mr-auto"
              >
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      duration: 6000,
      position: 'top-center',
    }
  );
}

// Hook to simulate real-time notifications
export function useRealtimeNotifications() {
  useEffect(() => {
    // Simulate receiving a notification after 5 seconds
    const timer1 = setTimeout(() => {
      showNotificationToast({
        type: 'request',
        title: 'طلب جديد',
        message: 'محمد أحمد طلب التبرع: ملابس شتوية للأطفال',
        // TODO: Backend action handlers not implemented yet
      });
    }, 5000);

    // Simulate receiving a message after 15 seconds
    const timer2 = setTimeout(() => {
      showNotificationToast({
        type: 'message',
        title: 'رسالة جديدة',
        message: 'فاطمة علي أرسلت لك رسالة',
        // TODO: Backend view handler not implemented yet
      });
    }, 15000);

    // Simulate receiving a rating after 25 seconds
    const timer3 = setTimeout(() => {
      showNotificationToast({
        type: 'rating',
        title: 'تقييم جديد',
        message: 'أحمد خالد قيمك بـ 5 نجوم',
        // TODO: Backend view handler not implemented yet
      });
    }, 25000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);
}
