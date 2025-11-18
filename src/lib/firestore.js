import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db, auth } from './firebase';

// ========== BUILDS ==========

/**
 * Create a new build document
 * Note: Build logs are now stored in separate /buildLogs collection
 */
export async function createBuild({ buildId, userId, prompt }) {
  // Verify userId matches authenticated user
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error('Unauthorized: userId must match authenticated user');
  }

  const buildRef = doc(db, 'builds', buildId);
  const buildData = {
    userId,
    prompt,
    status: 'queued',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(buildRef, buildData);
  return buildData;
}

/**
 * Update build status
 */
export async function updateBuildStatus(buildId, status) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Unauthorized: Must be authenticated');
  }

  const buildRef = doc(db, 'builds', buildId);

  // Verify user owns this build
  const buildSnap = await getDoc(buildRef);
  if (!buildSnap.exists()) {
    throw new Error('Build not found');
  }
  if (buildSnap.data().userId !== currentUser.uid) {
    throw new Error('Unauthorized: You do not own this build');
  }

  await updateDoc(buildRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

/**
 * @deprecated Use createBuildLog() instead - logs are now in /buildLogs collection
 */
export async function appendBuildStep(buildId, step) {
  console.warn('appendBuildStep is deprecated. Use createBuildLog() instead.');
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Unauthorized: Must be authenticated');
  }

  // For backward compatibility, create a log entry instead
  await createBuildLog(buildId, currentUser.uid, step);
}

// ========== BUILD LOGS ==========

/**
 * Create a build log entry in /buildLogs collection
 */
export async function createBuildLog(buildId, userId, message) {
  if (!buildId || !userId || !message) {
    throw new Error('buildId, userId, and message are required');
  }

  // Verify userId matches authenticated user (client-side check)
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error('Unauthorized: userId must match authenticated user');
  }

  const logData = {
    buildId,
    userId,
    message,
    createdAt: serverTimestamp(),
  };

  const logsRef = collection(db, 'buildLogs');
  await addDoc(logsRef, logData);
}

/**
 * Subscribe to build logs for a specific build (real-time)
 */
export function subscribeToBuildLogs(buildId, userId, callback) {
  if (!buildId || !userId) {
    callback([]);
    return () => {};
  }

  // Verify userId matches authenticated user
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    console.error('Unauthorized: userId must match authenticated user');
    callback([]);
    return () => {};
  }

  const logsRef = collection(db, 'buildLogs');
  const q = query(
    logsRef,
    where('buildId', '==', buildId),
    where('userId', '==', userId),
    orderBy('createdAt', 'asc'),
    limit(500)
  );

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(logs);
  }, (error) => {
    console.error('Error subscribing to build logs:', error);
    callback([]);
  });
}

/**
 * Get build logs for a specific build (one-time fetch)
 */
export async function getBuildLogs(buildId, userId) {
  if (!buildId || !userId) return [];

  // Verify userId matches authenticated user
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error('Unauthorized: userId must match authenticated user');
  }

  const logsRef = collection(db, 'buildLogs');
  const q = query(
    logsRef,
    where('buildId', '==', buildId),
    where('userId', '==', userId),
    orderBy('createdAt', 'asc'),
    limit(500)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Get a single build by ID
 */
export async function getBuild(buildId) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Unauthorized: Must be authenticated');
  }

  const buildRef = doc(db, 'builds', buildId);
  const buildSnap = await getDoc(buildRef);
  if (!buildSnap.exists()) return null;

  const buildData = buildSnap.data();
  // Verify user owns this build
  if (buildData.userId !== currentUser.uid) {
    throw new Error('Unauthorized: You do not own this build');
  }

  return { id: buildSnap.id, ...buildData };
}

/**
 * Subscribe to user's builds (real-time)
 * Simplified: No orderBy to avoid composite index - sorting done client-side
 */
