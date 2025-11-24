/**
 * Attach Preview - Serverless Edition
 *
 * Generates preview URLs for completed builds.
 * Previews are served on-demand via /api/preview/[jobId]
 *
 * NOTE: This is a simplified version for serverless deployment.
 * No preview servers are spawned - previews are stateless.
 */

import { addJobLog, emitUIReadyEvent } from '../builder/BuildOrchestrator';

/**
 * Attach a serverless preview to a completed build
 *
 * Since previews are serverless, this just generates the preview URL
 * and emits the ui_ready event.
 */
export async function attachPreviewToBuild(
  jobId: string,
  projectPath: string,
  userId: string
): Promise<string | null> {
  try {
    console.log(`[AttachPreview] 🎨 Generating preview URL for build ${jobId}`);

    addJobLog(jobId, {
      step: 'preview',
      status: 'info',
      detail: '🎨 Preparing serverless preview...',
      progress: 95,
    });

    // Generate preview URL (serverless endpoint)
    const previewUrl = `/api/preview/${jobId}`;

    addJobLog(jobId, {
      step: 'preview',
      status: 'success',
      detail: '✅ Preview ready! Click "View Preview" to see your app.',
      progress: 99,
    });

    // Emit SSE event "ui_ready"
    console.log(`[AttachPreview] ✅ Preview URL: ${previewUrl}`);
    emitUIReadyEvent(jobId, previewUrl);

    return previewUrl;
  } catch (error: any) {
    console.error(`[AttachPreview] ❌ Failed to generate preview:`, error);

    addJobLog(jobId, {
      step: 'preview',
      status: 'error',
      detail: `❌ Preview failed: ${error.message}`,
    });

    return null;
  }
}

/**
 * Get preview URL for a build
 *
 * For serverless previews, this simply returns the API route path
 */
export function getPreviewUrlForBuild(jobId: string): string | null {
  if (!jobId) return null;
  return `/api/preview/${jobId}`;
}
