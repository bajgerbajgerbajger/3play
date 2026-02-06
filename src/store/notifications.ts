import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: 'like' | 'comment' | 'subscribe' | 'system';
  link?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    {
      id: '1',
      title: 'Nový odběratel',
      message: 'Uživatel Jan Novák vás začal odebírat',
      isRead: false,
      createdAt: new Date().toISOString(),
      type: 'subscribe'
    },
    {
      id: '2',
      title: 'Nový komentář',
      message: 'Petr napsal komentář k vašemu videu',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      type: 'comment',
      link: '/watch/1'
    },
    {
      id: '3',
      title: 'Systémová zpráva',
      message: 'Vítejte v nové verzi aplikace 3Play!',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      type: 'system'
    }
  ],
  unreadCount: 2,
  
  addNotification: (notification) => set((state) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      isRead: false
    };
    return {
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    };
  }),

  markAsRead: (id) => set((state) => {
    const notification = state.notifications.find(n => n.id === id);
    if (notification && !notification.isRead) {
      return {
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: state.unreadCount - 1
      };
    }
    return state;
  }),

  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
    unreadCount: 0
  })),

  removeNotification: (id) => set((state) => {
    const notification = state.notifications.find(n => n.id === id);
    return {
      notifications: state.notifications.filter(n => n.id !== id),
      unreadCount: notification && !notification.isRead ? state.unreadCount - 1 : state.unreadCount
    };
  })
}));