export function subscribeToUserBuilds(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  // Verify userId matches authenticated user
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    console.error('Unauthorized: userId must match authenticated user');
    callback([]);
    return () => {};
  }

  const buildsRef = collection(db, 'builds');
  const q = query(
    buildsRef,
    where('userId', '==', userId),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const builds = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort client-side by createdAt descending
    builds.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    callback(builds);
  }, (error) => {
    console.warn('Error subscribing to builds:', error);
    callback([]);
  });
}

/**
 * Get user's builds (one-time fetch)
 */
export async function getUserBuilds(userId) {
  if (!userId) return [];

  // Verify userId matches authenticated user
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error('Unauthorized: userId must match authenticated user');
  }

  const buildsRef = collection(db, 'builds');
  const q = query(
    buildsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// ========== PUBLIC APPS ==========

/**
 * Publish an app - writes to both publicApps and users/{uid}/apps
 */
export async function publishApp(buildId, { title, description, ownerUid, ownerName, coverUrl = '' }) {
  // Verify ownerUid matches authenticated user
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== ownerUid) {
    throw new Error('Unauthorized: ownerUid must match authenticated user');
  }

  const appId = buildId; // Use buildId as appId for simplicity

  const appData = {
    appId,
    buildId,
    ownerUid,
    ownerName,
    title,
    description: description || '',
    coverUrl,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: 'published',
  };

  // Write to publicApps collection
  const publicAppRef = doc(db, 'publicApps', appId);
  await setDoc(publicAppRef, appData);

  // Write to user's apps collection
  const userAppRef = doc(db, 'users', ownerUid, 'apps', appId);
  await setDoc(userAppRef, {
    ...appData,
    visibility: 'public',
  });

  return appId;
}

/**
 * Unpublish an app - sets status to unpublished in both collections
 */
