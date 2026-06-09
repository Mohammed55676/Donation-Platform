/**
 * TODO: This notification system is currently MOCK-ONLY and NOT connected to the backend API.
 * Future integration required to fetch and update actual notifications from the server.
 */
import { useState, useEffect } from 'react';
import { Bell, Check, Package, Heart, MessageSquare, Star, X, MoreHorizontal, Settings, Archive, Trash2 } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface Notification {
  id: string;
  type: 'request' | 'accept' | 'message' | 'rating' | 'delivered' | 'reminder' | 'system';
  title: string;
  message: string;
  time: string;
  timestamp: Date;
  read: boolean;
  archived: boolean;
  priority: 'low' | 'medium' | 'high';
  donationId?: string;
  actionable?: boolean;
}

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

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'request',
      title: 'طلب جديد عاجل',
      message: 'محمد يوسف طلب التبرع: ملابس شتوية للأطفال - الحالة طارئة',
      time: 'منذ 5 دقائق',
      timestamp: new Date(Date.now() - 5 * 60000),
      read: false,
      archived: false,
      priority: 'high',
      donationId: '1',
      actionable: true,
    },
    {
      id: '2',
      type: 'accept',
      title: 'تم قبول طلبك',
      message: 'تم قبول طلبك للحصول على: كتب دراسية ومراجع',
      time: 'منذ ساعة',
      timestamp: new Date(Date.now() - 60 * 60000),
      read: false,
      archived: false,
      priority: 'medium',
      donationId: '2',
      actionable: true,
    },
    {
      id: '3',
      type: 'message',
      title: 'رسالة جديدة',
      message: 'أحمد محمد أرسل لك رسالة حول التبرع',
      time: 'منذ ساعتين',
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      read: false,
      archived: false,
      priority: 'medium',
      actionable: true,
    },
    {
      id: '4',
      type: 'delivered',
      title: 'تم التسليم',
      message: 'تم تسليم التبرع: أثاث منزلي بنجاح',
      time: 'منذ يوم',
      timestamp: new Date(Date.now() - 24 * 60 * 60000),
      read: true,
      archived: false,
      priority: 'low',
      donationId: '3',
    },
    {
      id: '5',
      type: 'rating',
      title: 'تقييم جديد',
      message: 'فاطمة علي قيمتك بـ 5 نجوم على تبرعك الأخير',
      time: 'منذ يومين',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60000),
      read: true,
      archived: false,
      priority: 'low',
    },
    {
      id: '6',
      type: 'reminder',
      title: 'تذكير',
      message: 'لديك موعد لتسليم تبرع اليوم الساعة 3 عصراً',
      time: 'منذ 3 ساعات',
      timestamp: new Date(Date.now() - 3 * 60 * 60000),
      read: false,
      archived: false,
      priority: 'high',
      actionable: true,
    },
    {
      id: '7',
      type: 'system',
      title: 'تحديث النظام',
      message: 'تم إضافة ميزات جديدة للمنصة، تحقق منها الآن',
      time: 'منذ أسبوع',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60000),
      read: true,
      archived: false,
      priority: 'low',
    },
  ]);

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

  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('notification_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('notification_settings', JSON.stringify(settings));
  }, [settings]);

  const [activeTab, setActiveTab] = useState('all');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;
  const archivedCount = notifications.filter(n => n.archived).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read && !n.archived;
    if (activeTab === 'archived') return n.archived;
    if (activeTab === 'all') return !n.archived;
    return !n.archived && n.type === activeTab;
  });

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const archiveNotification = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, archived: true, read: true } : n
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const deleteAllRead = () => {
    setNotifications(notifications.filter(n => !n.read));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'request':
        return <Package className="h-4 w-4" />;
      case 'accept':
        return <Check className="h-4 w-4" />;
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'rating':
        return <Star className="h-4 w-4" />;
      case 'delivered':
        return <Heart className="h-4 w-4" />;
      case 'reminder':
        return <Bell className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'request':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'accept':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'message':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'rating':
        return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'delivered':
        return 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400';
      case 'reminder':
        return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
      case 'system':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'high') {
      return <Badge variant="destructive" className="text-xs">عاجل</Badge>;
    }
    return null;
  };

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
                  {unreadCount > 0 ? `لديك ${unreadCount} إشعار غير مقروء` : 'جميع الإشعارات مقروءة'}
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
                    <DialogDescription>
                      تحكم في كيفية تلقي الإشعارات
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm">طرق التنبيه</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sound">الصوت</Label>
                          <Switch
                            id="sound"
                            checked={settings.soundEnabled}
                            onCheckedChange={(checked) => setSettings({ ...settings, soundEnabled: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="push">إشعارات الدفع</Label>
                          <Switch
                            id="push"
                            checked={settings.pushEnabled}
                            onCheckedChange={(checked) => setSettings({ ...settings, pushEnabled: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email">البريد الإلكتروني</Label>
                          <Switch
                            id="email"
                            checked={settings.emailEnabled}
                            onCheckedChange={(checked) => setSettings({ ...settings, emailEnabled: checked })}
                          />
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm">أنواع الإشعارات</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="request">طلبات التبرعات</Label>
                          <Switch
                            id="request"
                            checked={settings.requestNotif}
                            onCheckedChange={(checked) => setSettings({ ...settings, requestNotif: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="message">الرسائل</Label>
                          <Switch
                            id="message"
                            checked={settings.messageNotif}
                            onCheckedChange={(checked) => setSettings({ ...settings, messageNotif: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="rating">التقييمات</Label>
                          <Switch
                            id="rating"
                            checked={settings.ratingNotif}
                            onCheckedChange={(checked) => setSettings({ ...settings, ratingNotif: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="delivery">التسليم</Label>
                          <Switch
                            id="delivery"
                            checked={settings.deliveryNotif}
                            onCheckedChange={(checked) => setSettings({ ...settings, deliveryNotif: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="system">تحديثات النظام</Label>
                          <Switch
                            id="system"
                            checked={settings.systemNotif}
                            onCheckedChange={(checked) => setSettings({ ...settings, systemNotif: checked })}
                          />
                        </div>
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
                  <Badge variant="destructive" className="mr-2">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="message">الرسائل</TabsTrigger>
              <TabsTrigger value="archived">
                الأرشيف
                {archivedCount > 0 && (
                  <Badge variant="secondary" className="mr-2">
                    {archivedCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <ScrollArea className="h-[600px] pl-4" dir="rtl">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Bell className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                    <p className="text-lg font-semibold mb-2">لا توجد إشعارات</p>
                    <p className="text-sm text-muted-foreground">
                      {activeTab === 'unread' ? 'جميع الإشعارات مقروءة' : 'لا توجد إشعارات في هذا القسم'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {filteredNotifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 100 }}
                          className={`group relative rounded-lg border p-4 transition-all hover:shadow-md ${
                            !notification.read
                              ? 'bg-accent/30 border-primary/30'
                              : 'bg-card border-border'
                          }`}
                        >
                          <div className="flex gap-4">
                            <div className={`p-3 rounded-full h-fit ${getIconColor(notification.type)}`}>
                              {getIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-semibold">{notification.title}</h4>
                                  {getPriorityBadge(notification.priority)}
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
              {filteredNotifications.length > 0 && activeTab !== 'unread' && (
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
