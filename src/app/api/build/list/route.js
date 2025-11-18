/**
 * Build List API - Get User's Builds
 * GET /api/build/list
 *
 * Returns all builds belonging to the authenticated user
 * Ordered by most recent first
 */

import { NextResponse } from 'next/server';
import { verifyAuthWithFallback } from '@/lib/authMiddleware';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/build/list
 * List all builds for authenticated user
 */
export async function GET(request) {
  try {
    // 1. Verify authentication
    const user = await verifyAuthWithFallback(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.uid;

    console.log(`[Build List API] Fetching builds for user ${userId}`);

    // 2. Query builds from Firestore
    const buildsSnapshot = await adminDb
      .collection('builds')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(100) // Limit to last 100 builds
      .get();

    // 3. Format builds
    const builds = [];

    buildsSnapshot.forEach(doc => {
      const data = doc.data();
      builds.push({
        buildId: doc.id,
        userId: data.userId,
        prompt: data.prompt,
        target: data.target || 'web',
        status: data.status,
        appName: data.appName,
        description: data.description,
        techStack: data.techStack,
        output: data.output,
        error: data.error,
        createdAt: data.createdAt?.toMillis?.() || null,
        updatedAt: data.updatedAt?.toMillis?.() || null,
        completedAt: data.completedAt?.toMillis?.() || null,
        failedAt: data.failedAt?.toMillis?.() || null,
      });
    });

    console.log(`[Build List API] Found ${builds.length} builds for user ${userId}`);

    // 4. Return builds (JSON only)
    return NextResponse.json({
      success: true,
      builds,
      count: builds.length,
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('[Build List API] Error:', error);

    // Return JSON error (never HTML)
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        code: 'LIST_ERROR',
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
