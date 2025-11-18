import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  limit,
  updateDoc,
  writeBatch,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "./firebase";

export interface Notification {
  id: string;
  type: "like" | "comment";
  postId: string;
  actorUid: string;
  actorName?: string;
  text?: string;
  createdAt: Timestamp;
  read: boolean;
  count?: number; // For deduplicated likes
}

/**
 * Subscribe to current user's notifications (real-time)
 * @param callback - Called with array of notifications
 * @param limitCount - Number of notifications to fetch (default: 20)
 * @returns Unsubscribe function
 */
export function subscribeToNotifications(
  callback: (notifications: Notification[]) => void,
  limitCount: number = 20
): () => void {
  const user = auth.currentUser;
  if (!user) {
    callback([]);
    return () => {};
  }

  const notificationsRef = collection(db, "users", user.uid, "notifications");
  const q = query(
    notificationsRef,
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const notifications: Notification[] = [];
      snapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...(doc.data() as Omit<Notification, "id">),
        });
      });
      callback(notifications);
    },
    (error) => {
      console.error("Error listening to notifications:", error);
      callback([]);
    }
  );
}

/**
 * Subscribe to unread notification count (real-time)
 * @param callback - Called with unread count
 * @returns Unsubscribe function
 */
export function subscribeToUnreadCount(
  callback: (count: number) => void
): () => void {
  const user = auth.currentUser;
  if (!user) {
    callback(0);
    return () => {};
  }

  const notificationsRef = collection(db, "users", user.uid, "notifications");
  const q = query(notificationsRef, where("read", "==", false));

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.size);
    },
    (error) => {
      console.error("Error listening to unread count:", error);
      callback(0);
    }
  );
}

/**
 * Mark a single notification as read
 * @param notificationId - The notification document ID
 */
export async function markRead(notificationId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const notifRef = doc(db, "users", user.uid, "notifications", notificationId);
  await updateDoc(notifRef, {
    read: true,
    readAt: serverTimestamp(),
  });

  console.log("✅ Notification marked as read:", notificationId);
}

/**
 * Mark all unread notifications as read (batch update)
 */
export async function markAllRead(): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get all unread notifications
  const notificationsRef = collection(db, "users", user.uid, "notifications");
  const q = query(notificationsRef, where("read", "==", false));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log("No unread notifications to mark");
    return;
  }

  // Batch update all unread notifications
  const batch = writeBatch(db);
  snapshot.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, {
      read: true,
      readAt: serverTimestamp(),
    });
  });

  await batch.commit();
  console.log(`✅ Marked ${snapshot.size} notifications as read`);
}

/**
 * Get notification display text
 * @param notification - The notification object
 * @returns Formatted message string
 */
export function getNotificationText(notification: Notification): string {
  const actorName = notification.actorName || "Someone";

  switch (notification.type) {
    case "like":
      if (notification.count && notification.count > 1) {
        return `${actorName} and ${notification.count - 1} others liked your post`;
      }
      return `${actorName} liked your post`;
    case "comment":
      const preview = notification.text
        ? `: "${notification.text.slice(0, 50)}${notification.text.length > 50 ? "..." : ""}"`
        : "";
      return `${actorName} commented${preview}`;
    default:
      return "New notification";
  }
}

/**
 * Get icon for notification type
 * @param type - Notification type
 * @returns Emoji icon
 */
export function getNotificationIcon(type: Notification["type"]): string {
  switch (type) {
    case "like":
      return "❤️";
    case "comment":
      return "💬";
    default:
      return "🔔";
  }
}
