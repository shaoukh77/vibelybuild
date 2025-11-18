/**
 * Build API - Create New Build
 * POST /api/build
 *
 * Creates a new build document and starts LLM generation workflow
 * Returns immediately while build runs in background
 * Logs streamed to Firestore in real-time
 */

import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { verifyAuthWithFallback } from '@/lib/authMiddleware';
import { adminDb } from '@/lib/firebaseAdmin';
import admin from '@/lib/firebaseAdmin';
import { appendLog, updateBuildStatus, markBuildFailed, markBuildComplete } from '@/lib/logWriter';
import { generateAppBlueprint } from '@/lib/modelClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for Render.com

/**
 * POST /api/build
 * Create a new build and start generation
 */
export async function POST(request) {
  try {
    // 1. Verify authentication
    const user = await verifyAuthWithFallback(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { prompt, target = 'web', buildId } = body;

    // 3. Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing required field: prompt' },
        { status: 400 }
      );
    }

    // Validate prompt length
    if (prompt.length < 10) {
      return NextResponse.json(
        { error: 'Prompt must be at least 10 characters' },
        { status: 400 }
      );
    }

    if (prompt.length > 5000) {
      return NextResponse.json(
        { error: 'Prompt must not exceed 5000 characters' },
        { status: 400 }
      );
    }

    // Validate target
    const validTargets = ['web', 'ios', 'android', 'multi'];
    if (!validTargets.includes(target)) {
      return NextResponse.json(
        { error: `Invalid target. Must be one of: ${validTargets.join(', ')}` },
        { status: 400 }
      );
    }

    // 4. Generate build ID
    const finalBuildId = buildId || `build_${nanoid(16)}`;
    const userId = user.uid;

    console.log(`[Build API] Creating build ${finalBuildId} for user ${userId}`);

    // 5. Create build document in Firestore
    const buildRef = adminDb.collection('builds').doc(finalBuildId);
    await buildRef.set({
      userId,
      prompt: prompt.trim(),
      target,
      status: 'queued',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 6. Write initial log
    await appendLog(
      finalBuildId,
      userId,
      '🎯 Build request received. Starting generation...',
      'info'
    );

    // 7. Start build execution in background (don't await)
    executeBuildPipeline({
      buildId: finalBuildId,
      userId,
      prompt: prompt.trim(),
      target,
    }).catch((error) => {
      console.error(`[Build ${finalBuildId}] Pipeline error:`, error);
    });

    console.log(`[Build API] Build ${finalBuildId} queued successfully`);

    // 8. Return success response immediately (JSON only)
    return NextResponse.json({
      success: true,
      buildId: finalBuildId,
      status: 'queued',
      message: 'Build started successfully',
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('[Build API] Error:', error);

    // Return JSON error (never HTML)
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        code: error.code || 'INTERNAL_ERROR',
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * Execute build pipeline asynchronously
 * Runs in background, updates Firestore in real-time
 */
async function executeBuildPipeline({ buildId, userId, prompt, target }) {
  const buildRef = adminDb.collection('builds').doc(buildId);

  try {
    // Step 1: Update status to running
    await updateBuildStatus(buildId, 'running');
    await appendLog(buildId, userId, '🚀 Starting VibeCode AI build pipeline...');

    // Step 2: Generate app blueprint with AI
    await appendLog(buildId, userId, '🧠 Analyzing your idea with AI...');

    const blueprint = await generateAppBlueprint(
      prompt,
      target,
      (message, level) => {
        // Log callback from model client
        appendLog(buildId, userId, message, level || 'info').catch(err => {
          console.error('[Build] Failed to write log:', err);
        });
      }
    );

    await appendLog(buildId, userId, `✨ Generated ${blueprint.appName} (${target} app)`);

    // Step 3: Store blueprint in Firestore
    await buildRef.update({
      appName: blueprint.appName,
      description: blueprint.description,
      blueprint: blueprint.structure,
      files: blueprint.files,
      techStack: blueprint.techStack,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await appendLog(buildId, userId, `📦 Saved ${Object.keys(blueprint.files).length} files`);

    // Step 4: Prepare output
    const output = {
      appName: blueprint.appName,
      description: blueprint.description,
      target,
      fileCount: Object.keys(blueprint.files).length,
      files: blueprint.files,
      techStack: blueprint.techStack,
      createdAt: blueprint.createdAt,
    };

    // Step 5: Mark build as complete
    await markBuildComplete(buildId, userId, { output });

    console.log(`[Build ${buildId}] ✅ Build completed successfully`);

  } catch (error) {
    console.error(`[Build ${buildId}] ❌ Build failed:`, error);

    // Mark build as failed
    await markBuildFailed(buildId, userId, error);
  }
}
