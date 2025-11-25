import { useState, useEffect } from 'react';

/**
 * Safe time formatting hook that prevents hydration mismatches
 * Returns null on server/initial render, then calculates time on client
 */
export function useTimeAgo(timestamp) {
  const [timeAgo, setTimeAgo] = useState(null);

  useEffect(() => {
    if (!timestamp) {
      setTimeAgo("just now");
      return;
    }

    const calculateTimeAgo = () => {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

      if (seconds < 60) return "just now";
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      return `${Math.floor(seconds / 86400)}d ago`;
    };

    setTimeAgo(calculateTimeAgo());

    // Update every minute
    const interval = setInterval(() => {
      setTimeAgo(calculateTimeAgo());
    }, 60000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return timeAgo || "...";
}

/**
 * Safe current time hook that prevents hydration mismatches
 */
export function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState(null);

  useEffect(() => {
    setCurrentTime(Date.now());

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return currentTime;
}
