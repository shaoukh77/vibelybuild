import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";
import { db, auth } from "./firebase";

/**
 * Follows a user
 * @param {string} targetUid - The user to follow
 * @returns {Promise<void>}
 */
export async function followUser(targetUid) {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be authenticated");

  if (user.uid === targetUid) {
    throw new Error("Cannot follow yourself");
  }

  // Add to current user's following list
  await setDoc(
    doc(db, "users", user.uid, "following", targetUid),
    {
      createdAt: serverTimestamp()
    }
  );

  // Add to target user's followers list
  await setDoc(
    doc(db, "users", targetUid, "followers", user.uid),
    {
      createdAt: serverTimestamp()
    }
  );

  console.log("✅ TEST: Followed user", { targetUid });
}

/**
 * Unfollows a user
 * @param {string} targetUid - The user to unfollow
 * @returns {Promise<void>}
 */
export async function unfollowUser(targetUid) {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be authenticated");

  // Remove from current user's following list
  await deleteDoc(doc(db, "users", user.uid, "following", targetUid));

  // Remove from target user's followers list
  await deleteDoc(doc(db, "users", targetUid, "followers", user.uid));

  console.log("✅ TEST: Unfollowed user", { targetUid });
}

/**
 * Checks if current user is following a target user
 * @param {string} targetUid - The user to check
 * @returns {Promise<boolean>}
 */
export async function isFollowing(targetUid) {
  const user = auth.currentUser;
  if (!user) return false;

  if (user.uid === targetUid) return false;

  const followDoc = await getDoc(
    doc(db, "users", user.uid, "following", targetUid)
  );

  return followDoc.exists();
}

/**
 * Listens to the current user's following list in real-time
 * @param {Function} callback - Called with array of user IDs being followed
 * @returns {Function} - Unsubscribe function
 */
export function listenFollowing(callback) {
  const user = auth.currentUser;
  if (!user) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, "users", user.uid, "following"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const following = [];
    snapshot.forEach((doc) => {
      following.push(doc.id);
    });
    callback(following);
  });
}

/**
 * Listens to a user's follower count
 * @param {string} targetUid - The user whose followers to count
 * @param {Function} callback - Called with follower count
 * @returns {Function} - Unsubscribe function
 */
export function listenFollowerCount(targetUid, callback) {
  const followersRef = collection(db, "users", targetUid, "followers");

  return onSnapshot(followersRef, (snapshot) => {
    callback(snapshot.size);
  });
}

/**
 * Listens to a user's following count
 * @param {string} targetUid - The user whose following to count
 * @param {Function} callback - Called with following count
 * @returns {Function} - Unsubscribe function
 */
export function listenFollowingCount(targetUid, callback) {
  const followingRef = collection(db, "users", targetUid, "following");

  return onSnapshot(followingRef, (snapshot) => {
    callback(snapshot.size);
  });
}

/**
 * Listens to whether current user is following a target user
 * @param {string} targetUid - The user to check
 * @param {Function} callback - Called with boolean
 * @returns {Function} - Unsubscribe function
 */
export function listenIsFollowing(targetUid, callback) {
  const user = auth.currentUser;
  if (!user || user.uid === targetUid) {
    callback(false);
    return () => {};
  }

  const followDocRef = doc(db, "users", user.uid, "following", targetUid);

  return onSnapshot(followDocRef, (docSnap) => {
    callback(docSnap.exists());
  });
}
