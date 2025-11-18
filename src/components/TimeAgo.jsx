"use client";
import { useTimeAgo } from "@/lib/useTimeAgo";

/**
 * Safe TimeAgo component that prevents hydration mismatches
 * Uses suppressHydrationWarning since server/client times legitimately differ
 */
export default function TimeAgo({ timestamp, className = "", prefix = "" }) {
  const timeAgo = useTimeAgo(timestamp);

  return (
    <span className={className} suppressHydrationWarning>
      {prefix}{timeAgo}
    </span>
  );
}
