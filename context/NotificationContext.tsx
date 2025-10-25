import React, { createContext, useState, useCallback, ReactNode } from 'react';

type NotificationType = 'info' | 'success' | 'error';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  addNotification: (message: string, type?: NotificationType) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> & {
  _notifications?: Notification[];
  _setNotifications?: React.Dispatch<React.SetStateAction<Notification[]>>;
} = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Expose state for the container to consume
  NotificationProvider._notifications = notifications;
  NotificationProvider._setNotifications = setNotifications;

  const addNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000); // Auto-dismiss after 5 seconds
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
