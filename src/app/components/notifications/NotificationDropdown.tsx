import { Bell, Check, Package, Heart, MessageSquare, Star, X, ArrowLeft, Clock, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { useNotifications } from '../../context/NotificationContext';

function getIcon(type: string) {
  switch (type) {
    case 'request':   return <Package className="h-4 w-4" />;
    case 'accept':    return <Check className="h-4 w-4" />;
    case 'message':   return <MessageSquare className="h-4 w-4" />;
    case 'rating':    return <Star className="h-4 w-4" />;
    case 'delivered': return <Heart className="h-4 w-4" />;
    case 'reminder':  return <Clock className="h-4 w-4" />;
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

export function NotificationDropdown() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  // Show only non-archived in dropdown, latest 20
  const visible = notifications.filter(n => !n.archived).slice(0, 20);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center font-semibold"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <div dir="rtl">
          <div className="flex items-center justify-between p-4">
            <h3 className="font-semibold">الإشعارات</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                onClick={markAllAsRead}
              >
                تعليم الكل كمقروء
              </Button>
            )}
          </div>

          <Separator />

          <ScrollArea className="h-[400px]">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">لا توجد إشعارات</p>
              </div>
            ) : (
              <AnimatePresence>
                {visible.map(notification => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`group p-4 hover:bg-accent/50 transition-colors cursor-pointer border-b border-border/50 ${
                      !notification.read ? 'bg-accent/30' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-full h-fit ${getIconColor(notification.type)}`}>
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0 text-right">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm">{notification.title}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                            onClick={e => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">{notification.time}</p>
                          {!notification.read && (
                            <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-primary text-white">
                              جديد
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </ScrollArea>

          <Separator />
          <div className="p-3">
            <Button
              variant="ghost"
              className="w-full justify-center gap-2"
              onClick={() => navigate('/notifications')}
            >
              عرض جميع الإشعارات
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
