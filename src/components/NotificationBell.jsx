"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  listenNotifications,
  listenUnreadCount,
  markAsRead,
  markAllAsRead,
  getNotificationMessage,
  getNotificationLink
} from "@/lib/notifs";
import { formatDistanceToNow } from "date-fns";

export default function NotificationBell({ currentUser }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Listen to unread count
  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    const unsubscribe = listenUnreadCount((count) => {
      setUnreadCount(count);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Listen to notifications when dropdown is open
  useEffect(() => {
    if (!currentUser || !isOpen) {
      setNotifications([]);
      setLoading(true);
      return;
    }

    const unsubscribe = listenNotifications((notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      try {
        await markAsRead(notification.id);
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    }

    // Navigate to linked page
    const link = getNotificationLink(notification);
    setIsOpen(false);
    router.push(link);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      console.log("✅ All notifications marked as read");
    } catch (err) {
      console.error("Error marking all as read:", err);
      alert("Failed to mark all as read");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return "❤️";
      case "comment":
        return "💬";
      case "follow":
        return "👤";
      default:
        return "🔔";
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {/* Bell Icon */}
        <svg
          className="w-6 h-6 text-white"
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
          <span className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-96 overflow-y-auto bg-gradient-to-br from-purple-900/95 via-purple-900/95 to-blue-900/95 border border-white/20 backdrop-blur-md rounded-xl shadow-2xl z-50">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-900 to-blue-900 px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-white/70 hover:text-white transition-colors"
                aria-label="Mark all as read"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-white/10">
            {loading ? (
              <div className="px-4 py-8 text-center text-white/70">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-white/70 mb-2">No notifications yet</p>
                <p className="text-white/50 text-sm">
                  When someone likes or comments on your posts, you'll see it here
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors ${
                    !notification.read ? "bg-white/5" : ""
                  }`}
                  aria-label={`Notification: ${getNotificationMessage(notification)}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <span className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.read ? "text-white font-semibold" : "text-white/80"}`}>
                        {getNotificationMessage(notification)}
                      </p>
                      <p className="text-xs text-white/50 mt-1">
                        {notification.createdAt
                          ? formatDistanceToNow(notification.createdAt.toDate(), {
                              addSuffix: true,
                            })
                          : "just now"}
                      </p>
                    </div>

                    {/* Unread Indicator */}
                    {!notification.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
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
