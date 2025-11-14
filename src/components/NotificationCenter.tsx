'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, X, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { notificationSystem, type Notification } from '@/lib/notifications/system';
import { useRouter } from 'next/navigation';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Load initial notifications
    setNotifications(notificationSystem.getAll());

    // Subscribe to new notifications
    const unsubscribe = notificationSystem.subscribe((notification) => {
      setNotifications(notificationSystem.getAll());
      
      // Show browser notification if permission granted
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icon.png',
        });
      }
    });

    return unsubscribe;
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    notificationSystem.markAsRead(id);
    setNotifications(notificationSystem.getAll());
  };

  const handleMarkAllAsRead = () => {
    notificationSystem.markAllAsRead();
    setNotifications(notificationSystem.getAll());
  };

  const handleClearAll = () => {
    notificationSystem.clearAll();
    setNotifications([]);
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      setIsOpen(false);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-400" />;
      case 'error':
        return <X className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <Bell className="w-5 h-5 text-yellow-400" />;
      case 'info':
      default:
        return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-900/20 border-green-700';
      case 'error':
        return 'bg-red-900/20 border-red-700';
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-700';
      case 'info':
      default:
        return 'bg-blue-900/20 border-blue-700';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-700 rounded-lg transition"
      >
        <Bell className="w-6 h-6 text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 max-h-[600px] bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-900">
              <div>
                <h3 className="text-lg font-bold text-white">Notifications</h3>
                <p className="text-sm text-gray-400">
                  {unreadCount} unread
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAllAsRead}
                  className="p-2 hover:bg-gray-700 rounded transition"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  onClick={handleClearAll}
                  className="p-2 hover:bg-gray-700 rounded transition"
                  title="Clear all"
                >
                  <Trash2 className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No notifications</p>
                    <p className="text-sm text-gray-500 mt-1">
                      You&rsquo;re all caught up!
                    </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-700 transition cursor-pointer ${
                        !notification.read ? 'bg-gray-750' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getBgColor(notification.type)} border`}>
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-white text-sm">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-sm text-gray-300 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.timestamp)}
                            </span>
                            {notification.actionUrl && (
                              <ExternalLink className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

