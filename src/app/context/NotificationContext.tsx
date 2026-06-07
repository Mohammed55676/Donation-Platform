import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: 'request' | 'accept' | 'message' | 'rating' | 'delivered' | 'reminder' | 'system' | 'success';
  title: string;
  message: string;
  time: string;
  timestamp: string; // ISO date string — used for accurate relative time
  read: boolean;
  archived: boolean;
  priority: 'low' | 'medium' | 'high';
  donationId?: string;
  actionable?: boolean;
}

interface NotificationContextProps {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, 'id' | 'time' | 'timestamp' | 'read' | 'archived'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  archiveNotification: (id: string) => void;
  deleteNotification: (id: string) => void;
  deleteAllRead: () => void;
}

const STORAGE_KEY = 'app_notifications';

function relativeTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} دق`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `منذ ${days} يوم`;
  return `منذ أسبوع+`;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed: Notification[] = JSON.parse(saved);
      // Refresh relative time strings on load
      return parsed.map(n => ({ ...n, time: relativeTime(n.timestamp) }));
    } catch {
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Refresh relative time strings every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setNotifications(prev =>
        prev.map(n => ({ ...n, time: relativeTime(n.timestamp) }))
      );
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;

  const addNotification = (notif: Omit<Notification, 'id' | 'time' | 'timestamp' | 'read' | 'archived'>) => {
    const timestamp = new Date().toISOString();
    const newNotif: Notification = {
      ...notif,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      time: 'الآن',
      timestamp,
      read: false,
      archived: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
    toast(notif.title, { description: notif.message });
  };

  const markAsRead = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const markAllAsRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const archiveNotification = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, archived: true, read: true } : n));

  const deleteNotification = (id: string) =>
    setNotifications(prev => prev.filter(n => n.id !== id));

  const deleteAllRead = () =>
    setNotifications(prev => prev.filter(n => !n.read));

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount,
      addNotification, markAsRead, markAllAsRead,
      archiveNotification, deleteNotification, deleteAllRead,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
};
