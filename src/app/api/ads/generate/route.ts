/**
 * AI Ads Generator API
 * POST /api/ads/generate
 *
 * Generates 2 professional ad graphics using OpenAI DALL·E 3
 * Saves images to /public/generated_ads/<sessionId>/
 *
 * Request body:
 * {
 *   title: string,
 *   description: string,
 *   audience: string,
 *   platform: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   images: [
 *     { url: "/generated_ads/<id>/ad1.png", filename: "ad1.png" },
 *     { url: "/generated_ads/<id>/ad2.png", filename: "ad2.png" }
 *   ],
 *   sessionId: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/verifyUser';
import { generateAdImages, validateAdParams } from '@/lib/ads/imageGenerator';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for DALL·E 3 generation

interface AdGenerationRequest {
  title: string;
  description: string;
  audience: string;
  platform: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('[Ads API] Received ad generation request');

    // Verify authentication
    let authUser;
    try {
      authUser = await verifyUser(request);
      console.log('[Ads API] User authenticated:', authUser.uid);
    } catch (authError: any) {
      console.error('[Ads API] Authentication failed:', authError.message);
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
        },
        { status: 401 }
      );
    }

    // Parse request body
    let body: AdGenerationRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('[Ads API] Failed to parse request body');
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON',
        },
        { status: 400 }
      );
    }

    const { title, description, audience, platform } = body;

    // Validate input
    const validationError = validateAdParams({
      title,
      description,
      audience,
      platform,
      userId: authUser.uid,
      sessionId: '', // Not needed for validation
    });

    if (validationError) {
      console.error('[Ads API] Validation failed:', validationError);
      return NextResponse.json(
        {
          success: false,
          error: validationError,
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    console.log('[Ads API] Validation passed');
    console.log('[Ads API] Title:', title.substring(0, 50));
    console.log('[Ads API] Platform:', platform);
    console.log('[Ads API] Audience:', audience.substring(0, 50));

    // Generate unique session ID
    const sessionId = nanoid();
    console.log('[Ads API] Session ID:', sessionId);

    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('[Ads API] OpenAI API key not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'AI service is not configured. Please contact support.',
          code: 'API_KEY_MISSING',
        },
        { status: 500 }
      );
    }

    // Generate ad images
    console.log('[Ads API] Starting image generation...');
    const images = await generateAdImages({
      sessionId,
      title: title.trim(),
      description: description.trim(),
      audience: audience.trim(),
      platform: platform.trim(),
      userId: authUser.uid,
    });

    const duration = Date.now() - startTime;
    console.log(`[Ads API] Generation complete in ${duration}ms`);
    console.log(`[Ads API] Generated ${images.length} image(s)`);

    // Return success response
    return NextResponse.json({
      success: true,
      images: images.map(img => ({
        url: img.url,
        filename: img.filename,
      })),
      sessionId,
      generatedAt: new Date().toISOString(),
      duration: `${duration}ms`,
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('[Ads API] Error:', error);
    console.error('[Ads API] Stack:', error.stack);

    // Handle specific OpenAI errors
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        {
          success: false,
          error: 'OpenAI API configuration error. Please contact support.',
          code: 'API_KEY_ERROR',
        },
        { status: 500 }
      );
    }

    if (error.message?.includes('rate limit') || error.status === 429) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again in a few minutes.',
          code: 'RATE_LIMIT',
        },
        { status: 429 }
      );
    }

    if (error.message?.includes('content policy') || error.message?.includes('safety')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content violates OpenAI policies. Please adjust your description.',
          code: 'CONTENT_POLICY',
        },
        { status: 400 }
      );
    }

    if (error.message?.includes('insufficient_quota')) {
      return NextResponse.json(
        {
          success: false,
          error: 'OpenAI quota exceeded. Please contact support.',
          code: 'QUOTA_EXCEEDED',
        },
        { status: 500 }
      );
    }

    // Network/timeout errors
    if (error.message?.includes('network') || error.message?.includes('timeout')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Network error communicating with AI service. Please try again.',
          code: 'NETWORK_ERROR',
        },
        { status: 503 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate ads',
        code: 'GENERATION_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}