export async function unpublishApp(appId, ownerUid) {
  // Verify ownerUid matches authenticated user
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== ownerUid) {
    throw new Error('Unauthorized: ownerUid must match authenticated user');
  }

  // Update publicApps collection
  const publicAppRef = doc(db, 'publicApps', appId);
  await updateDoc(publicAppRef, {
    status: 'unpublished',
    updatedAt: serverTimestamp(),
  });

  // Update user's apps collection
  const userAppRef = doc(db, 'users', ownerUid, 'apps', appId);
  await updateDoc(userAppRef, {
    status: 'unpublished',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Create a public app (legacy - kept for compatibility)
 */
export async function createPublicApp({
  appId,
  ownerId,
  buildId,
  title,
  description,
  coverUrl,
}) {
  const appRef = doc(db, 'publicApps', appId);
  const appData = {
    ownerId,
    buildId,
    title,
    description: description || '',
    coverUrl: coverUrl || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(appRef, appData);
  return appData;
}

/**
 * Get a single public app
 */
export async function getPublicApp(appId) {
  const appRef = doc(db, 'publicApps', appId);
  const appSnap = await getDoc(appRef);
  if (!appSnap.exists()) return null;
  return { id: appSnap.id, ...appSnap.data() };
}

/**
 * Subscribe to all public apps (real-time) - only published ones
 *
 * ⚠️ COMPOSITE INDEX REQUIRED:
 * Collection: publicApps
 * Fields: status (Ascending), createdAt (Descending)
 *
 * When you see the Firebase console link in the browser error, click it once
 * to auto-create this index. This query needs server-side ordering for UX.
 */
export function subscribeToPublicApps(callback, limitCount = 24) {
  const appsRef = collection(db, 'publicApps');
  const q = query(
    appsRef,
    where('status', '==', 'published'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const apps = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(apps);
  }, (error) => {
    console.warn('Error subscribing to public apps:', error);
    callback([]);
  });
}

/**
 * Get all public apps (one-time fetch)
 */
export async function getPublicApps(limitCount = 24) {
  const appsRef = collection(db, 'publicApps');
  const q = query(
    appsRef,
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Subscribe to user's published apps (real-time)
 */
export function subscribeToUserPublishedApps(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const appsRef = collection(db, 'publicApps');
  const q = query(
    appsRef,
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const apps = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(apps);
  }, (error) => {
    console.error('Error subscribing to user apps:', error);
    callback([]);
  });
}

/**
 * Get user's published apps (one-time fetch)
 */
export async function getUserPublishedApps(userId) {
  if (!userId) return [];

  const appsRef = collection(db, 'publicApps');
  const q = query(
    appsRef,
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Subscribe to user's apps from their private collection (real-time)
 * Simplified: No orderBy to avoid index - sorting done client-side
 */
export function subscribeToUserApps(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const appsRef = collection(db, 'users', userId, 'apps');
  const q = query(appsRef);

  return onSnapshot(q, (snapshot) => {
    const apps = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort client-side by createdAt descending
    apps.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    callback(apps);
  }, (error) => {
    console.warn('Error subscribing to user apps:', error);
    callback([]);
  });
}

// ========== AD CAMPAIGNS ==========

/**
 * Create a new ad campaign
 */
export async function createAdCampaign({
  userId,
  appName,
  description,
  platforms,
  adType,
  tone,
  cta,
  budget,
  country,
  primaryText,
  hooks,
  script,
  variations,
}) {
  const campaignsRef = collection(db, 'users', userId, 'adCampaigns');
  const campaignData = {
    appName,
    description,
    platforms: platforms || [],
    adType,
    tone,
    cta,
    budget: budget || '',
    country: country || '',
    primaryText,
    hooks: hooks || [],
    script,
    variations: variations || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await setDoc(doc(campaignsRef), campaignData);
  return docRef;
}

/**
 * Subscribe to user's ad campaigns (real-time)
 * Simplified: No orderBy to avoid composite index - sorting done client-side
 */
export function subscribeToAdCampaigns(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const campaignsRef = collection(db, 'users', userId, 'adCampaigns');
  const q = query(campaignsRef, limit(50));

  return onSnapshot(q, (snapshot) => {
    const campaigns = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort client-side by createdAt descending
    campaigns.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    callback(campaigns);
  }, (error) => {
    console.warn('Error subscribing to ad campaigns:', error);
    callback([]);
  });
}

/**
 * Get a single ad campaign
 */
export async function getAdCampaign(userId, campaignId) {
  const campaignRef = doc(db, 'users', userId, 'adCampaigns', campaignId);
  const campaignSnap = await getDoc(campaignRef);
  if (!campaignSnap.exists()) return null;
  return { id: campaignSnap.id, ...campaignSnap.data() };
}

// ========== MARKETING CAMPAIGNS ==========

/**
 * Create a new marketing campaign
 */
export async function createMarketingCampaign({
  userId,
  name,
  appName,
  goal,
  primaryPlatform,
  status,
  startDate,
  endDate,
  adsCampaignIds,
  notes,
}) {
  const campaignsRef = collection(db, 'users', userId, 'marketingCampaigns');
  const campaignData = {
    name,
    appName,
    goal,
    primaryPlatform,
    status: status || 'idea',
    startDate: startDate || '',
    endDate: endDate || '',
    adsCampaignIds: adsCampaignIds || [],
    notes: notes || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await setDoc(doc(campaignsRef), campaignData);
  return docRef;
}

/**
 * Update a marketing campaign
 */
export async function updateMarketingCampaign(userId, campaignId, updates) {
  const campaignRef = doc(db, 'users', userId, 'marketingCampaigns', campaignId);
  await updateDoc(campaignRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a marketing campaign
 */
export async function deleteMarketingCampaign(userId, campaignId) {
  const campaignRef = doc(db, 'users', userId, 'marketingCampaigns', campaignId);
  await updateDoc(campaignRef, {
    deleted: true,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Subscribe to user's marketing campaigns (real-time)
 * Simplified: No where/orderBy to avoid composite index - filtering/sorting done client-side
 */
export function subscribeToMarketingCampaigns(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const campaignsRef = collection(db, 'users', userId, 'marketingCampaigns');
  // Simple query without where/orderBy - no composite index needed for user-scoped data
  const q = query(campaignsRef);

  return onSnapshot(q, (snapshot) => {
    const campaigns = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter out deleted campaigns client-side
    const activeCampaigns = campaigns.filter(c => c.deleted !== true);

    // Sort client-side by createdAt descending
    activeCampaigns.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    callback(activeCampaigns);
  }, (error) => {
    console.warn('Error subscribing to marketing campaigns:', error);
    callback([]);
  });
}

/**
 * Get marketing campaigns by status
 */
export async function getMarketingCampaignsByStatus(userId, status) {
  if (!userId) return [];

  const campaignsRef = collection(db, 'users', userId, 'marketingCampaigns');
  const q = query(
    campaignsRef,
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// ========== CHAT / MESSENGER ==========

/**
 * Get or create a conversation between two users
 * Uses deterministic conversationId: ${minUid}_${maxUid}
 */
export async function getOrCreateConversation(currentUser, otherUserId, otherUserProfile) {
  if (!currentUser || !otherUserId) {
    throw new Error('Current user and other user ID required');
  }

  // Don't allow messaging yourself
  if (currentUser.uid === otherUserId) {
    throw new Error('Cannot message yourself');
  }

  // Create deterministic conversationId
  const [uidA, uidB] = [currentUser.uid, otherUserId].sort();
  const conversationId = `${uidA}_${uidB}`;

  // Check if conversation already exists
  const conversationRef = doc(db, 'conversations', conversationId);
  const conversationSnap = await getDoc(conversationRef);

  if (conversationSnap.exists()) {
    return conversationId;
  }

  // Create new conversation with participantDetails
  const participantDetails = {
    [currentUser.uid]: {
      displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous',
      photoURL: currentUser.photoURL || null,
    },
    [otherUserId]: {
      displayName: otherUserProfile.displayName || otherUserProfile.userName || 'User',
      photoURL: otherUserProfile.photoURL || otherUserProfile.userPhoto || null,
    },
  };

  const newConv = {
    participants: [currentUser.uid, otherUserId],
    participantDetails,
    lastMessage: '',
    lastSenderId: '',
    updatedAt: serverTimestamp(),
  };

  await setDoc(conversationRef, newConv);
  return conversationId;
}

/**
 * Subscribe to user's conversations
 *
 * ⚠️ COMPOSITE INDEX REQUIRED:
 * Collection: conversations
 * Fields: participants (Array), updatedAt (Descending)
 *
 * When you see the Firebase console link in the browser error, click it once
 * to auto-create this index. This query needs proper ordering for chat UX.
 */
export function subscribeToConversations(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(conversations);
  }, (error) => {
    console.warn('Error subscribing to conversations:', error);
    callback([]);
  });
}

/**
 * Subscribe to messages in a conversation
 */
export function subscribeToMessages(conversationId, callback) {
  if (!conversationId) {
    callback([]);
    return () => {};
  }

  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(100));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  }, (error) => {
    console.error('Error subscribing to messages:', error);
    callback([]);
  });
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(conversationId, senderId, text) {
  if (!conversationId || !senderId || !text?.trim()) {
    throw new Error('Conversation ID, sender ID, and message text required');
  }

  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const conversationRef = doc(db, 'conversations', conversationId);

  // Add message
  await addDoc(messagesRef, {
    senderId,
    text: text.trim(),
    createdAt: serverTimestamp(),
    readBy: [senderId], // Sender has read their own message
  });

  // Update conversation
  await updateDoc(conversationRef, {
    lastMessage: text.trim().substring(0, 100),
    lastSenderId: senderId,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Mark messages as read by a user
 */
export async function markMessagesAsRead(conversationId, userId) {
  if (!conversationId || !userId) return;

  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(
    messagesRef,
    where('senderId', '!=', userId)
  );

  const snapshot = await getDocs(q);

  const batch = [];
  snapshot.docs.forEach(docSnap => {
    const data = docSnap.data();
    const readBy = data.readBy || [];

    if (!readBy.includes(userId)) {
      batch.push(
        updateDoc(doc(db, 'conversations', conversationId, 'messages', docSnap.id), {
          readBy: arrayUnion(userId),
        })
      );
    }
  });

  await Promise.all(batch);
}
