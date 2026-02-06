import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, MessageSquare, User, Info, Heart } from 'lucide-react';
import { useNotificationStore } from '../store/notifications';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { cs } from 'date-fns/locale';

export function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotificationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'subscribe': return <User className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    // Navigate logic here if needed
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Upozornění"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 min-w-[1rem] px-1 bg-red-600 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh] flex flex-col">
          <div className="p-3 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
            <h3 className="font-semibold text-gray-900">Upozornění</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead()}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Check className="h-3 w-3" />
                Označit vše jako přečtené
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Žádná upozornění</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={cn(
                      "p-3 hover:bg-gray-50 transition-colors flex gap-3 group relative",
                      !notification.isRead && "bg-blue-50/50"
                    )}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center bg-white border shadow-sm",
                        !notification.isRead ? "border-blue-100" : "border-gray-100"
                      )}>
                        {getIcon(notification.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm text-gray-900 line-clamp-2", !notification.isRead && "font-medium")}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: cs })}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.isRead && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                          className="p-1 hover:bg-blue-100 rounded-full text-blue-600"
                          title="Označit jako přečtené"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeNotification(notification.id); }}
                        className="p-1 hover:bg-red-100 rounded-full text-red-600"
                        title="Odstranit"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    
                    {!notification.isRead && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full md:hidden" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
