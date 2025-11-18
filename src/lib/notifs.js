import {
  collection,
  doc,
  updateDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";
import { db, auth } from "./firebase";

/**
 * Listens to notifications for the current user
 * @param {Function} callback - Called with array of notifications
 * @param {number} limitCount - Number of notifications to fetch (default: 20)
 * @returns {Function} - Unsubscribe function
 */
export function listenNotifications(callback, limitCount = 20) {
  const user = auth.currentUser;
  if (!user) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, "notifications", user.uid, "items"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = [];
    snapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(notifications);
  });
}

/**
 * Listens to unread notification count
 * @param {Function} callback - Called with unread count
 * @returns {Function} - Unsubscribe function
 */
export function listenUnreadCount(callback) {
  const user = auth.currentUser;
  if (!user) {
    callback(0);
    return () => {};
  }

  const q = query(
    collection(db, "notifications", user.uid, "items"),
    where("read", "==", false)
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });
}

/**
 * Marks a single notification as read
 * @param {string} notificationId
 * @returns {Promise<void>}
 */
export async function markAsRead(notificationId) {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be authenticated");

  await updateDoc(
    doc(db, "notifications", user.uid, "items", notificationId),
    {
      read: true,
      readAt: serverTimestamp()
    }
  );

  console.log("✅ Notification marked as read", { notificationId });
}

/**
 * Marks all notifications as read
 * @returns {Promise<void>}
 */
export async function markAllAsRead() {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be authenticated");

  // Get all unread notifications
  const q = query(
    collection(db, "notifications", user.uid, "items"),
    where("read", "==", false)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log("No unread notifications to mark");
    return;
  }

  // Batch update
  const batch = writeBatch(db);

  snapshot.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, {
      read: true,
      readAt: serverTimestamp()
    });
  });

  await batch.commit();

  console.log("✅ All notifications marked as read", { count: snapshot.size });
}

/**
 * Gets a formatted notification message with actor name
 * @param {Object} notification - Notification object
 * @returns {string} - Formatted message
 */
export function getNotificationMessage(notification) {
  // Text already contains the message from Cloud Function
  return notification.text;
}

/**
 * Gets the URL to navigate to when clicking a notification
 * @param {Object} notification - Notification object
 * @returns {string} - URL path
 */
export function getNotificationLink(notification) {
  switch (notification.type) {
    case "like":
    case "comment":
      return `/feed?highlight=${notification.postId}`;
    case "follow":
      return "/feed"; // Could be `/profile/${notification.actorId}` if you have profile pages
    default:
      return "/feed";
  }
}
