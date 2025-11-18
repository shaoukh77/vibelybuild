import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getPostAuthorUid, getUserDisplayName } from "./lib/helpers";

admin.initializeApp();

const db = admin.firestore();
const logger = functions.logger;

// Deduplication window for likes (2 minutes)
const LIKE_DEDUP_WINDOW_MS = 2 * 60 * 1000;

/**
 * Cloud Function: Triggered when a like is created
 * Creates or updates a notification for the post author
 * Deduplicates likes within 2 minutes by incrementing a count
 */
export const onLikeCreated = functions.firestore
  .document("posts/{postId}/likes/{likeId}")
  .onCreate(async (snapshot, context) => {
    const { postId, likeId } = context.params;
    const likeData = snapshot.data();

    try {
      // Get actorUid from like document (either actorUid or use likeId as fallback)
      const actorUid = likeData.actorUid || likeId;

      // Get post author
      const authorUid = await getPostAuthorUid(postId);

      if (!authorUid) {
        logger.info(`Post ${postId} not found, skipping notification`);
        return;
      }

      // Don't notify yourself
      if (actorUid === authorUid) {
        logger.info(`Actor ${actorUid} liked their own post, skipping notification`);
        return;
      }

      // Get actor's display name
      const actorName = await getUserDisplayName(actorUid);

      // Check for existing recent like notification from this actor for this post
      const notificationsRef = db
        .collection("users")
        .doc(authorUid)
        .collection("notifications");

      const twoMinutesAgo = admin.firestore.Timestamp.fromMillis(
        Date.now() - LIKE_DEDUP_WINDOW_MS
      );

      const recentLikeQuery = await notificationsRef
        .where("type", "==", "like")
        .where("postId", "==", postId)
        .where("actorUid", "==", actorUid)
        .where("createdAt", ">=", twoMinutesAgo)
        .limit(1)
        .get();

      if (!recentLikeQuery.empty) {
        // Update existing notification with incremented count
        const existingNotif = recentLikeQuery.docs[0];
        const currentCount = existingNotif.data().count || 1;

        await existingNotif.ref.update({
          count: currentCount + 1,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          read: false, // Mark as unread again
        });

        logger.info(
          `Updated like notification for post ${postId} (count: ${currentCount + 1})`
        );
      } else {
        // Create new notification
        await notificationsRef.add({
          type: "like",
          postId,
          actorUid,
          actorName,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          read: false,
          count: 1,
        });

        logger.info(
          `Created like notification for post ${postId} by ${actorName}`
        );
      }
    } catch (error) {
      logger.error(`Error creating like notification:`, error);
    }
  });

/**
 * Cloud Function: Triggered when a comment is created
 * Creates a notification for the post author
 */
export const onCommentCreated = functions.firestore
  .document("posts/{postId}/comments/{commentId}")
  .onCreate(async (snapshot, context) => {
    const { postId, commentId } = context.params;
    const commentData = snapshot.data();

    try {
      // Get actorUid from comment document
      const actorUid = commentData.actorUid || commentData.userId;
      const commentText = commentData.text || commentData.content || "";

      if (!actorUid) {
        logger.warn(`Comment ${commentId} has no actorUid, skipping notification`);
        return;
      }

      // Get post author
      const authorUid = await getPostAuthorUid(postId);

      if (!authorUid) {
        logger.info(`Post ${postId} not found, skipping notification`);
        return;
      }

      // Don't notify yourself
      if (actorUid === authorUid) {
        logger.info(`Actor ${actorUid} commented on their own post, skipping notification`);
        return;
      }

      // Get actor's display name
      const actorName = await getUserDisplayName(actorUid);

      // Create notification
      const notificationsRef = db
        .collection("users")
        .doc(authorUid)
        .collection("notifications");

      await notificationsRef.add({
        type: "comment",
        postId,
        actorUid,
        actorName,
        text: commentText,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
      });

      logger.info(
        `Created comment notification for post ${postId} by ${actorName}`
      );
    } catch (error) {
      logger.error(`Error creating comment notification:`, error);
    }
  });
