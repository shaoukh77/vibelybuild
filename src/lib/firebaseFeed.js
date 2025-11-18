import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  setDoc,
  getCountFromServer
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";
import { db, auth, storage } from "./firebase";

// Constants
const MAX_CONTENT_LENGTH = 1000;
const MIN_CONTENT_LENGTH = 1;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const POSTS_PER_PAGE = 10;
const COMMENTS_PER_PAGE = 10;

/**
 * Validates image file
 * @param {File} file
 * @throws {Error} if validation fails
 */
export function validateImage(file) {
  if (!file) return;

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Only JPG, PNG, and WebP images are allowed");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image must be less than 5MB");
  }
}

/**
 * Uploads an image to Firebase Storage
 * @param {File} file - The image file
 * @param {string} postId - The post ID (for organizing storage)
 * @returns {Promise<string>} - Download URL
 */
export async function uploadPostImage(file, postId) {
  if (!file) return null;

  const user = auth.currentUser;
  if (!user) throw new Error("User must be authenticated");

  validateImage(file);

  // Create unique filename
  const timestamp = Date.now();
  const filename = `posts/${user.uid}/${postId}_${timestamp}.${file.name.split('.').pop()}`;
  const storageRef = ref(storage, filename);

  // Upload file
  await uploadBytes(storageRef, file);

  // Get download URL
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

/**
 * Deletes an image from Firebase Storage
 * @param {string} imageUrl - The full download URL
 */
export async function deletePostImage(imageUrl) {
  if (!imageUrl) return;

  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error("Error deleting image:", error);
    // Don't throw - image might already be deleted
  }
}

/**
 * Creates a new post in the feed
 * @param {Object} postData - { content: string, imageFile?: File }
 * @returns {Promise<string>} - The new post ID
 */
export async function createPost({ content, imageFile }) {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be authenticated");

  // Validate content
  if (!content || content.trim().length < MIN_CONTENT_LENGTH) {
    throw new Error("Post content is required");
  }
  if (content.trim().length > MAX_CONTENT_LENGTH) {
    throw new Error(`Post content must be less than ${MAX_CONTENT_LENGTH} characters`);
  }

  // Validate image if provided
  if (imageFile) {
    validateImage(imageFile);
  }

  // Create post document first
  const postData = {
    userId: user.uid,
    userName: user.displayName || "Anonymous",
    userPhoto: user.photoURL || "",
    content: content.trim(),
    imageUrl: "",
    status: "active",
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, "posts"), postData);

  // Upload image if provided
  if (imageFile) {
    try {
      const imageUrl = await uploadPostImage(imageFile, docRef.id);
      // Update post with image URL
      await setDoc(doc(db, "posts", docRef.id), { ...postData, imageUrl }, { merge: true });
    } catch (error) {
      // If image upload fails, delete the post
      await deleteDoc(doc(db, "posts", docRef.id));
      throw error;
    }
  }

  console.log("✅ TEST: Post created successfully", {
    postId: docRef.id,
    content: content.trim().substring(0, 50) + (content.trim().length > 50 ? "..." : ""),
    hasImage: !!imageFile
  });

  return docRef.id;
}

/**
 * Listens to the feed in real-time with pagination
 * @param {Function} callback - Called with { posts, lastDoc }
 * @param {Object} lastDoc - Last document for pagination (optional)
 * @param {number} limitCount - Number of posts to fetch (default: POSTS_PER_PAGE)
 * @returns {Function} - Unsubscribe function
 */
export function listenFeed(callback, lastDoc = null, limitCount = POSTS_PER_PAGE) {
  let q = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  if (lastDoc) {
    q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(limitCount)
    );
  }

  return onSnapshot(q, (snapshot) => {
    const posts = [];
    snapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });

    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    callback({ posts, lastDoc: lastVisible, hasMore: posts.length === limitCount });
  });
}

