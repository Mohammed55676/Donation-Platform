import { useState, useEffect } from 'react';
import {
  Bell, Check, Package, Heart, MessageSquare, Star, X,
  MoreHorizontal, Settings, Archive, Trash2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { motion, AnimatePresence } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from '../ui/dialog';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useNotifications } from '../../context/NotificationContext';

interface NotificationSettings {
  soundEnabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  requestNotif: boolean;
  messageNotif: boolean;
  ratingNotif: boolean;
  deliveryNotif: boolean;
  systemNotif: boolean;
}

const defaultSettings: NotificationSettings = {
  soundEnabled: true,
  pushEnabled: true,
  emailEnabled: false,
  requestNotif: true,
  messageNotif: true,
  ratingNotif: true,
  deliveryNotif: true,
  systemNotif: false,
};

function getIcon(type: string) {
  switch (type) {
    case 'request':   return <Package className="h-4 w-4" />;
    case 'accept':    return <Check className="h-4 w-4" />;
    case 'message':   return <MessageSquare className="h-4 w-4" />;
    case 'rating':    return <Star className="h-4 w-4" />;
    case 'delivered': return <Heart className="h-4 w-4" />;
    case 'reminder':  return <Bell className="h-4 w-4" />;
    case 'system':    return <Settings className="h-4 w-4" />;
    default:          return <Bell className="h-4 w-4" />;
  }
}

function getIconColor(type: string) {
  switch (type) {
    case 'request':   return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    case 'accept':    return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
    case 'message':   return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
    case 'rating':    return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'delivered': return 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400';
    case 'reminder':  return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
    case 'system':    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    default:          return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
}

export function NotificationCenter() {
  // All state lives in context — no local mock data
  const {
    notifications, unreadCount,
    markAsRead, markAllAsRead, archiveNotification,
    deleteNotification, deleteAllRead,
  } = useNotifications();

  const [settings, setSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('notification_settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('notification_settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const [activeTab, setActiveTab] = useState('all');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const archivedCount = notifications.filter(n => n.archived).length;

  const filtered = notifications.filter(n => {
    if (activeTab === 'unread')   return !n.read && !n.archived;
    if (activeTab === 'archived') return n.archived;
    if (activeTab === 'message')  return !n.archived && n.type === 'message';
    return !n.archived; // 'all'
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-6" dir="rtl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>مركز الإشعارات</CardTitle>
                <CardDescription>
                  {unreadCount > 0
                    ? `لديك ${unreadCount} إشعار غير مقروء`
                    : 'جميع الإشعارات مقروءة'}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <Check className="h-4 w-4 ml-2" />
                  تعليم الكل كمقروء
                </Button>
              )}

              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>إعدادات الإشعارات</DialogTitle>
                    <DialogDescription>تحكم في كيفية تلقي الإشعارات</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm">طرق التنبيه</h4>
                      <div className="space-y-3">
                        {([
                          ['sound',  'الصوت',               'soundEnabled'],
                          ['push',   'إشعارات الدفع',        'pushEnabled'],
                          ['email',  'البريد الإلكتروني',    'emailEnabled'],
                        ] as const).map(([id, label, key]) => (
                          <div key={id} className="flex items-center justify-between">
                            <Label htmlFor={id}>{label}</Label>
                            <Switch
                              id={id}
                              checked={settings[key]}
                              onCheckedChange={v => setSettings(s => ({ ...s, [key]: v }))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm">أنواع الإشعارات</h4>
                      <div className="space-y-3">
                        {([
                          ['request-sw', 'طلبات التبرعات', 'requestNotif'],
                          ['message-sw', 'الرسائل',        'messageNotif'],
                          ['rating-sw',  'التقييمات',      'ratingNotif'],
                          ['delivery-sw','التسليم',        'deliveryNotif'],
                          ['system-sw',  'تحديثات النظام', 'systemNotif'],
                        ] as const).map(([id, label, key]) => (
                          <div key={id} className="flex items-center justify-between">
                            <Label htmlFor={id}>{label}</Label>
                            <Switch
                              id={id}
                              checked={settings[key]}
                              onCheckedChange={v => setSettings(s => ({ ...s, [key]: v }))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-4 mb-6">
              <TabsTrigger value="all">
                الكل
                {notifications.filter(n => !n.archived).length > 0 && (
                  <Badge variant="secondary" className="mr-2">
                    {notifications.filter(n => !n.archived).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread">
                غير مقروء
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="mr-2">{unreadCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="message">الرسائل</TabsTrigger>
              <TabsTrigger value="archived">
                الأرشيف
                {archivedCount > 0 && (
                  <Badge variant="secondary" className="mr-2">{archivedCount}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <ScrollArea className="h-[600px] pl-4" dir="rtl">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Bell className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                    <p className="text-lg font-semibold mb-2">لا توجد إشعارات</p>
                    <p className="text-sm text-muted-foreground">
                      {activeTab === 'unread'
                        ? 'جميع الإشعارات مقروءة'
                        : 'لا توجد إشعارات في هذا القسم'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {filtered.map(notification => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 100 }}
                          className={`group relative rounded-lg border p-4 transition-all hover:shadow-md cursor-pointer ${
                            !notification.read
                              ? 'bg-accent/30 border-primary/30'
                              : 'bg-card border-border'
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex gap-4">
                            <div className={`p-3 rounded-full h-fit ${getIconColor(notification.type)}`}>
                              {getIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-semibold">{notification.title}</h4>
                                  {notification.priority === 'high' && (
                                    <Badge variant="destructive" className="text-xs">عاجل</Badge>
                                  )}
                                  {!notification.read && (
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                  )}
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                      onClick={e => e.stopPropagation()}
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {!notification.read && (
                                      <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                        <Check className="h-4 w-4 mr-2" />
                                        تعليم كمقروء
                                      </DropdownMenuItem>
                                    )}
                                    {!notification.archived && (
                                      <DropdownMenuItem onClick={() => archiveNotification(notification.id)}>
                                        <Archive className="h-4 w-4 mr-2" />
                                        أرشفة
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      onClick={() => deleteNotification(notification.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      حذف
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              <p className="text-sm text-muted-foreground">{notification.message}</p>

                              <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">{notification.time}</p>
                                {notification.actionable && (
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm">عرض التفاصيل</Button>
                                    {notification.type === 'request' && (
                                      <Button size="sm">قبول الطلب</Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </ScrollArea>

              {filtered.length > 0 && activeTab !== 'unread' && activeTab !== 'archived' && (
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" size="sm" onClick={deleteAllRead}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    حذف الإشعارات المقروءة
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
