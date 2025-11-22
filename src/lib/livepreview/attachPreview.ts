/**
 * Attach Preview - Helper to integrate preview into build pipeline
 *
 * PHASE 1 & 2 IMPROVEMENTS:
 * - Emit "ui_ready" SSE event when Next.js server is fully ready
 * - Better error handling
 * - Proper callback integration
 */

import { startPreview, getPreviewUrl } from '../../../server/preview/previewManager';
import { addJobLog, emitUIReadyEvent } from '../builder/BuildOrchestrator';

/**
 * Attach a live preview server to a completed build
 */
export async function attachPreviewToBuild(
  jobId: string,
  projectPath: string,
  userId: string
): Promise<string | null> {
  try {
    console.log(`[AttachPreview] 🎨 Attaching preview to build ${jobId}`);

    addJobLog(jobId, {
      step: 'preview',
      status: 'info',
      detail: '🎨 Starting live preview server with Next.js + Turbopack...',
      progress: 95,
    });

    // Start the preview server with onReady callback
    const serverInfo = await startPreview(
      jobId,
      projectPath,
      userId,
      () => {
        // This callback fires when Next.js prints "Ready in X.Xs"
        console.log(`[AttachPreview] ✅ UI READY for build ${jobId}!`);

        addJobLog(jobId, {
          step: 'preview',
          status: 'success',
          detail: `✅ Preview server compiled and ready!`,
          progress: 99,
        });

        // Emit SSE event "ui_ready"
        emitUIReadyEvent(jobId, serverInfo.url);
      }
    );

    if (serverInfo.status === 'ready' || serverInfo.status === 'starting') {
      addJobLog(jobId, {
        step: 'preview',
        status: 'info',
        detail: `🎬 Preview server started at port ${serverInfo.port}. Waiting for Next.js compilation...`,
        progress: 97,
      });

      console.log(`[AttachPreview] ✅ Preview URL: ${serverInfo.url}`);

      return serverInfo.url;
    } else {
      addJobLog(jobId, {
        step: 'preview',
        status: 'warn',
        detail: '⚠️ Preview server encountered an issue. Check logs.',
      });

      return serverInfo.url;
    }
  } catch (error: any) {
    console.error(`[AttachPreview] ❌ Failed to attach preview:`, error);

    addJobLog(jobId, {
      step: 'preview',
      status: 'error',
      detail: `❌ Preview failed: ${error.message}`,
    });

    return null;
  }
}

/**
 * Get preview URL for a build (if one exists)
 */
export function getPreviewUrlForBuild(jobId: string): string | null {
  return getPreviewUrl(jobId);
}
