/**
 * Log Writer - Production-Ready
 * Writes build logs to Firestore in real-time
 * Used by build pipeline to stream progress to frontend
 */

import admin, { db } from './firebaseAdmin';

/**
 * Append a log message to a build
 * Creates a document in buildLogs collection
 *
 * @param {string} buildId - Build ID
 * @param {string} userId - User ID (for security)
 * @param {string} message - Log message
 * @param {string} level - Log level (info, warn, error, success)
 * @returns {Promise<void>}
 */
export async function appendLog(buildId, userId, message, level = 'info') {
  try {
    await db.collection('buildLogs').add({
      buildId,
      userId,
      message,
      level,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      timestamp: Date.now(), // For client-side ordering before serverTimestamp resolves
    });

    // Also log to console for debugging
    const emoji = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      success: '✅',
    }[level] || 'ℹ️';

    console.log(`[Build ${buildId}] ${emoji} ${message}`);

  } catch (error) {
    console.error('[logWriter] Failed to write log:', error.message);
    // Don't throw - log writing failures shouldn't break the build
  }
}

/**
 * Append multiple logs in batch (more efficient)
 *
 * @param {string} buildId - Build ID
 * @param {string} userId - User ID
 * @param {Array<{message: string, level?: string}>} logs - Array of log objects
 * @returns {Promise<void>}
 */
export async function appendLogs(buildId, userId, logs) {
  if (!logs || logs.length === 0) return;

  const batch = db.batch();
  const timestamp = Date.now();

  logs.forEach((log, index) => {
    const docRef = db.collection('buildLogs').doc();
    batch.set(docRef, {
      buildId,
      userId,
      message: log.message,
      level: log.level || 'info',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      timestamp: timestamp + index, // Slight offset for ordering
    });
  });

  try {
    await batch.commit();
    console.log(`[Build ${buildId}] 📝 Wrote ${logs.length} logs in batch`);
  } catch (error) {
    console.error('[logWriter] Failed to write batch logs:', error.message);
  }
}

/**
 * Update build status in Firestore
 *
 * @param {string} buildId - Build ID
 * @param {string} status - New status (queued, running, complete, failed)
 * @param {Object} additionalData - Additional fields to update
 * @returns {Promise<void>}
 */
export async function updateBuildStatus(buildId, status, additionalData = {}) {
  try {
    const buildRef = db.collection('builds').doc(buildId);

    await buildRef.update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...additionalData,
    });

    console.log(`[Build ${buildId}] Status updated to: ${status}`);

  } catch (error) {
    console.error(`[logWriter] Failed to update build status:`, error.message);
    throw error; // Status updates are critical, so throw
  }
}

/**
 * Mark build as failed
 *
 * @param {string} buildId - Build ID
 * @param {string} userId - User ID
 * @param {Error|string} error - Error object or message
 * @returns {Promise<void>}
 */
export async function markBuildFailed(buildId, userId, error) {
  const errorMessage = error instanceof Error ? error.message : String(error);

  await appendLog(buildId, userId, `❌ Build failed: ${errorMessage}`, 'error');

  await updateBuildStatus(buildId, 'failed', {
    error: errorMessage,
    failedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Mark build as complete
 *
 * @param {string} buildId - Build ID
 * @param {string} userId - User ID
 * @param {Object} result - Build result data (output, files, etc.)
 * @returns {Promise<void>}
 */
export async function markBuildComplete(buildId, userId, result = {}) {
  await appendLog(buildId, userId, '✅ Build completed successfully!', 'success');

  await updateBuildStatus(buildId, 'complete', {
    ...result,
    completedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Clean error message for logging
 * Removes stack traces and sensitive info
 *
 * @param {Error} error - Error object
 * @returns {string} Cleaned error message
 */
export function cleanErrorMessage(error) {
  const message = error.message || String(error);

  // Remove stack traces and file paths
  return message
    .split('\n')[0]
    .replace(/at.*\(.*\)/g, '')
    .replace(/\/.*\//g, '')
    .trim();
}
