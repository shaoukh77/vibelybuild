/**
 * Health Check API - Server Status
 * GET /api/health
 *
 * For Render.com and monitoring services
 * Returns server status and uptime
 */

import { NextResponse } from 'next/server';

const startTime = Date.now();

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: `${uptime}s`,
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  }, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}

// Also respond to HEAD requests
export async function HEAD(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}
