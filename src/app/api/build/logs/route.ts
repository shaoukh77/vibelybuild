/**
 * Build Logs API - Real-time Log Streaming via SSE
 * GET /api/build/logs?jobId=XYZ
 *
 * Streams build logs in real-time using Server-Sent Events.
 * Frontend subscribes to this endpoint to receive live updates.
 *
 * SSE Message Format:
 * {
 *   step: string,
 *   timestamp: number,
 *   status: "info" | "warn" | "error" | "success",
 *   detail: string,
 *   progress?: number  // 0-100
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/verifyUser';
import { getJob, getJobLogs } from '@/lib/builder/BuildOrchestrator';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await verifyUser(request);

    // Get jobId from query params
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId query parameter is required' },
        { status: 400 }
      );
    }

    // Get job and verify ownership
    const job = getJob(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.userId !== authUser.uid) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not own this job' },
        { status: 403 }
      );
    }

    console.log(`[Build Logs] Starting SSE stream for job ${jobId}, user ${authUser.uid}`);

    // Create SSE stream
    const stream = createLogStream(jobId);

    // Return SSE response
    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Critical for Render.com/Nginx
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    });

  } catch (error: any) {
    console.error('[Build Logs] Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to stream logs',
        code: 'LOG_STREAM_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * Create SSE stream for job logs
 */
function createLogStream(jobId: string): ReadableStream {
  const encoder = new TextEncoder();
  let intervalId: NodeJS.Timeout | null = null;
  let lastLogIndex = 0;

  const stream = new ReadableStream({
    start(controller) {
      // Helper to send SSE message
      const send = (data: any) => {
        try {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error('[SSE] Failed to send message:', error);
        }
      };

      // Send initial connection message
      send({
        type: 'connected',
        jobId,
        timestamp: Date.now(),
      });

      // Get job
      const job = getJob(jobId);
      if (!job) {
        send({ type: 'error', message: 'Job not found' });
        controller.close();
        return;
      }

      // Send current status
      send({
        type: 'status',
        status: job.status,
        timestamp: Date.now(),
      });

      // Send existing logs
      const existingLogs = getJobLogs(jobId);
      existingLogs.forEach((log) => {
        send({
          type: 'log',
          ...log,
        });
      });

      lastLogIndex = existingLogs.length;

      // Poll for new logs every 500ms
      intervalId = setInterval(() => {
        const currentJob = getJob(jobId);
        if (!currentJob) {
          send({ type: 'error', message: 'Job not found' });
          if (intervalId) clearInterval(intervalId);
          controller.close();
          return;
        }

        // Send status update
        send({
          type: 'status',
          status: currentJob.status,
          timestamp: Date.now(),
        });

        // Get new logs
        const allLogs = getJobLogs(jobId);
        const newLogs = allLogs.slice(lastLogIndex);

        newLogs.forEach((log) => {
          send({
            type: 'log',
            ...log,
          });
        });

        lastLogIndex = allLogs.length;

        // If job is complete, failed, or cancelled, close stream
        if (
          currentJob.status === 'complete' ||
          currentJob.status === 'failed' ||
          currentJob.status === 'cancelled'
        ) {
          send({
            type: 'done',
            status: currentJob.status,
            error: currentJob.error,
            timestamp: Date.now(),
          });

          if (intervalId) clearInterval(intervalId);

          // Close after 1 second to ensure message is sent
          setTimeout(() => {
            try {
              controller.close();
            } catch (e) {
              // Stream may already be closed
            }
          }, 1000);
        }
      }, 500);
    },

    cancel() {
      // Cleanup when client disconnects
      if (intervalId) {
        clearInterval(intervalId);
      }
      console.log(`[SSE] Client disconnected from job ${jobId}`);
    },
  });

  return stream;
}

/**
 * Handle OPTIONS for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}