/**
 * Listens to the "For You" feed (posts from followed users + own posts)
 *
 * ⚠️ COMPOSITE INDEX REQUIRED:
 * Collection: posts
 * Fields: userId (Array contains), createdAt (Descending)
 *
 * When you see the Firebase console link in the browser error, click it once
 * to auto-create this index.
 *
 * @param {Array<string>} followingList - Array of user IDs being followed
 * @param {string} currentUserId - Current user's ID
 * @param {Function} callback - Called with { posts, lastDoc, hasMore }
 * @param {Object} lastDoc - Last document for pagination (optional)
 * @param {number} limitCount - Number of posts to fetch (default: POSTS_PER_PAGE)
 * @returns {Function} - Unsubscribe function
 */
export function listenForYouFeed(followingList, currentUserId, callback, lastDoc = null, limitCount = POSTS_PER_PAGE) {
  // Include current user in the list
  const userIds = [...followingList, currentUserId];

  // If not following anyone, return empty feed
  if (userIds.length === 0) {
    callback({ posts: [], lastDoc: null, hasMore: false });
    return () => {};
  }

  // Firestore IN query has a limit of 10 items
  // For more than 10, we'd need to batch queries (simplified for MVP)
  const limitedUserIds = userIds.slice(0, 10);

  let q = query(
    collection(db, "posts"),
    where("userId", "in", limitedUserIds),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  if (lastDoc) {
    q = query(
      collection(db, "posts"),
      where("userId", "in", limitedUserIds),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(limitCount)
    );
  }

  return onSnapshot(q, (snapshot) => {
    const posts = [];
    snapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });

    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    callback({ posts, lastDoc: lastVisible, hasMore: posts.length === limitCount });
  });
}

/**
 * Listens to likes count for a post
 * @param {string} postId
 * @param {Function} callback - Called with like count and liked status
 * @returns {Function} - Unsubscribe function
 */
export function listenLikes(postId, callback) {
  const likesRef = collection(db, "posts", postId, "likes");

  return onSnapshot(likesRef, (snapshot) => {
    const user = auth.currentUser;
    const count = snapshot.size;
    const isLiked = user ? snapshot.docs.some(doc => doc.id === user.uid) : false;
    callback({ count, isLiked });
  });
}

/**
 * Toggles like on a post (add if not liked, remove if already liked)
 * @param {string} postId
 * @param {Object} currentUser - The current authenticated user
 * @returns {Promise<boolean>} - true if liked, false if unliked
 */
export async function toggleLike(postId, currentUser) {
  if (!currentUser) throw new Error("User must be authenticated");

  const likeDocRef = doc(db, "posts", postId, "likes", currentUser.uid);
  const likeDoc = await getDoc(likeDocRef);

  if (likeDoc.exists()) {
    // Unlike
    await deleteDoc(likeDocRef);
    return false;
  } else {
    // Like
    await setDoc(likeDocRef, {
      createdAt: serverTimestamp()
    });
    return true;
  }
}

/**
 * Gets comment count for a post
 * @param {string} postId
 * @returns {Promise<number>}
 */
export async function getCommentCount(postId) {
  const commentsRef = collection(db, "posts", postId, "comments");
  const snapshot = await getCountFromServer(commentsRef);
  return snapshot.data().count;
}

/**
 * Listens to comment count for a post
 * @param {string} postId
 * @param {Function} callback - Called with count
 * @returns {Function} - Unsubscribe function
 */
export function listenCommentCount(postId, callback) {
  const commentsRef = collection(db, "posts", postId, "comments");

  return onSnapshot(commentsRef, (snapshot) => {
    callback(snapshot.size);
  });
}

/**
 * Adds a comment to a post
 * @param {string} postId
 * @param {Object} commentData - { content: string }
 * @returns {Promise<string>} - The new comment ID
 */
