import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: 'request' | 'accept' | 'message' | 'rating' | 'delivered' | 'success';
  title: string;
  message: string;
  time: string;
  read: boolean;
  donationId?: string;
}

interface NotificationContextProps {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'request',
      title: 'طلب جديد',
      message: 'محمد يوسف طلب التبرع: ملابس شتوية للأطفال',
      time: 'منذ 5 دقائق',
      read: false,
      donationId: '1',
    },
    {
      id: '2',
      type: 'accept',
      title: 'تم قبول طلبك',
      message: 'تم قبول طلبك للحصول على: كتب دراسية ومراجع',
      time: 'منذ ساعة',
      read: false,
      donationId: '2',
    },
    {
      id: '4',
      type: 'delivered',
      title: 'تم التسليم',
      message: 'تم تسليم التبرع: أثاث منزلي',
      time: 'منذ يوم',
      read: true,
      donationId: '3',
    }
  ]);

  const addNotification = (notif: Omit<Notification, 'id' | 'time' | 'read'>) => {
    const newNotif: Notification = {
      ...notif,
      id: Date.now().toString(),
      time: 'الآن',
      read: false,
    };
    
    setNotifications(prev => [newNotif, ...prev]);
    
    // Push-style notification using sonner toast
    toast(notif.title, {
      description: notif.message,
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, markAllAsRead, deleteNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
