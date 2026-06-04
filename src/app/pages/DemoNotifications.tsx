import { NotificationCenter } from '../components/notifications/NotificationCenter';
import { useRealtimeNotifications } from '../components/notifications/NotificationToast';

export function DemoNotifications() {
  useRealtimeNotifications();

  return (
    <div className="min-h-screen bg-muted/20 py-10">
      <div className="container mx-auto px-4 max-w-4xl text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">عرض تجريبي لنظام الإشعارات</h1>
        <p className="text-muted-foreground">انتظر بضع ثوانٍ لتلقي إشعارات فورية مع الأصوات...</p>
      </div>
      <NotificationCenter />
    </div>
  );
}