export async function addComment(postId, { content }) {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be authenticated");

  if (!content || content.trim().length === 0) {
    throw new Error("Comment content is required");
  }

  if (content.trim().length > MAX_CONTENT_LENGTH) {
    throw new Error(`Comment must be less than ${MAX_CONTENT_LENGTH} characters`);
  }

  const commentData = {
    userId: user.uid,
    userName: user.displayName || "Anonymous",
    userPhoto: user.photoURL || "",
    content: content.trim(),
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(
    collection(db, "posts", postId, "comments"),
    commentData
  );
  return docRef.id;
}

/**
 * Listens to comments for a post in real-time with pagination
 * @param {string} postId
 * @param {Function} callback - Called with { comments, lastDoc, hasMore }
 * @param {Object} lastDoc - Last document for pagination (optional)
 * @param {number} limitCount - Number of comments to fetch
 * @returns {Function} - Unsubscribe function
 */
export function listenComments(postId, callback, lastDoc = null, limitCount = COMMENTS_PER_PAGE) {
  let q = query(
    collection(db, "posts", postId, "comments"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  if (lastDoc) {
    q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(limitCount)
    );
  }

  return onSnapshot(q, (snapshot) => {
    const comments = [];
    snapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data()
      });
    });

    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    callback({ comments, lastDoc: lastVisible, hasMore: comments.length === limitCount });
  });
}

/**
 * Deletes a comment (owner only)
 * @param {string} postId
 * @param {string} commentId
 * @returns {Promise<void>}
 */
export async function deleteComment(postId, commentId) {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be authenticated");

  // Get comment to verify ownership
  const commentDoc = await getDoc(doc(db, "posts", postId, "comments", commentId));
  if (!commentDoc.exists()) throw new Error("Comment not found");

  const commentData = commentDoc.data();
  if (commentData.userId !== user.uid) {
    throw new Error("Not authorized to delete this comment");
  }

  await deleteDoc(doc(db, "posts", postId, "comments", commentId));
}

/**
 * Updates a post's content (owner only)
 * @param {string} postId
 * @param {string} newContent
 * @returns {Promise<void>}
 */
export async function updatePost(postId, newContent) {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be authenticated");

  // Validate content
  if (!newContent || newContent.trim().length < MIN_CONTENT_LENGTH) {
    throw new Error("Post content is required");
  }
  if (newContent.trim().length > MAX_CONTENT_LENGTH) {
    throw new Error(`Post content must be less than ${MAX_CONTENT_LENGTH} characters`);
  }

  // Get post to verify ownership
  const postDoc = await getDoc(doc(db, "posts", postId));
  if (!postDoc.exists()) throw new Error("Post not found");

  const postData = postDoc.data();
  if (postData.userId !== user.uid) {
    throw new Error("Not authorized to edit this post");
  }

  // Update the post content
  await setDoc(
    doc(db, "posts", postId),
    {
      content: newContent.trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  console.log("✅ TEST: Post edited successfully", { postId, newContent: newContent.trim() });
}

/**
 * Soft deletes a post (owner only) - marks as deleted but doesn't remove
 * @param {string} postId
 * @returns {Promise<void>}
 */
export async function softDeletePost(postId) {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be authenticated");

  // Get post to verify ownership
  const postDoc = await getDoc(doc(db, "posts", postId));
  if (!postDoc.exists()) throw new Error("Post not found");

  const postData = postDoc.data();
  if (postData.userId !== user.uid) {
    throw new Error("Not authorized to delete this post");
  }

  // Soft delete: mark as deleted
  await setDoc(
    doc(db, "posts", postId),
    {
      status: "deleted",
      deletedAt: serverTimestamp(),
    },
    { merge: true }
  );

  console.log("✅ TEST: Post soft-deleted successfully", { postId, status: "deleted" });
}

/**
 * Hard deletes a post and its image (admin only)
 * @param {string} postId
 * @returns {Promise<void>}
 */
export async function hardDeletePost(postId) {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be authenticated");

  // Get post
  const postDoc = await getDoc(doc(db, "posts", postId));
  if (!postDoc.exists()) throw new Error("Post not found");

  const postData = postDoc.data();

  // Delete image if exists
  if (postData.imageUrl) {
    await deletePostImage(postData.imageUrl);
  }

  // Delete the post document (admin-only via Firestore rules)
  await deleteDoc(doc(db, "posts", postId));

  console.log("✅ TEST: Post hard-deleted successfully (admin)", { postId });
}

/**
 * Deletes a post - soft delete for owners, delegates to softDeletePost
 * @param {string} postId
 * @returns {Promise<void>}
 */
export async function deletePost(postId) {
  return softDeletePost(postId);
}
