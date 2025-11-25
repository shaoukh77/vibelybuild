/**
 * Store Publish API - Publish apps to VibelyBuild Store
 * POST /api/store/publish
 *
 * Request Body:
 * - userId: string
 * - jobId: string
 * - appName: string
 * - description: string
 * - previewUrl: string (live preview URL)
 *
 * Response:
 * {
 *   success: true,
 *   appId: "...",
 *   storeUrl: "...",
 *   message: "App successfully published to VibelyBuild Store!",
 *   screenshotUrl: "...",
 *   bundleUrl: "..."
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyUser, verifyUserOwnership } from '@/lib/verifyUser';
import {
  publishAppToStore,
  validatePublishParams,
  PublishAppParams
} from '@/lib/store/publisher';
import { getJob } from '@/lib/builder/BuildOrchestrator';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for screenshot + zip

export async function POST(request: NextRequest) {
  console.log('\n[Store Publish API] 🚀 Received publish request');

  try {
    // Step 1: Verify authentication
    console.log('[Store Publish API] ✅ Step 1/5: Verifying authentication...');
    const authUser = await verifyUser(request);
    console.log(`[Store Publish API] ✅ Authenticated user: ${authUser.uid}`);

    // Step 2: Parse request body
    console.log('[Store Publish API] ✅ Step 2/5: Parsing request body...');
    const body = await request.json();

    const { userId, jobId, appName, description, previewUrl } = body;

    console.log('[Store Publish API] Request params:');
    console.log(`  - userId: ${userId}`);
    console.log(`  - jobId: ${jobId}`);
    console.log(`  - appName: ${appName}`);
    console.log(`  - description: ${description?.substring(0, 50)}...`);
    console.log(`  - previewUrl: ${previewUrl}`);

    // Step 3: Validate user ownership
    console.log('[Store Publish API] ✅ Step 3/5: Verifying user ownership...');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USERID' },
        { status: 400 }
      );
    }

    try {
      await verifyUserOwnership(request, userId);
    } catch (error: any) {
      console.error('[Store Publish API] ❌ User ownership verification failed:', error);
      return NextResponse.json(
        { error: 'Unauthorized - user ID mismatch', code: 'UNAUTHORIZED' },
        { status: 403 }
      );
    }

    console.log('[Store Publish API] ✅ User ownership verified');

    // Step 4: Validate publish parameters
    console.log('[Store Publish API] ✅ Step 4/5: Validating parameters...');

    const params: Partial<PublishAppParams> = {
      userId,
      jobId,
      appName,
      description,
      previewUrl,
    };

    const validationError = validatePublishParams(params);

    if (validationError) {
      console.error('[Store Publish API] ❌ Validation failed:', validationError);
      return NextResponse.json(
        { error: validationError, code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    console.log('[Store Publish API] ✅ Parameters validated');

    // Step 5: Verify build exists and is complete
    console.log('[Store Publish API] ✅ Step 5/5: Verifying build status...');

    const job = getJob(jobId);

    if (!job) {
      console.error('[Store Publish API] ❌ Build not found:', jobId);
      return NextResponse.json(
        { error: 'Build not found', code: 'BUILD_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (job.status !== 'complete') {
      console.error('[Store Publish API] ❌ Build not complete:', job.status);
      return NextResponse.json(
        {
          error: `Build is not complete (status: ${job.status})`,
          code: 'BUILD_NOT_READY'
        },
        { status: 400 }
      );
    }

    if (job.userId !== userId) {
      console.error('[Store Publish API] ❌ Build ownership mismatch');
      return NextResponse.json(
        { error: 'Unauthorized - build ownership mismatch', code: 'UNAUTHORIZED' },
        { status: 403 }
      );
    }

    console.log('[Store Publish API] ✅ Build verified (status: complete)');

    // Step 6: Execute publish workflow
    console.log('[Store Publish API] 🚀 Starting publish workflow...');

    const publishResult = await publishAppToStore({
      userId,
      jobId,
      appName,
      description,
      previewUrl,
    });

    if (!publishResult.success) {
      console.error('[Store Publish API] ❌ Publish failed:', publishResult.error);
      return NextResponse.json(
        {
          error: publishResult.error || 'Failed to publish app',
          code: 'PUBLISH_FAILED'
        },
        { status: 500 }
      );
    }

    console.log('[Store Publish API] 🎉 Publish successful!');
    console.log(`[Store Publish API] App ID: ${publishResult.appId}`);
    console.log(`[Store Publish API] Store URL: ${publishResult.storeUrl}`);

    // Step 7: Return success response
    return NextResponse.json({
      success: true,
      appId: publishResult.appId,
      storeUrl: publishResult.storeUrl,
      message: publishResult.message || 'App successfully published to VibelyBuild Store!',
      screenshotUrl: publishResult.screenshotUrl,
      bundleUrl: publishResult.bundleUrl,
    });

  } catch (error: any) {
    console.error('[Store Publish API] ❌ FATAL ERROR:', error);

    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        code: error.code || 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
