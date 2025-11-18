"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  subscribeToNotifications,
  subscribeToUnreadCount,
  markRead,
  markAllRead,
  getNotificationText,
  getNotificationIcon,
  type Notification,
} from "@/lib/notifications";

interface NotificationsBellProps {
  currentUser: any; // Firebase User object
}

export default function NotificationsBell({ currentUser }: NotificationsBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Subscribe to unread count
  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    const unsubscribe = subscribeToUnreadCount((count) => {
      setUnreadCount(count);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Subscribe to notifications when dropdown is open
  useEffect(() => {
    if (!currentUser || !isOpen) {
      setNotifications([]);
      setLoading(true);
      return;
    }

    const unsubscribe = subscribeToNotifications((notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      try {
        await markRead(notification.id);
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    }

    // Navigate to post
    setIsOpen(false);
    router.push(`/feed#post-${notification.postId}`);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllRead();
    } catch (err) {
      console.error("Error marking all as read:", err);
      alert("Failed to mark all as read");
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/15 hover:border-white/30 transition-all duration-300 hover:scale-105"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {/* Bell Icon */}
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 ring-2 ring-white/20 shadow-lg">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 max-h-[32rem] overflow-hidden bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] shadow-2xl shadow-black/20 z-50 flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white font-bold text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-white/70 hover:text-white transition-colors font-medium px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20"
                aria-label="Mark all as read"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto divide-y divide-white/10">
            {loading ? (
              // Skeleton Loading State
              <div className="px-5 py-8 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 animate-pulse">
                    <div className="w-9 h-9 bg-white/20 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/20 rounded w-3/4"></div>
                      <div className="h-3 bg-white/20 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              // Empty State
              <div className="px-5 py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🔔</span>
                </div>
                <p className="text-white/90 font-semibold mb-2">No notifications yet</p>
                <p className="text-white/60 text-sm">
                  When someone likes or comments on your posts, you'll see it here
                </p>
              </div>
            ) : (
              // Notification Items
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full px-5 py-4 text-left hover:bg-white/10 transition-colors ${
                    !notification.read ? "bg-white/5" : ""
                  }`}
                  aria-label={`Notification: ${getNotificationText(notification)}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <span className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-relaxed ${
                          !notification.read
                            ? "text-white font-semibold"
                            : "text-white/80"
                        }`}
                      >
                        {getNotificationText(notification)}
                      </p>
                      <p className="text-xs text-white/50 mt-1.5">
                        {notification.createdAt
                          ? formatDistanceToNow(notification.createdAt.toDate(), {
                              addSuffix: true,
                            })
                          : "just now"}
                      </p>
                    </div>

                    {/* Unread Indicator */}
                    {!notification.read && (
                      <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex-shrink-0 mt-2 shadow-lg shadow-purple-500/50"></span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
