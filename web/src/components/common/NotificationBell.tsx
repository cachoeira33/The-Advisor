import React, { useState, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useClickOutside } from '../../hooks/useClickOutside'; // Você precisará deste hook
import { Notification } from '../../hooks/useNotifications'; // Importe a interface

interface NotificationBellProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClear: (id: string) => void;
  className?: string;
}

export function NotificationBell({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClear,
  className = '',
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);
  useClickOutside(bellRef, () => setIsOpen(false));

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div ref={bellRef} className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge variant="error" className="absolute top-0 right-0 -mt-1 -mr-1 px-1.5 py-0.5 !text-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50"
          >
            <div className="p-3 border-b flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Button variant="link" size="sm" onClick={onMarkAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-center text-gray-500 p-8">No notifications</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`p-3 border-b ${!n.read ? 'bg-primary-50' : ''}`}>
                    <p className="font-semibold text-sm">{n.title}</p>
                    <p className="text-xs text-gray-600">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}