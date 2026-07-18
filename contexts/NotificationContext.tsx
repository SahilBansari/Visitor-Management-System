import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export interface Notification {
  id: string;
  title: string;
  time: string;
  date: string;
  isUnread?: boolean;
  type: 'alert' | 'info' | 'success';
  data?: Record<string, any>; // Optional additional data
}

interface NotificationContextType {
  notifications: Notification[];
  recentNotifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    // Sample initial notifications
    { id: '1', title: 'New Visit Request: Ramesh Gupta (Vendor)', time: '2 mins ago', date: 'Today', isUnread: true, type: 'info' },
    { id: '2', title: 'Meeting Alert: "Flood Protocol" starts in 12 mins', time: 'Just now', date: 'Today', isUnread: true, type: 'alert' },
    { id: '3', title: 'Request Approved: In-Person meet with Amit Verma', time: '10 mins ago', date: 'Today', isUnread: true, type: 'success' },
  ]);

  const unreadCount = notifications.filter(n => n.isUnread).length;
  const recentNotifications = notifications.slice(0, 3);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isUnread: false } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isUnread: false }))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        recentNotifications,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
